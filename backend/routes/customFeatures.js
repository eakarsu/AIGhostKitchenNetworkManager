const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require('../db');

const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

function parseAIJson(text) {
  if (typeof text !== 'string') return text;
  try { return JSON.parse(text); } catch (_) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }
  return { raw_response: text };
}

async function callOpenRouter(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Ghost Kitchen Network Manager',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.5,
      max_tokens: 2500,
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.choices[0].message.content;
}

async function saveAi(userId, tool, input, result) {
  try {
    await pool.query(
      'INSERT INTO ai_results (user_id, tool_name, input_snapshot, result, model) VALUES ($1,$2,$3,$4,$5)',
      [userId || null, tool, JSON.stringify(input || {}), JSON.stringify(result || {}), MODEL]
    );
  } catch (e) { console.error('saveAi failed:', e.message); }
}

// 1. Platform Webhook Ingester — receives DoorDash/UberEats/Grubhub webhooks, normalizes into orders,
//    AI routes the order to the correct kitchen station based on brand + station load.
router.post('/platform-webhook/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    const payload = req.body || {};

    // Persist raw event first so nothing is lost.
    const evt = await pool.query(
      'INSERT INTO platform_webhook_events (platform, external_order_id, raw_payload) VALUES ($1,$2,$3) RETURNING id',
      [platform, payload.order_id || payload.id || null, JSON.stringify(payload)]
    );
    const eventId = evt.rows[0].id;

    // Normalize into orders table — fields are best-effort guess from common platform shapes.
    const brandName = payload.brand || payload.restaurant_name || payload.store_name || 'unknown';
    const brandLookup = await pool.query('SELECT id FROM brands WHERE LOWER(name) = LOWER($1) LIMIT 1', [brandName]).catch(() => ({ rows: [] }));
    const brandId = brandLookup.rows[0]?.id || null;
    const orderTotal = parseFloat(payload.total || payload.subtotal || 0);
    const customerName = payload.customer_name || payload.customer?.name || 'platform_customer';

    let normalizedOrderId = null;
    try {
      const ord = await pool.query(
        `INSERT INTO orders (brand_id, customer_name, total, platform, status, created_at)
         VALUES ($1,$2,$3,$4,'received',NOW()) RETURNING id`,
        [brandId, customerName, orderTotal, platform]
      );
      normalizedOrderId = ord.rows[0].id;
    } catch (e) {
      // Schema variation: try minimal insert
      console.error('order insert (full) failed:', e.message);
    }

    // AI routing — pick best station given current station load
    const stationsR = await pool.query('SELECT id, name, status FROM kitchen_stations LIMIT 20').catch(() => ({ rows: [] }));
    const systemPrompt = `You are a ghost kitchen dispatcher. Given an order and current kitchen stations, pick the best station and why. Return STRICT JSON: {"recommended_station_id": <id|null>, "recommended_station_name": "", "rationale": "", "estimated_prep_minutes": <int>, "priority": "low|normal|high"}`;
    const userPrompt = `Platform: ${platform}\nOrder payload:\n${JSON.stringify(payload, null, 2)}\nBrand: ${brandName} (id ${brandId})\nAvailable stations:\n${JSON.stringify(stationsR.rows, null, 2)}\n\nReturn JSON only.`;

    let routing = null;
    try {
      const raw = await callOpenRouter(systemPrompt, userPrompt);
      routing = parseAIJson(raw);
    } catch (e) {
      console.error('routing AI call failed:', e.message);
      routing = { error: e.message };
    }

    await pool.query('UPDATE platform_webhook_events SET normalized_order_id = $1, ai_routing = $2 WHERE id = $3',
      [normalizedOrderId, JSON.stringify(routing), eventId]);
    await saveAi(null, 'platform-webhook-routing', { platform, brandName }, routing);

    res.status(201).json({ success: true, event_id: eventId, order_id: normalizedOrderId, routing });
  } catch (err) {
    console.error('platform-webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/platform-webhook/events', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM platform_webhook_events ORDER BY received_at DESC LIMIT 100');
    res.json({ data: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Auto-PO generation — extends low-stock-agent. Writes purchase_orders + items.
router.post('/auto-po/generate', async (req, res) => {
  try {
    const inventoryResult = await pool.query(
      `SELECT id, name as item_name, quantity, unit, min_threshold, supplier
       FROM inventory
       WHERE (quantity <= min_threshold AND min_threshold IS NOT NULL) OR quantity IS NULL
       ORDER BY supplier NULLS LAST, quantity ASC LIMIT 30`
    ).catch(() => ({ rows: [] }));
    const lowStockItems = inventoryResult.rows;
    if (lowStockItems.length === 0) {
      return res.json({ success: true, created_pos: 0, message: 'No low-stock items detected' });
    }

    const systemPrompt = `You generate ghost-kitchen purchase orders, grouped by supplier. Return STRICT JSON: {"purchase_orders": [{"supplier": "", "items": [{"inventory_id": <int>, "item_name": "", "quantity": <number>, "unit": "", "unit_cost_estimate": <number>}], "rationale": ""}], "summary": ""}`;
    const userPrompt = `Low-stock items:\n${JSON.stringify(lowStockItems, null, 2)}\nReturn JSON only.`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);

    let createdPos = 0;
    const pos = (parsed && Array.isArray(parsed.purchase_orders)) ? parsed.purchase_orders : [];
    for (const po of pos) {
      try {
        const items = Array.isArray(po.items) ? po.items : [];
        const totalEst = items.reduce((s, it) => s + (parseFloat(it.unit_cost_estimate || 0) * parseFloat(it.quantity || 0)), 0);
        const poRow = await pool.query(
          'INSERT INTO purchase_orders (supplier, status, total_estimated, ai_generated, notes, created_by) VALUES ($1,$2,$3,true,$4,$5) RETURNING id',
          [po.supplier || 'Unknown', 'pending_approval', totalEst, po.rationale || null, req.user?.id || null]
        );
        const poId = poRow.rows[0].id;
        for (const it of items) {
          await pool.query(
            'INSERT INTO purchase_order_items (purchase_order_id, inventory_id, item_name, quantity, unit, unit_cost) VALUES ($1,$2,$3,$4,$5,$6)',
            [poId, it.inventory_id || null, it.item_name || '', it.quantity || 0, it.unit || null, it.unit_cost_estimate || null]
          );
        }
        createdPos++;
      } catch (e) {
        console.error('PO insert failed:', e.message);
      }
    }
    await saveAi(req.user?.id, 'auto-po-generate', { item_count: lowStockItems.length }, { ...parsed, created_pos: createdPos });
    res.json({ success: true, created_pos: createdPos, recommendation: parsed });
  } catch (err) {
    console.error('auto-po error:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/auto-po/list', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT po.*, COALESCE(json_agg(json_build_object('item_name', poi.item_name, 'quantity', poi.quantity, 'unit', poi.unit)) FILTER (WHERE poi.id IS NOT NULL), '[]') AS items
      FROM purchase_orders po LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
      GROUP BY po.id ORDER BY po.created_at DESC LIMIT 50
    `);
    res.json({ data: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Temperature anomaly watcher — scans temperature_logs for HACCP excursions; AI summarizes; opens quality_control row.
router.post('/temp-anomaly/scan', async (req, res) => {
  try {
    // Heuristic — flags temps outside 0-5C cold or 60C+ hot for last 24h
    const tlogs = await pool.query(`
      SELECT * FROM temperature_logs
      WHERE recorded_at >= NOW() - INTERVAL '24 hours'
        AND ((temperature < 0 OR temperature > 5) AND (zone_type = 'cold' OR zone_type IS NULL)
          OR (temperature < 60 AND zone_type = 'hot'))
      ORDER BY recorded_at DESC LIMIT 50
    `).catch(() => ({ rows: [] }));
    if (tlogs.rows.length === 0) {
      return res.json({ success: true, anomalies: 0, message: 'No HACCP excursions in last 24h' });
    }
    const systemPrompt = `You are a HACCP food safety auditor. Summarize incidents and propose corrective actions. Return STRICT JSON: {"incidents": [{"log_id": <id>, "summary": "", "severity": "low|medium|high|critical", "corrective_action": "", "needs_qc_record": true|false}], "overall_summary": ""}`;
    const userPrompt = `Excursions:\n${JSON.stringify(tlogs.rows, null, 2)}\nReturn JSON only.`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);

    let qcCreated = 0;
    const incidents = (parsed && Array.isArray(parsed.incidents)) ? parsed.incidents : [];
    for (const inc of incidents) {
      if (inc.needs_qc_record) {
        try {
          await pool.query(
            `INSERT INTO quality_control (issue_description, severity, corrective_action, status, created_at)
             VALUES ($1, $2, $3, 'open', NOW())`,
            [inc.summary || 'HACCP temperature excursion', inc.severity || 'medium', inc.corrective_action || null]
          );
          qcCreated++;
        } catch (e) {
          // Schema variation tolerated
          console.error('quality_control insert failed:', e.message);
        }
      }
    }
    await saveAi(req.user?.id, 'temp-anomaly-scan', { anomaly_count: tlogs.rows.length }, { ...parsed, qc_created: qcCreated });
    res.json({ success: true, anomalies: tlogs.rows.length, qc_created: qcCreated, analysis: parsed });
  } catch (err) {
    console.error('temp-anomaly error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Demand forecast scheduler — runs per brand, persists into forecasts, flags capacity overruns.
router.post('/forecast-scheduler/run', async (req, res) => {
  try {
    const brands = await pool.query('SELECT id, name FROM brands LIMIT 50').catch(() => ({ rows: [] }));
    const created = [];
    for (const brand of brands.rows) {
      const histR = await pool.query(
        'SELECT DATE(created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE brand_id = $1 AND created_at >= NOW() - INTERVAL \'30 days\' GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30',
        [brand.id]
      ).catch(() => ({ rows: [] }));
      const stationCapR = await pool.query('SELECT COUNT(*) AS station_count FROM kitchen_stations').catch(() => ({ rows: [{ station_count: 1 }] }));
      const stationCapacity = parseInt(stationCapR.rows[0].station_count) * 60; // assume 60 orders/station/day

      const systemPrompt = `You are a ghost-kitchen demand forecaster. Given 30-day order history and station capacity, predict next 7 days. Return STRICT JSON: {"forecast": [{"date": "YYYY-MM-DD", "projected_orders": <int>, "projected_revenue": <number>, "capacity_warning": true|false}], "summary": ""}`;
      const userPrompt = `Brand: ${brand.name} (id ${brand.id})\nDaily history:\n${JSON.stringify(histR.rows, null, 2)}\nStation capacity (orders/day): ${stationCapacity}\nReturn JSON only.`;

      let parsed = null;
      try {
        const raw = await callOpenRouter(systemPrompt, userPrompt);
        parsed = parseAIJson(raw);
      } catch (e) {
        parsed = { error: e.message };
      }
      const days = (parsed && Array.isArray(parsed.forecast)) ? parsed.forecast : [];
      for (const d of days) {
        try {
          await pool.query(
            'INSERT INTO forecasts (brand_id, forecast_date, projected_orders, projected_revenue, capacity_warning, ai_payload) VALUES ($1,$2,$3,$4,$5,$6)',
            [brand.id, d.date, parseInt(d.projected_orders) || 0, parseFloat(d.projected_revenue) || 0, !!d.capacity_warning, JSON.stringify(d)]
          );
        } catch (e) { /* ignore duplicate-day inserts */ }
      }
      created.push({ brand_id: brand.id, brand_name: brand.name, forecast_days: days.length });
      await saveAi(req.user?.id, 'demand-forecast-scheduler', { brand_id: brand.id }, parsed);
    }
    res.json({ success: true, brands_forecasted: created.length, results: created });
  } catch (err) {
    console.error('forecast-scheduler error:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/forecast-scheduler/list', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT f.*, b.name AS brand_name FROM forecasts f LEFT JOIN brands b ON b.id = f.brand_id
      WHERE f.forecast_date >= CURRENT_DATE ORDER BY f.forecast_date ASC LIMIT 200
    `);
    res.json({ data: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Platform-fee margin guard — joins orders/platform_fees/food_costs, AI flags negative-margin
//    products on each platform and proposes platform-specific overrides.
router.post('/margin-guard/scan', async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT o.id AS order_id, o.platform, o.total AS gross, COALESCE(pf.fee_amount, 0) AS platform_fee
      FROM orders o LEFT JOIN platform_fees pf ON pf.order_id = o.id
      WHERE o.created_at >= NOW() - INTERVAL '30 days'
      LIMIT 500
    `).catch(() => ({ rows: [] }));
    const foodCosts = await pool.query('SELECT id, ingredient_cost, total_cost, selling_price FROM food_costs LIMIT 100').catch(() => ({ rows: [] }));

    const systemPrompt = `You are a ghost-kitchen margin guard. Given recent orders + platform fees + food costs, identify products/platforms that go negative-margin and propose platform-specific price overrides. Return STRICT JSON: {"flagged_items": [{"product_name": "", "platform": "", "current_price": <number>, "estimated_cost": <number>, "estimated_margin": <number>, "recommended_price": <number>, "reasoning": ""}], "overall_summary": ""}`;
    const userPrompt = `Orders sample:\n${JSON.stringify(orders.rows.slice(0, 50), null, 2)}\n\nFood costs:\n${JSON.stringify(foodCosts.rows, null, 2)}\n\nReturn JSON only.`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);

    let inserted = 0;
    const flagged = (parsed && Array.isArray(parsed.flagged_items)) ? parsed.flagged_items : [];
    for (const f of flagged) {
      try {
        await pool.query(
          'INSERT INTO price_overrides (product_name, platform, original_price, recommended_price, margin_alert, ai_reasoning) VALUES ($1,$2,$3,$4,true,$5)',
          [f.product_name || null, f.platform || null, f.current_price || null, f.recommended_price || null, f.reasoning || null]
        );
        inserted++;
      } catch (e) { /* ignore */ }
    }
    await saveAi(req.user?.id, 'margin-guard', { sample_orders: orders.rows.length }, { ...parsed, inserted });
    res.json({ success: true, inserted, analysis: parsed });
  } catch (err) {
    console.error('margin-guard error:', err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/margin-guard/overrides', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM price_overrides ORDER BY created_at DESC LIMIT 100');
    res.json({ data: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

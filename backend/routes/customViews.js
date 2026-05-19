// Custom Kitchen Views — 4 endpoints
//  VIZ:
//    GET  /hourly-order-volume    timeline of orders per hour, grouped by brand/kitchen
//    GET  /brand-performance      heatmap matrix (brand x kitchen) with revenue/orders
//  NON-VIZ:
//    GET  /prep-sheet/:date       deterministic PDF prep sheet (no external lib)
//    GET/POST/PUT/DELETE /pricing-rules   CRUD per platform/brand
//
// All handlers are defensive — empty tables return safe shapes; rate-limited at mount point.

const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- bootstrap table for pricing rules (idempotent) ---
async function ensurePricingTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_pricing_rules (
        id SERIAL PRIMARY KEY,
        platform VARCHAR NOT NULL,
        brand_id INTEGER,
        brand_name VARCHAR,
        rule_type VARCHAR NOT NULL DEFAULT 'markup',
        target VARCHAR,
        adjustment_pct NUMERIC(6,2) DEFAULT 0,
        min_price NUMERIC(10,2),
        max_price NUMERIC(10,2),
        active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Seed a couple of demo rows if empty
    const c = await pool.query('SELECT COUNT(*)::int AS n FROM menu_pricing_rules');
    if (c.rows[0].n === 0) {
      await pool.query(`INSERT INTO menu_pricing_rules
        (platform, brand_id, brand_name, rule_type, target, adjustment_pct, min_price, max_price, active, notes)
        VALUES
        ('doordash', NULL, 'All Brands', 'markup', 'all-items', 15.00, 5.99, 49.99, true, 'Cover commission + promo'),
        ('ubereats', NULL, 'All Brands', 'markup', 'all-items', 12.00, 5.99, 49.99, true, 'Standard UE markup'),
        ('grubhub',  NULL, 'All Brands', 'discount', 'combos',    8.00, 6.99, 39.99, true, 'Promo bundle discount')`);
    }
  } catch (e) {
    console.error('menu_pricing_rules init error:', e.message);
  }
}
ensurePricingTable();

// ============================================================
// 1) VIZ — Hourly order volume timeline (per brand/kitchen)
//     GET /hourly-order-volume?brand_id=&station_id=&days=7
// ============================================================
router.get('/hourly-order-volume', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(30, parseInt(req.query.days) || 7));
    const brandId = req.query.brand_id ? parseInt(req.query.brand_id) : null;
    const stationId = req.query.station_id ? parseInt(req.query.station_id) : null;

    const params = [days];
    let where = `WHERE o.created_at >= NOW() - ($1 || ' days')::interval`;
    if (brandId) { params.push(brandId); where += ` AND o.brand_id = $${params.length}`; }
    if (stationId) { params.push(stationId); where += ` AND o.station_id = $${params.length}`; }

    const sql = `
      SELECT
        EXTRACT(HOUR FROM o.created_at)::int AS hour,
        COALESCE(b.name, 'Unassigned') AS brand,
        COALESCE(ks.name, 'Unassigned') AS kitchen,
        COUNT(*)::int AS order_count,
        COALESCE(SUM(o.total), 0)::numeric(12,2) AS revenue,
        COALESCE(AVG(o.prep_time_minutes), 0)::numeric(6,2) AS avg_prep_min
      FROM orders o
      LEFT JOIN brands b ON b.id = o.brand_id
      LEFT JOIN kitchen_stations ks ON ks.id = o.station_id
      ${where}
      GROUP BY hour, brand, kitchen
      ORDER BY hour ASC, brand ASC`;

    const result = await pool.query(sql, params);

    // Compute totals per hour for sparkline overlay
    const totalsByHour = {};
    for (let h = 0; h < 24; h++) totalsByHour[h] = 0;
    result.rows.forEach(r => { totalsByHour[r.hour] = (totalsByHour[r.hour] || 0) + r.order_count; });

    res.json({
      window_days: days,
      rows: result.rows,
      hour_totals: Object.entries(totalsByHour).map(([h, n]) => ({ hour: parseInt(h), total: n })),
      filter: { brand_id: brandId, station_id: stationId },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('hourly-order-volume error:', err.message);
    res.status(200).json({
      window_days: parseInt(req.query.days) || 7,
      rows: [],
      hour_totals: Array.from({ length: 24 }, (_, h) => ({ hour: h, total: 0 })),
      error_soft: err.message,
      generated_at: new Date().toISOString(),
    });
  }
});

// ============================================================
// 2) VIZ — Brand performance heatmap (brand x kitchen)
//     GET /brand-performance?metric=revenue|orders|avg_ticket&days=30
// ============================================================
router.get('/brand-performance', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(90, parseInt(req.query.days) || 30));
    const metric = ['revenue', 'orders', 'avg_ticket'].includes(req.query.metric) ? req.query.metric : 'revenue';

    const sql = `
      SELECT
        COALESCE(b.name, 'Unassigned') AS brand,
        COALESCE(ks.name, 'Unassigned') AS kitchen,
        COUNT(*)::int AS orders,
        COALESCE(SUM(o.total), 0)::numeric(12,2) AS revenue,
        CASE WHEN COUNT(*) > 0
          THEN (COALESCE(SUM(o.total),0) / COUNT(*))::numeric(10,2)
          ELSE 0 END AS avg_ticket
      FROM orders o
      LEFT JOIN brands b ON b.id = o.brand_id
      LEFT JOIN kitchen_stations ks ON ks.id = o.station_id
      WHERE o.created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY brand, kitchen
      ORDER BY brand, kitchen`;
    const result = await pool.query(sql, [days]);

    // Pivot into matrix
    const brands = Array.from(new Set(result.rows.map(r => r.brand))).sort();
    const kitchens = Array.from(new Set(result.rows.map(r => r.kitchen))).sort();
    const cell = {};
    result.rows.forEach(r => {
      cell[`${r.brand}|${r.kitchen}`] = {
        revenue: parseFloat(r.revenue),
        orders: r.orders,
        avg_ticket: parseFloat(r.avg_ticket),
      };
    });

    const matrix = brands.map(brand => ({
      brand,
      cells: kitchens.map(kitchen => {
        const v = cell[`${brand}|${kitchen}`];
        return { kitchen, value: v ? v[metric] : 0, detail: v || { revenue: 0, orders: 0, avg_ticket: 0 } };
      }),
    }));

    const allValues = matrix.flatMap(r => r.cells.map(c => c.value));
    const max = allValues.length ? Math.max(...allValues) : 0;
    const min = allValues.length ? Math.min(...allValues) : 0;

    res.json({
      window_days: days,
      metric,
      brands,
      kitchens,
      matrix,
      scale: { min, max },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('brand-performance error:', err.message);
    res.status(200).json({
      window_days: parseInt(req.query.days) || 30,
      metric: req.query.metric || 'revenue',
      brands: [], kitchens: [], matrix: [], scale: { min: 0, max: 0 },
      error_soft: err.message,
      generated_at: new Date().toISOString(),
    });
  }
});

// ============================================================
// 3) NON-VIZ — Prep sheet PDF (minimal hand-rolled PDF, no deps)
//     GET /prep-sheet/:date  (defaults to today)
// ============================================================
function escapePdf(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(lines) {
  // Minimal one-page PDF with a single Helvetica text stream.
  const header = '%PDF-1.4\n';
  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');

  let stream = 'BT /F1 12 Tf 50 750 Td 14 TL\n';
  lines.forEach((line, i) => {
    stream += `(${escapePdf(line)}) Tj T*\n`;
  });
  stream += 'ET';
  const streamObj = `4 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`;
  objects.push(streamObj);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // Compute xref offsets
  let offset = header.length;
  const offsets = [];
  objects.forEach(o => { offsets.push(offset); offset += Buffer.byteLength(o); });

  const xrefStart = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(o => {
    xref += `${String(o).padStart(10, '0')} 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.concat([
    Buffer.from(header),
    Buffer.from(objects.join('')),
    Buffer.from(xref),
    Buffer.from(trailer),
  ]);
}

router.get('/prep-sheet/:date?', async (req, res) => {
  try {
    const dateStr = req.params.date || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
    }

    // Pull menu items / orders for that day to enumerate prep totals
    const orderSql = `
      SELECT COALESCE(b.name, 'Unassigned') AS brand,
             COALESCE(ks.name, 'Unassigned') AS kitchen,
             o.items, o.total, o.order_number, o.created_at
      FROM orders o
      LEFT JOIN brands b ON b.id = o.brand_id
      LEFT JOIN kitchen_stations ks ON ks.id = o.station_id
      WHERE DATE(o.created_at) = $1
      ORDER BY ks.name, b.name`;
    let orderRows = [];
    try { orderRows = (await pool.query(orderSql, [dateStr])).rows; } catch (_) {}

    const itemTallies = {}; // key: brand|kitchen|item → count
    orderRows.forEach(r => {
      let items = [];
      if (r.items) {
        try { items = JSON.parse(r.items); } catch (_) { items = String(r.items).split(',').map(s => ({ name: s.trim() })); }
      }
      items.forEach(it => {
        const name = (it && (it.name || it.item || it.title)) || 'Unnamed';
        const qty = parseInt(it && (it.qty || it.quantity)) || 1;
        const key = `${r.brand}|${r.kitchen}|${name}`;
        itemTallies[key] = (itemTallies[key] || 0) + qty;
      });
    });

    // Build line list
    const lines = [];
    lines.push(`Ghost Kitchen Prep Sheet  -  ${dateStr}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Orders on date: ${orderRows.length}`);
    lines.push('----------------------------------------');
    const sorted = Object.entries(itemTallies).sort();
    if (sorted.length === 0) {
      lines.push('(No order line-items found for this date.)');
      lines.push('Default prep targets:');
      lines.push('  Proteins: 20 lb (chicken), 15 lb (beef), 10 lb (fish)');
      lines.push('  Produce:  5 cs lettuce, 3 cs tomato, 4 cs onion');
      lines.push('  Sauces:   12 qt house sauce, 8 qt vinaigrette');
    } else {
      let curGroup = '';
      sorted.forEach(([key, count]) => {
        const [brand, kitchen, name] = key.split('|');
        const group = `${kitchen} / ${brand}`;
        if (group !== curGroup) {
          lines.push(`-- ${group} --`);
          curGroup = group;
        }
        lines.push(`  ${String(count).padStart(4)} x  ${name}`);
      });
    }
    lines.push('----------------------------------------');
    lines.push('Sign-off: ______________________');

    const pdf = buildPdf(lines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prep-sheet-${dateStr}.pdf"`);
    res.setHeader('X-Prep-Lines', String(lines.length));
    res.send(pdf);
  } catch (err) {
    console.error('prep-sheet error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 4) NON-VIZ — Pricing rules CRUD per platform/brand
// ============================================================
router.get('/pricing-rules', async (req, res) => {
  try {
    const params = [];
    let where = '';
    if (req.query.platform) { params.push(req.query.platform); where += `WHERE platform = $${params.length}`; }
    if (req.query.brand_id) { params.push(parseInt(req.query.brand_id)); where += `${where ? ' AND' : 'WHERE'} brand_id = $${params.length}`; }
    const sql = `SELECT * FROM menu_pricing_rules ${where} ORDER BY platform, brand_name, id DESC`;
    const r = await pool.query(sql, params);
    res.json({ data: r.rows, total: r.rows.length });
  } catch (err) {
    console.error('pricing-rules GET error:', err.message);
    res.status(200).json({ data: [], total: 0, error_soft: err.message });
  }
});

router.post('/pricing-rules', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.platform || !b.rule_type) return res.status(400).json({ error: 'platform and rule_type are required' });
    const sql = `INSERT INTO menu_pricing_rules
      (platform, brand_id, brand_name, rule_type, target, adjustment_pct, min_price, max_price, active, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const r = await pool.query(sql, [
      b.platform,
      b.brand_id || null,
      b.brand_name || null,
      b.rule_type,
      b.target || null,
      b.adjustment_pct ?? 0,
      b.min_price ?? null,
      b.max_price ?? null,
      b.active !== false,
      b.notes || null,
    ]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('pricing-rules POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/pricing-rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const b = req.body || {};
    const sql = `UPDATE menu_pricing_rules SET
      platform = COALESCE($2, platform),
      brand_id = COALESCE($3, brand_id),
      brand_name = COALESCE($4, brand_name),
      rule_type = COALESCE($5, rule_type),
      target = COALESCE($6, target),
      adjustment_pct = COALESCE($7, adjustment_pct),
      min_price = COALESCE($8, min_price),
      max_price = COALESCE($9, max_price),
      active = COALESCE($10, active),
      notes = COALESCE($11, notes),
      updated_at = NOW()
      WHERE id = $1 RETURNING *`;
    const r = await pool.query(sql, [
      id, b.platform || null, b.brand_id ?? null, b.brand_name || null,
      b.rule_type || null, b.target || null, b.adjustment_pct ?? null,
      b.min_price ?? null, b.max_price ?? null,
      typeof b.active === 'boolean' ? b.active : null,
      b.notes || null,
    ]);
    if (!r.rows[0]) return res.status(404).json({ error: 'rule not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('pricing-rules PUT error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pricing-rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await pool.query('DELETE FROM menu_pricing_rules WHERE id = $1 RETURNING id', [id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'rule not found' });
    res.json({ deleted: r.rows[0].id });
  } catch (err) {
    console.error('pricing-rules DELETE error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

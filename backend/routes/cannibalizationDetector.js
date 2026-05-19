// Cross-brand cannibalization detection flagging menu items that erode
// sister-brand sales.
// Audit: batch_04.md / AIGhostKitchenNetworkManager / Custom Feature Suggestions #2
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const fetch = require('node-fetch');

const router = express.Router();
router.use(authMiddleware);

async function callAI(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Ghost Kitchen - Cannibalization Detector'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2500
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || 'AI failed');
  return d.choices[0].message.content;
}

function parseJSON(t) {
  try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: t };
}

// POST /api/cannibalization/scan { lookback_days?, kitchen_id? }
router.post('/scan', async (req, res) => {
  try {
    const { lookback_days = 30, kitchen_id } = req.body || {};

    let brands = { rows: [] };
    let salesByBrandItem = { rows: [] };
    try { brands = await pool.query(`SELECT id, name FROM brands LIMIT 50`); } catch (_) {}
    try {
      salesByBrandItem = await pool.query(
        `SELECT b.id AS brand_id, b.name AS brand_name, mi.id AS item_id, mi.name AS item_name,
                COUNT(oi.*) AS units, COALESCE(SUM(oi.price * oi.quantity),0) AS revenue
         FROM brands b
         JOIN menus m ON m.brand_id = b.id
         JOIN menu_items mi ON mi.menu_id = m.id
         LEFT JOIN order_items oi ON oi.menu_item_id = mi.id
         LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at > NOW() - ($1 || ' days')::interval
         GROUP BY b.id, b.name, mi.id, mi.name
         ORDER BY revenue DESC NULLS LAST
         LIMIT 200`,
        [String(lookback_days)]
      );
    } catch (_) {}

    const systemPrompt = `You are a multi-brand restaurant analyst. Detect cross-brand menu cannibalization
within the same ghost kitchen network. Return STRICT JSON only.`;

    const userPrompt = `Lookback days: ${lookback_days}
Kitchen filter: ${kitchen_id || 'all'}
Brand catalog: ${JSON.stringify(brands.rows)}
Sales by brand/item: ${JSON.stringify(salesByBrandItem.rows.slice(0, 80))}

Return JSON:
{
  "summary": "...",
  "cannibalization_pairs": [
    { "brand_a": "string", "item_a": "string", "brand_b": "string", "item_b": "string", "overlap_descriptor": "ingredient|price|category|customer_segment", "estimated_erosion_pct": 0, "evidence": "string" }
  ],
  "menu_recommendations": [{ "brand": "string", "action": "differentiate|remove|reprice|reposition", "item": "string", "rationale": "string" }],
  "watchlist_items": ["..."],
  "disclaimer": "Heuristic detection; verify with cohort analysis."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ lookback_days, kitchen_id: kitchen_id || null, analysis: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cannibalization/brands
router.get('/brands', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT id, name FROM brands ORDER BY name LIMIT 100`)
      .catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

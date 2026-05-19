// Agentic kitchen automation prioritizing orders by delivery deadline and
// recommending station allocation.
// Audit: batch_04.md / AIGhostKitchenNetworkManager / Custom Feature Suggestions #1
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
      'X-Title': 'Ghost Kitchen - Agentic Automation'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
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

// POST /api/agentic-kitchen/dispatch
router.post('/dispatch', async (req, res) => {
  try {
    const { snapshot_minutes = 60 } = req.body || {};

    let openOrders = { rows: [] };
    let stations = { rows: [] };
    let staff = { rows: [] };
    try {
      openOrders = await pool.query(
        `SELECT id, brand_id, items, promised_at, status FROM orders
         WHERE status IN ('received','queued','in_progress')
           AND created_at > NOW() - ($1 || ' minutes')::interval
         ORDER BY promised_at NULLS LAST LIMIT 100`,
        [String(snapshot_minutes)]
      );
    } catch (_) {}
    try {
      stations = await pool.query(`SELECT id, name, capabilities FROM kitchen_stations LIMIT 30`);
    } catch (_) {}
    try {
      staff = await pool.query(`SELECT id, name, role, on_shift FROM labor_scheduling WHERE on_shift = true LIMIT 30`);
    } catch (_) {}

    const systemPrompt = `You are an agentic kitchen orchestrator. Given open orders, station capabilities, and
on-shift staff, output a prioritized dispatch plan that minimizes late orders and balances station load. Return
STRICT JSON only.`;

    const userPrompt = `Open orders: ${JSON.stringify(openOrders.rows.slice(0, 40))}
Stations: ${JSON.stringify(stations.rows)}
On-shift staff: ${JSON.stringify(staff.rows)}

Return JSON:
{
  "summary": "...",
  "dispatch_plan": [
    { "order_id": "string", "priority_score_0_100": 0, "assigned_station_id": 0, "assigned_staff_id": 0, "expected_ready_in_minutes": 0, "rationale": "string" }
  ],
  "station_load": [{ "station_id": 0, "utilization_pct": 0, "queue_depth": 0 }],
  "bottlenecks": [{ "station_id": 0, "issue": "string", "mitigation": "string" }],
  "expediter_alerts": ["..."],
  "disclaimer": "Plan is advisory; human expediter retains override."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ snapshot_minutes, plan: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agentic-kitchen/open-orders
router.get('/open-orders', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, brand_id, status, promised_at FROM orders
       WHERE status IN ('received','queued','in_progress') ORDER BY promised_at NULLS LAST LIMIT 50`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

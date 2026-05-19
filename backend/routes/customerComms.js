/*
 * routes/customerComms.js — Customer communication queue.
 *
 * Pass 5 mechanical addition: closes audit "No customer communication (order
 * status, promos)" non-AI gap, and backlog "Customer communication channel"
 * NEEDS-PRODUCT-DECISION — implemented as a queue + template registry that
 * can be sent later via Twilio / SendGrid (those remain NEEDS-CREDS).
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

const ALLOWED_CHANNELS = ['sms', 'email', 'push', 'in_app'];
const ALLOWED_STATUS = ['queued', 'sent', 'failed', 'cancelled'];
const ALLOWED_INTENTS = ['order_status', 'order_ready', 'promo', 'feedback_request', 'apology', 'recovery'];

let _ensured = false;
async function ensureTables() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comm_templates (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      channel TEXT NOT NULL,
      intent TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comm_queue (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      order_id INTEGER,
      channel TEXT NOT NULL,
      intent TEXT NOT NULL,
      to_address TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      send_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_queue_status ON comm_queue(status, send_after);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTables(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });

// ---- templates ----
router.get('/templates', async (req, res) => {
  try { res.json((await pool.query(`SELECT * FROM comm_templates ORDER BY key`)).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/templates', async (req, res) => {
  try {
    const { key, channel, intent, subject = null, body } = req.body || {};
    if (!key || !channel || !intent || !body) return res.status(400).json({ error: 'key, channel, intent, body required' });
    if (!ALLOWED_CHANNELS.includes(channel)) return res.status(400).json({ error: `channel must be ${ALLOWED_CHANNELS.join(', ')}` });
    if (!ALLOWED_INTENTS.includes(intent)) return res.status(400).json({ error: `intent must be ${ALLOWED_INTENTS.join(', ')}` });
    const r = await pool.query(
      `INSERT INTO comm_templates (key, channel, intent, subject, body) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (key) DO UPDATE SET channel=EXCLUDED.channel, intent=EXCLUDED.intent, subject=EXCLUDED.subject, body=EXCLUDED.body RETURNING *`,
      [key, channel, intent, subject, body]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- queue ----
function fillTemplate(body, vars) {
  return String(body).replace(/\{\{(\w+)\}\}/g, (_, k) => (vars && vars[k] != null ? String(vars[k]) : ''));
}

router.post('/queue', async (req, res) => {
  try {
    const { customer_id = null, order_id = null, channel, intent, to_address, subject = null, body, template_key, vars = {}, send_after = null } = req.body || {};
    let finalSubject = subject;
    let finalBody = body;
    let finalChannel = channel;
    let finalIntent = intent;
    if (template_key) {
      const t = await pool.query(`SELECT * FROM comm_templates WHERE key=$1`, [template_key]);
      if (t.rowCount === 0) return res.status(404).json({ error: `template ${template_key} not found` });
      finalChannel = finalChannel || t.rows[0].channel;
      finalIntent = finalIntent || t.rows[0].intent;
      finalSubject = finalSubject || t.rows[0].subject;
      finalBody = finalBody || fillTemplate(t.rows[0].body, vars);
    }
    if (!finalChannel || !finalIntent || !to_address || !finalBody) return res.status(400).json({ error: 'channel, intent, to_address, body (or template_key) required' });
    if (!ALLOWED_CHANNELS.includes(finalChannel)) return res.status(400).json({ error: `channel must be ${ALLOWED_CHANNELS.join(', ')}` });
    const r = await pool.query(
      `INSERT INTO comm_queue (customer_id, order_id, channel, intent, to_address, subject, body, send_after)
       VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8::timestamp, CURRENT_TIMESTAMP)) RETURNING *`,
      [customer_id, order_id, finalChannel, finalIntent, to_address, finalSubject, finalBody, send_after]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/queue', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const params = []; const clauses = [];
    if (status) { params.push(status); clauses.push(`status=$${params.length}`); }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const r = await pool.query(`SELECT * FROM comm_queue ${where} ORDER BY send_after DESC LIMIT ${parseInt(limit, 10)}`, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/queue/:id/transition', async (req, res) => {
  try {
    const { status, last_error = null } = req.body || {};
    if (!ALLOWED_STATUS.includes(status)) return res.status(400).json({ error: `status must be ${ALLOWED_STATUS.join(', ')}` });
    const r = await pool.query(
      `UPDATE comm_queue SET status=$1, last_error=$2, attempts=attempts+1, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,
      [status, last_error, req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/dispatch/next', async (req, res) => {
  // Returns the next batch of queued messages ready to send.
  // Real sending requires NEEDS-CREDS (Twilio/SendGrid/FCM); this surfaces them so a worker can pick up.
  try {
    const r = await pool.query(
      `SELECT * FROM comm_queue WHERE status='queued' AND send_after <= CURRENT_TIMESTAMP ORDER BY send_after ASC LIMIT 25`
    );
    res.json({ batch: r.rows, sender_required_env: { sms: ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER'], email: ['SENDGRID_API_KEY','SENDGRID_FROM_EMAIL'] } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

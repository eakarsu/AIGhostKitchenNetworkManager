/*
 * routes/compliance.js — Compliance / certification tracking.
 *
 * Pass 5 mechanical addition: closes audit "No compliance/certifications
 * tracking" non-AI gap and backlog "Compliance / certification tracking
 * workflow". Mechanical CRUD with deterministic expiry-window logic
 * (60/30/7-day windows). No AI calls.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

const TYPES = ['food_handler', 'manager_servsafe', 'health_permit', 'business_license', 'fire_inspection', 'liquor_license', 'employer_id', 'other'];

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS compliance_certifications (
      id SERIAL PRIMARY KEY,
      kitchen_id INTEGER,
      brand_id INTEGER,
      employee_name TEXT,
      cert_type TEXT NOT NULL,
      cert_number TEXT,
      issued_by TEXT,
      issued_date DATE,
      expires_on DATE,
      jurisdiction TEXT,
      file_url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cert_expires ON compliance_certifications(expires_on);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });

router.get('/types', (req, res) => res.json({ types: TYPES }));

router.get('/', async (req, res) => {
  try {
    const { type, kitchen_id, brand_id, expiring_in_days } = req.query;
    const clauses = []; const params = [];
    if (type) { params.push(type); clauses.push(`cert_type=$${params.length}`); }
    if (kitchen_id) { params.push(kitchen_id); clauses.push(`kitchen_id=$${params.length}`); }
    if (brand_id) { params.push(brand_id); clauses.push(`brand_id=$${params.length}`); }
    if (expiring_in_days) {
      params.push(parseInt(expiring_in_days, 10));
      clauses.push(`expires_on <= CURRENT_DATE + ($${params.length} || ' days')::interval`);
    }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const r = await pool.query(`SELECT * FROM compliance_certifications ${where} ORDER BY expires_on ASC NULLS LAST`, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.cert_type) return res.status(400).json({ error: 'cert_type required' });
    if (!TYPES.includes(b.cert_type)) return res.status(400).json({ error: `cert_type must be ${TYPES.join(', ')}` });
    const r = await pool.query(
      `INSERT INTO compliance_certifications (kitchen_id, brand_id, employee_name, cert_type, cert_number, issued_by, issued_date, expires_on, jurisdiction, file_url, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [b.kitchen_id || null, b.brand_id || null, b.employee_name || null, b.cert_type, b.cert_number || null, b.issued_by || null, b.issued_date || null, b.expires_on || null, b.jurisdiction || null, b.file_url || null, b.notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['kitchen_id','brand_id','employee_name','cert_type','cert_number','issued_by','issued_date','expires_on','jurisdiction','file_url','notes'];
    const sets = []; const params = [];
    fields.forEach((f) => { if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f}=$${params.length}`); } });
    if (sets.length === 0) return res.status(400).json({ error: 'no fields' });
    sets.push('updated_at=CURRENT_TIMESTAMP');
    params.push(req.params.id);
    const r = await pool.query(`UPDATE compliance_certifications SET ${sets.join(', ')} WHERE id=$${params.length} RETURNING *`, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM compliance_certifications WHERE id=$1`, [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/dashboard', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE expires_on < CURRENT_DATE)::int AS expired,
        COUNT(*) FILTER (WHERE expires_on BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days')::int AS expiring_7d,
        COUNT(*) FILTER (WHERE expires_on BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')::int AS expiring_30d,
        COUNT(*) FILTER (WHERE expires_on BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days')::int AS expiring_60d
      FROM compliance_certifications
    `);
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

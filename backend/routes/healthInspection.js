const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all health inspections
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM health_inspections ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single health inspection
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM health_inspections WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Health inspection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create health inspection
router.post('/', async (req, res) => {
  try {
    const { inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection } = req.body;
    const result = await pool.query(
      `INSERT INTO health_inspections (inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update health inspection
router.put('/:id', async (req, res) => {
  try {
    const { inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection } = req.body;
    const result = await pool.query(
      `UPDATE health_inspections SET inspection_date = $1, inspector_name = $2, score = $3, max_score = $4, status = $5, findings = $6, corrective_actions = $7, next_inspection = $8
       WHERE id = $9 RETURNING *`,
      [inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Health inspection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE health inspection
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM health_inspections WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Health inspection not found' });
    res.json({ message: 'Health inspection deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all waste records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single waste record
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Waste record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create waste record
router.post('/', async (req, res) => {
  try {
    const { brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date } = req.body;
    const result = await pool.query(
      `INSERT INTO waste_records (brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update waste record
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date } = req.body;
    const result = await pool.query(
      `UPDATE waste_records SET brand_id = $1, item_name = $2, category = $3, quantity = $4, unit = $5, reason = $6, cost_impact = $7, recorded_by = $8, waste_date = $9
       WHERE id = $10 RETURNING *`,
      [brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Waste record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE waste record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM waste_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Waste record not found' });
    res.json({ message: 'Waste record deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

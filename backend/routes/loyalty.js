const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all loyalty programs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loyalty_programs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single loyalty program
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loyalty_programs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Loyalty program not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create loyalty program
router.post('/', async (req, res) => {
  try {
    const { customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity } = req.body;
    const result = await pool.query(
      `INSERT INTO loyalty_programs (customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update loyalty program
router.put('/:id', async (req, res) => {
  try {
    const { customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity } = req.body;
    const result = await pool.query(
      `UPDATE loyalty_programs SET customer_id = $1, brand_id = $2, points = $3, tier = $4, total_earned = $5, total_redeemed = $6, last_activity = $7
       WHERE id = $8 RETURNING *`,
      [customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Loyalty program not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE loyalty program
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM loyalty_programs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Loyalty program not found' });
    res.json({ message: 'Loyalty program deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

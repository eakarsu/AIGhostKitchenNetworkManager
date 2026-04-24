const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all platform fees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platform_fees ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single platform fee
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platform_fees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Platform fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create platform fee
router.post('/', async (req, res) => {
  try {
    const { platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees } = req.body;
    const result = await pool.query(
      `INSERT INTO platform_fees (platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update platform fee
router.put('/:id', async (req, res) => {
  try {
    const { platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees } = req.body;
    const result = await pool.query(
      `UPDATE platform_fees SET platform = $1, brand_id = $2, fee_type = $3, percentage = $4, flat_fee = $5, period = $6, total_orders = $7, total_fees = $8
       WHERE id = $9 RETURNING *`,
      [platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Platform fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE platform fee
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM platform_fees WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Platform fee not found' });
    res.json({ message: 'Platform fee deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

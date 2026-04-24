const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all revenue records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revenue_records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single revenue record
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revenue_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Revenue record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create revenue record
router.post('/', async (req, res) => {
  try {
    const { brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value } = req.body;
    const result = await pool.query(
      `INSERT INTO revenue_records (brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update revenue record
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value } = req.body;
    const result = await pool.query(
      `UPDATE revenue_records SET brand_id = $1, platform = $2, date = $3, orders_count = $4, gross_revenue = $5, platform_fees = $6, net_revenue = $7, avg_order_value = $8
       WHERE id = $9 RETURNING *`,
      [brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Revenue record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE revenue record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM revenue_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Revenue record not found' });
    res.json({ message: 'Revenue record deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

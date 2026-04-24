const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all profitability records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profitability ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single profitability record
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profitability WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profitability record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create profitability record
router.post('/', async (req, res) => {
  try {
    const { brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin } = req.body;
    const result = await pool.query(
      `INSERT INTO profitability (brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update profitability record
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin } = req.body;
    const result = await pool.query(
      `UPDATE profitability SET brand_id = $1, kitchen_location = $2, period = $3, revenue = $4, food_cost = $5, labor_cost = $6, packaging_cost = $7, platform_fees = $8, overhead = $9, net_profit = $10, profit_margin = $11
       WHERE id = $12 RETURNING *`,
      [brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profitability record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE profitability record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM profitability WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profitability record not found' });
    res.json({ message: 'Profitability record deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all food costs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_costs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single food cost
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_costs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food cost record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new food cost record
router.post('/', async (req, res) => {
  try {
    const { brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period } = req.body;
    const result = await pool.query(
      'INSERT INTO food_costs (brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update food cost record
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period } = req.body;
    const result = await pool.query(
      'UPDATE food_costs SET brand_id = $1, menu_item_id = $2, ingredient_cost = $3, packaging_cost = $4, labor_cost = $5, total_cost = $6, selling_price = $7, profit_margin = $8, period = $9 WHERE id = $10 RETURNING *',
      [brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food cost record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete food cost record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM food_costs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food cost record not found' });
    }
    res.json({ message: 'Food cost record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory (name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET name = $1, category = $2, quantity = $3, unit = $4, min_threshold = $5, cost_per_unit = $6, supplier = $7, shared_across_brands = $8, last_restocked = $9 WHERE id = $10 RETURNING *',
      [name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

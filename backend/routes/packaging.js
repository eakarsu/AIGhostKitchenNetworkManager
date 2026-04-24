const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all packaging items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packaging ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single packaging item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packaging WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Packaging item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new packaging item
router.post('/', async (req, res) => {
  try {
    const { brand_id, name, type, cost, stock_quantity, supplier, eco_friendly } = req.body;
    const result = await pool.query(
      'INSERT INTO packaging (brand_id, name, type, cost, stock_quantity, supplier, eco_friendly) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [brand_id, name, type, cost, stock_quantity, supplier, eco_friendly]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update packaging item
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, name, type, cost, stock_quantity, supplier, eco_friendly } = req.body;
    const result = await pool.query(
      'UPDATE packaging SET brand_id = $1, name = $2, type = $3, cost = $4, stock_quantity = $5, supplier = $6, eco_friendly = $7 WHERE id = $8 RETURNING *',
      [brand_id, name, type, cost, stock_quantity, supplier, eco_friendly, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Packaging item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete packaging item
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM packaging WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Packaging item not found' });
    }
    res.json({ message: 'Packaging item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

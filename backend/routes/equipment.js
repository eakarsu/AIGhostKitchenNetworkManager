const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single equipment
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create equipment
router.post('/', async (req, res) => {
  try {
    const { name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost } = req.body;
    const result = await pool.query(
      `INSERT INTO equipment (name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  try {
    const { name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost } = req.body;
    const result = await pool.query(
      `UPDATE equipment SET name = $1, station_id = $2, type = $3, brand = $4, model = $5, purchase_date = $6, last_maintenance = $7, next_maintenance = $8, status = $9, warranty_until = $10, cost = $11
       WHERE id = $12 RETURNING *`,
      [name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Equipment not found' });
    res.json({ message: 'Equipment deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

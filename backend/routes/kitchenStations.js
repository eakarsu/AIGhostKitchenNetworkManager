const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all kitchen stations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kitchen_stations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single kitchen station
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kitchen_stations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kitchen station not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new kitchen station
router.post('/', async (req, res) => {
  try {
    const { name, station_type, capacity, status, assigned_brands, equipment } = req.body;
    const result = await pool.query(
      'INSERT INTO kitchen_stations (name, station_type, capacity, status, assigned_brands, equipment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, station_type, capacity, status, assigned_brands, equipment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update kitchen station
router.put('/:id', async (req, res) => {
  try {
    const { name, station_type, capacity, status, assigned_brands, equipment } = req.body;
    const result = await pool.query(
      'UPDATE kitchen_stations SET name = $1, station_type = $2, capacity = $3, status = $4, assigned_brands = $5, equipment = $6 WHERE id = $7 RETURNING *',
      [name, station_type, capacity, status, assigned_brands, equipment, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kitchen station not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete kitchen station
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM kitchen_stations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kitchen station not found' });
    }
    res.json({ message: 'Kitchen station deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

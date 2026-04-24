const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all drivers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single driver
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new driver
router.post('/', async (req, res) => {
  try {
    const { name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries } = req.body;
    const result = await pool.query(
      'INSERT INTO drivers (name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update driver
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries } = req.body;
    const result = await pool.query(
      'UPDATE drivers SET name = $1, phone = $2, vehicle_type = $3, license_plate = $4, status = $5, current_location = $6, rating = $7, total_deliveries = $8 WHERE id = $9 RETURNING *',
      [name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete driver
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

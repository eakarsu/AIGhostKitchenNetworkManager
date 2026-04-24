const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all delivery zones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_zones ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single delivery zone
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create delivery zone
router.post('/', async (req, res) => {
  try {
    const { name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status } = req.body;
    const result = await pool.query(
      `INSERT INTO delivery_zones (name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update delivery zone
router.put('/:id', async (req, res) => {
  try {
    const { name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status } = req.body;
    const result = await pool.query(
      `UPDATE delivery_zones SET name = $1, zone_code = $2, radius_miles = $3, base_delivery_fee = $4, estimated_time_minutes = $5, active_drivers = $6, status = $7
       WHERE id = $8 RETURNING *`,
      [name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE delivery zone
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM delivery_zones WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery zone not found' });
    res.json({ message: 'Delivery zone deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

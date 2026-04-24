const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all temperature logs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM temperature_logs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single temperature log
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM temperature_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Temperature log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new temperature log
router.post('/', async (req, res) => {
  try {
    const { station_id, equipment_name, temperature, unit, status, recorded_by, notes, recorded_at } = req.body;
    const result = await pool.query(
      'INSERT INTO temperature_logs (station_id, equipment_name, temperature, unit, status, recorded_by, notes, recorded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [station_id, equipment_name, temperature, unit, status, recorded_by, notes, recorded_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update temperature log
router.put('/:id', async (req, res) => {
  try {
    const { station_id, equipment_name, temperature, unit, status, recorded_by, notes, recorded_at } = req.body;
    const result = await pool.query(
      'UPDATE temperature_logs SET station_id = $1, equipment_name = $2, temperature = $3, unit = $4, status = $5, recorded_by = $6, notes = $7, recorded_at = $8 WHERE id = $9 RETURNING *',
      [station_id, equipment_name, temperature, unit, status, recorded_by, notes, recorded_at, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Temperature log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete temperature log
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM temperature_logs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Temperature log not found' });
    }
    res.json({ message: 'Temperature log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

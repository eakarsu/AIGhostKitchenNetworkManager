const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all schedules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kitchen_schedules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single schedule
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kitchen_schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new schedule
router.post('/', async (req, res) => {
  try {
    const { station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO kitchen_schedules (station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update schedule
router.put('/:id', async (req, res) => {
  try {
    const { station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes } = req.body;
    const result = await pool.query(
      'UPDATE kitchen_schedules SET station_id = $1, brand_id = $2, day_of_week = $3, start_time = $4, end_time = $5, staff_count = $6, notes = $7 WHERE id = $8 RETURNING *',
      [station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM kitchen_schedules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

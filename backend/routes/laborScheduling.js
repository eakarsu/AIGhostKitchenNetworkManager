const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all labor schedules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM labor_schedules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single labor schedule
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM labor_schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Labor schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create labor schedule
router.post('/', async (req, res) => {
  try {
    const { employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status } = req.body;
    const result = await pool.query(
      `INSERT INTO labor_schedules (employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update labor schedule
router.put('/:id', async (req, res) => {
  try {
    const { employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status } = req.body;
    const result = await pool.query(
      `UPDATE labor_schedules SET employee_name = $1, role = $2, station_id = $3, shift_date = $4, start_time = $5, end_time = $6, hourly_rate = $7, status = $8
       WHERE id = $9 RETURNING *`,
      [employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Labor schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE labor schedule
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM labor_schedules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Labor schedule not found' });
    res.json({ message: 'Labor schedule deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

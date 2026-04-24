const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all cleaning schedules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleaning_schedules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single cleaning schedule
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cleaning_schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cleaning schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create cleaning schedule
router.post('/', async (req, res) => {
  try {
    const { area, task, frequency, assigned_to, last_completed, next_due, status, checklist } = req.body;
    const result = await pool.query(
      `INSERT INTO cleaning_schedules (area, task, frequency, assigned_to, last_completed, next_due, status, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [area, task, frequency, assigned_to, last_completed, next_due, status, checklist]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update cleaning schedule
router.put('/:id', async (req, res) => {
  try {
    const { area, task, frequency, assigned_to, last_completed, next_due, status, checklist } = req.body;
    const result = await pool.query(
      `UPDATE cleaning_schedules SET area = $1, task = $2, frequency = $3, assigned_to = $4, last_completed = $5, next_due = $6, status = $7, checklist = $8
       WHERE id = $9 RETURNING *`,
      [area, task, frequency, assigned_to, last_completed, next_due, status, checklist, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cleaning schedule not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cleaning schedule
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cleaning_schedules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cleaning schedule not found' });
    res.json({ message: 'Cleaning schedule deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

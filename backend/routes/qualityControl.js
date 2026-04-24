const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all quality checklists
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quality_checklists ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single quality checklist
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quality_checklists WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quality checklist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new quality checklist
router.post('/', async (req, res) => {
  try {
    const { station_id, checklist_type, items, completed_by, score, notes, completed_at } = req.body;
    const result = await pool.query(
      'INSERT INTO quality_checklists (station_id, checklist_type, items, completed_by, score, notes, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [station_id, checklist_type, items, completed_by, score, notes, completed_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update quality checklist
router.put('/:id', async (req, res) => {
  try {
    const { station_id, checklist_type, items, completed_by, score, notes, completed_at } = req.body;
    const result = await pool.query(
      'UPDATE quality_checklists SET station_id = $1, checklist_type = $2, items = $3, completed_by = $4, score = $5, notes = $6, completed_at = $7 WHERE id = $8 RETURNING *',
      [station_id, checklist_type, items, completed_by, score, notes, completed_at, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quality checklist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete quality checklist
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM quality_checklists WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quality checklist not found' });
    }
    res.json({ message: 'Quality checklist deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all brands
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single brand
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new brand
router.post('/', async (req, res) => {
  try {
    const { name, concept, cuisine_type, description, logo_url, status } = req.body;
    const result = await pool.query(
      'INSERT INTO brands (name, concept, cuisine_type, description, logo_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, concept, cuisine_type, description, logo_url, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update brand
router.put('/:id', async (req, res) => {
  try {
    const { name, concept, cuisine_type, description, logo_url, status } = req.body;
    const result = await pool.query(
      'UPDATE brands SET name = $1, concept = $2, cuisine_type = $3, description = $4, logo_url = $5, status = $6 WHERE id = $7 RETURNING *',
      [name, concept, cuisine_type, description, logo_url, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete brand
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all menu items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /brand/:brandId - get menu items for a specific brand
router.get('/brand/:brandId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE brand_id = $1 ORDER BY created_at DESC',
      [req.params.brandId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single menu item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new menu item
router.post('/', async (req, res) => {
  try {
    const { brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO menu_items (brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update menu item
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url } = req.body;
    const result = await pool.query(
      'UPDATE menu_items SET brand_id = $1, name = $2, description = $3, price = $4, category = $5, is_available = $6, prep_time_minutes = $7, calories = $8, image_url = $9 WHERE id = $10 RETURNING *',
      [brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete menu item
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

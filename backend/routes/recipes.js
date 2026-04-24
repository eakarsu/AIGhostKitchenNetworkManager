const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all recipes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single recipe
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new recipe
router.post('/', async (req, res) => {
  try {
    const { brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving } = req.body;
    const result = await pool.query(
      'INSERT INTO recipes (brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update recipe
router.put('/:id', async (req, res) => {
  try {
    const { brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving } = req.body;
    const result = await pool.query(
      'UPDATE recipes SET brand_id = $1, name = $2, description = $3, ingredients = $4, instructions = $5, prep_time_minutes = $6, cook_time_minutes = $7, servings = $8, cost_per_serving = $9 WHERE id = $10 RETURNING *',
      [brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete recipe
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

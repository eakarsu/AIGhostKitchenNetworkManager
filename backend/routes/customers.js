const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date } = req.body;
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, total_orders = $5, total_spent = $6, favorite_brand = $7, preferred_platform = $8, joined_date = $9
       WHERE id = $10 RETURNING *`,
      [name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET / - list all orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - get single order
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - create new order
router.post('/', async (req, res) => {
  try {
    const { order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes } = req.body;
    const result = await pool.query(
      'INSERT INTO orders (order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - update order
router.put('/:id', async (req, res) => {
  try {
    const { order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes } = req.body;
    const result = await pool.query(
      'UPDATE orders SET order_number = $1, brand_id = $2, platform = $3, customer_name = $4, items = $5, total = $6, status = $7, station_id = $8, delivery_address = $9, driver_id = $10, prep_time_minutes = $11 WHERE id = $12 RETURNING *',
      [order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/status - update just the status field
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - delete order
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

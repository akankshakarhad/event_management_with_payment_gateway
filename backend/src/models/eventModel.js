const { pool } = require('../config/db');

const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM events ORDER BY title ASC');
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return rows[0] || null;
};

module.exports = { findAll, findById };

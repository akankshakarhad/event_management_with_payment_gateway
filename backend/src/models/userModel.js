const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
};

const create = async ({ name, email, phone, college }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, phone, college)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, phone, college]
  );
  return rows[0];
};

module.exports = { findByEmail, create };

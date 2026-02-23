const { pool } = require('../config/db');

// Get all users with their registrations, optional filters
const getUsers = async ({ status, eventId } = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`r.status = $${idx++}`);
    values.push(status.toUpperCase());
  }

  if (eventId) {
    conditions.push(`e.id = $${idx++}`);
    values.push(eventId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       u.id           AS user_id,
       u.name,
       u.email,
       u.phone,
       u.college,
       u.created_at,
       e.id           AS event_id,
       e.title        AS event_title,
       e.price,
       r.id           AS registration_id,
       r.status
     FROM registrations r
     JOIN users  u ON u.id = r.user_id
     JOIN events e ON e.id = r.event_id
     ${where}
     ORDER BY u.name ASC, e.title ASC`,
    values
  );

  return rows;
};

module.exports = { getUsers };

const { pool } = require('../config/db');

const create = async (userId, eventId, modeOfParticipation = '') => {
  const { rows } = await pool.query(
    `INSERT INTO registrations (user_id, event_id, mode_of_participation)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING *`,
    [userId, eventId, modeOfParticipation]
  );
  return rows[0] || null;
};

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT
       r.id           AS registration_id,
       r.status,
       u.id           AS user_id,
       u.name,
       u.email,
       u.phone,
       u.college,
       e.id           AS event_id,
       e.title        AS event_title,
       e.price
     FROM registrations r
     JOIN users  u ON u.id = r.user_id
     JOIN events e ON e.id = r.event_id
     ORDER BY u.name ASC, e.title ASC`
  );
  return rows;
};

const updateStatus = async (userId, eventId, status) => {
  const { rows } = await pool.query(
    `UPDATE registrations
     SET status = $1
     WHERE user_id = $2 AND event_id = $3
     RETURNING *`,
    [status, userId, eventId]
  );
  return rows[0] || null;
};

const markAllPaidForUser = async (userId) => {
  const { rows } = await pool.query(
    `UPDATE registrations
     SET status = 'PAID'
     WHERE user_id = $1 AND status = 'PENDING'
     RETURNING *`,
    [userId]
  );
  return rows;
};

// Mark PENDING registrations PAID for multiple users (group payment)
const markAllPaidForUsers = async (userIds) => {
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE registrations
     SET status = 'PAID'
     WHERE user_id IN (${placeholders}) AND status = 'PENDING'
     RETURNING *`,
    userIds
  );
  return rows;
};

module.exports = { create, findAll, updateStatus, markAllPaidForUser, markAllPaidForUsers };

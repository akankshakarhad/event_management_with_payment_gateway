const { pool } = require('../config/db');

// Create a PENDING payment with a generated reference ID
const createPending = async (userId, amount, referenceId, userIds = [], eventIds = []) => {
  const { rows } = await pool.query(
    `INSERT INTO payments (user_id, amount, reference_id, user_ids, event_ids, status)
     VALUES ($1, $2, $3, $4, $5, 'PENDING')
     RETURNING *`,
    [userId, amount, referenceId, JSON.stringify(userIds), JSON.stringify(eventIds)]
  );
  return rows[0];
};

// Find payment by reference ID
const findByReferenceId = async (referenceId) => {
  const { rows } = await pool.query(
    `SELECT * FROM payments WHERE reference_id = $1`,
    [referenceId]
  );
  return rows[0] || null;
};

// Find payment by reference ID with user info joined
const findByReferenceIdWithUser = async (referenceId) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name, u.email, u.phone, u.college
     FROM payments p
     JOIN users u ON u.id = p.user_id
     WHERE p.reference_id = $1`,
    [referenceId]
  );
  return rows[0] || null;
};

// Check if a UTR has already been submitted (duplicate prevention)
const isUtrDuplicate = async (utr) => {
  const { rows } = await pool.query(
    `SELECT id FROM payments WHERE UPPER(utr) = UPPER($1)`,
    [utr]
  );
  return rows.length > 0;
};

// User submits UTR + screenshot → set status to VERIFICATION_PENDING
const submitPayment = async (referenceId, utr, screenshotUrl) => {
  const { rows } = await pool.query(
    `UPDATE payments
     SET utr = $1, screenshot_url = $2, status = 'VERIFICATION_PENDING'
     WHERE reference_id = $3 AND status = 'PENDING'
     RETURNING *`,
    [utr.toUpperCase(), screenshotUrl, referenceId]
  );
  return rows[0] || null;
};

// Admin approves payment
const approvePayment = async (paymentId) => {
  const { rows } = await pool.query(
    `UPDATE payments SET status = 'APPROVED'
     WHERE id = $1 AND status = 'VERIFICATION_PENDING'
     RETURNING *`,
    [paymentId]
  );
  return rows[0] || null;
};

// Admin rejects payment
const rejectPayment = async (paymentId) => {
  const { rows } = await pool.query(
    `UPDATE payments SET status = 'REJECTED'
     WHERE id = $1 AND status = 'VERIFICATION_PENDING'
     RETURNING *`,
    [paymentId]
  );
  return rows[0] || null;
};

// Get all payments joined with user info, optional status filter
const getAllPayments = async ({ status } = {}) => {
  const conditions = [];
  const values = [];

  if (status) {
    conditions.push(`p.status = $1`);
    values.push(status.toUpperCase());
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       p.id,
       p.reference_id,
       p.utr,
       p.screenshot_url,
       p.status,
       p.amount,
       p.user_ids,
       p.created_at,
       u.name,
       u.email,
       u.phone,
       u.college
     FROM payments p
     JOIN users u ON u.id = p.user_id
     ${where}
     ORDER BY p.created_at DESC`,
    values
  );
  return rows;
};

module.exports = {
  createPending,
  findByReferenceId,
  findByReferenceIdWithUser,
  isUtrDuplicate,
  submitPayment,
  approvePayment,
  rejectPayment,
  getAllPayments,
};

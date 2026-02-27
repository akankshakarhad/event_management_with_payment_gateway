const { pool } = require('../config/db');

// Create a PENDING payment record
// user_ids is an array of UUIDs (team leader + members) stored as JSON string
const createPending = async (userId, amount, merchantTransactionId, userIds = []) => {
  const { rows } = await pool.query(
    `INSERT INTO payments (user_id, amount, merchant_transaction_id, user_ids, status)
     VALUES ($1, $2, $3, $4, 'PENDING')
     RETURNING *`,
    [userId, amount, merchantTransactionId, JSON.stringify(userIds)]
  );
  return rows[0];
};

// Mark payment as PAID using merchantTransactionId
const markPaid = async (merchantTransactionId, phonePeTransactionId) => {
  const { rows } = await pool.query(
    `UPDATE payments
     SET status = 'PAID', phonepe_transaction_id = $1
     WHERE merchant_transaction_id = $2
     RETURNING *`,
    [phonePeTransactionId, merchantTransactionId]
  );
  return rows[0] || null;
};

// Mark payment as FAILED using merchantTransactionId
const markFailed = async (merchantTransactionId) => {
  const { rows } = await pool.query(
    `UPDATE payments
     SET status = 'FAILED'
     WHERE merchant_transaction_id = $1
     RETURNING *`,
    [merchantTransactionId]
  );
  return rows[0] || null;
};

module.exports = { createPending, markPaid, markFailed };

const { pool } = require('../config/db');

const createPending = async (userId, amount, razorpayOrderId) => {
  const { rows } = await pool.query(
    `INSERT INTO payments (user_id, amount, razorpay_order_id, status)
     VALUES ($1, $2, $3, 'PENDING')
     RETURNING *`,
    [userId, amount, razorpayOrderId]
  );
  return rows[0];
};

const markPaid = async (razorpayOrderId, razorpayPaymentId) => {
  const { rows } = await pool.query(
    `UPDATE payments
     SET status = 'PAID', razorpay_payment_id = $1
     WHERE razorpay_order_id = $2
     RETURNING *`,
    [razorpayPaymentId, razorpayOrderId]
  );
  return rows[0] || null;
};

module.exports = { createPending, markPaid };

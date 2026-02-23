const crypto      = require('crypto');
const razorpay    = require('../config/razorpay');
const paymentModel        = require('../models/paymentModel');
const registrationModel   = require('../models/registrationModel');
const { pool }            = require('../config/db');

// Normalise: accept userId (string) OR userIds (array)
const resolveUserIds = (body) => {
  if (body.userIds && Array.isArray(body.userIds) && body.userIds.length) return body.userIds;
  if (body.userId) return [body.userId];
  return [];
};

// POST /api/create-order
// Body: { userId } OR { userIds: ['uid1','uid2',...] }
const createOrder = async (req, res, next) => {
  try {
    const userIds = resolveUserIds(req.body);
    if (!userIds.length) {
      return res.status(400).json({ success: false, message: 'userId or userIds is required' });
    }

    // Get all PENDING registrations for all users
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: pendingRegs } = await pool.query(
      `SELECT r.id, r.event_id, r.user_id, e.price
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       WHERE r.user_id IN (${placeholders}) AND r.status = 'PENDING'`,
      userIds
    );

    if (!pendingRegs.length) {
      return res.status(400).json({
        success: false,
        message: 'No pending registrations found',
      });
    }

    const totalAmount   = pendingRegs.reduce((sum, r) => sum + parseFloat(r.price), 0);
    const amountInPaise = Math.round(totalAmount * 100);

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `geofest_${userIds[0].slice(0, 8)}_${Date.now()}`,
    });

    // Save payment record under the first user (team leader for groups)
    await paymentModel.createPending(userIds[0], totalAmount, order.id);

    res.status(201).json({
      success: true,
      data: {
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } OR { ...userIds }
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userIds = resolveUserIds(req.body);

    const missing = [];
    if (!razorpay_order_id)   missing.push('razorpay_order_id');
    if (!razorpay_payment_id) missing.push('razorpay_payment_id');
    if (!razorpay_signature)  missing.push('razorpay_signature');
    if (!userIds.length)      missing.push('userId or userIds');

    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const payment = await paymentModel.markPaid(razorpay_order_id, razorpay_payment_id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Mark all PENDING registrations for all users as PAID
    const updatedRegs = await registrationModel.markAllPaidForUsers(userIds);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { payment, registrationsUpdated: updatedRegs.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment };

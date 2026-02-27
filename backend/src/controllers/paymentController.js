const axios                   = require('axios');
const { v4: uuidv4 }          = require('uuid');
const { BASE_URL, MERCHANT_ID, buildRequest, verifyResponseChecksum } = require('../config/phonepe');
const paymentModel            = require('../models/paymentModel');
const registrationModel       = require('../models/registrationModel');
const { pool }                = require('../config/db');

const PAY_ENDPOINT    = '/pg/v1/pay';
const STATUS_ENDPOINT = (merchantTxnId) => `/pg/v1/status/${MERCHANT_ID}/${merchantTxnId}`;
const APP_BASE_URL    = process.env.APP_BASE_URL || 'http://localhost:5000';

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

    const merchantTransactionId = `GEOFEST_${uuidv4().slice(0, 8).toUpperCase()}_${Date.now()}`;

    const phonePePayload = {
      merchantId:            MERCHANT_ID,
      merchantTransactionId,
      merchantUserId:        userIds[0],
      amount:                amountInPaise,
      redirectUrl:           `${APP_BASE_URL}/api/phonepe-callback?transactionId=${merchantTransactionId}`,
      redirectMode:          'REDIRECT',
      paymentInstrument:     { type: 'PAY_PAGE' },
    };

    const { base64Payload, checksum } = buildRequest(phonePePayload, PAY_ENDPOINT);

    const phonePeResponse = await axios.post(
      `${BASE_URL}${PAY_ENDPOINT}`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY':     checksum,
          accept:         'application/json',
        },
      }
    );

    const { data } = phonePeResponse;
    if (!data.success || !data.data?.instrumentResponse?.redirectInfo?.url) {
      return res.status(502).json({ success: false, message: 'PhonePe did not return a redirect URL' });
    }

    const redirectUrl = data.data.instrumentResponse.redirectInfo.url;

    // Save payment record (team leader as user_id, store all userIds as JSON)
    await paymentModel.createPending(userIds[0], totalAmount, merchantTransactionId, userIds);

    res.status(201).json({
      success: true,
      data: { redirectUrl },
    });
  } catch (err) {
    // Log full PhonePe error for debugging
    console.error('[PhonePe] create-order error:', JSON.stringify(err.response?.data || err.message));
    console.error('[PhonePe] ENV CHECK — MERCHANT_ID:', process.env.PHONEPE_MERCHANT_ID, '| BASE_URL:', process.env.PHONEPE_BASE_URL);
    if (err.response?.data) {
      return res.status(502).json({
        success: false,
        message: err.response.data.message || 'PhonePe API error',
        code: err.response.data.code,
      });
    }
    next(err);
  }
};

// GET /api/phonepe-callback?transactionId=MERCHANT_TXN_ID
// PhonePe redirects the user here after payment
const phonePeCallback = async (req, res, next) => {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { transactionId } = req.query;
    if (!transactionId) {
      return res.redirect(`${frontendBase}/failure`);
    }

    const endpoint = STATUS_ENDPOINT(transactionId);
    const { checksum } = buildRequest({}, endpoint); // status API: no payload, only endpoint in hash

    // The status API checksum format: sha256(endpoint + saltKey) + "###" + saltIndex
    // (no base64 payload prefix for status)
    const crypto = require('crypto');
    const SALT_KEY   = process.env.PHONEPE_SALT_KEY;
    const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
    const statusHash = crypto
      .createHash('sha256')
      .update(endpoint + SALT_KEY)
      .digest('hex');
    const statusChecksum = `${statusHash}###${SALT_INDEX}`;

    const statusRes = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY':     statusChecksum,
        'X-MERCHANT-ID': MERCHANT_ID,
        accept:         'application/json',
      },
    });

    const { data } = statusRes;
    const paymentState = data?.data?.paymentState || data?.data?.state;
    const phonePeTxnId = data?.data?.transactionId || '';

    if (data.success && (paymentState === 'COMPLETED' || data.code === 'PAYMENT_SUCCESS')) {
      // Fetch payment record by merchantTransactionId to get all userIds
      const payment = await paymentModel.markPaid(transactionId, phonePeTxnId);
      if (payment && payment.user_ids) {
        const userIds = JSON.parse(payment.user_ids);
        await registrationModel.markAllPaidForUsers(userIds);
      }
      return res.redirect(`${frontendBase}/success`);
    } else {
      await paymentModel.markFailed(transactionId);
      return res.redirect(`${frontendBase}/failure`);
    }
  } catch (err) {
    console.error('PhonePe callback error:', err.response?.data || err.message);
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendBase}/failure`);
  }
};

module.exports = { createOrder, phonePeCallback };

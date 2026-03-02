const QRCode       = require('qrcode');
const paymentModel = require('../models/paymentModel');
const { uploadToCloudinary } = require('../middleware/upload');
const { pool }     = require('../config/db');

const AMOUNT   = 199;
const UPI_ID   = process.env.UPI_ID   || 'geofest@upi';
const UPI_NAME = process.env.UPI_NAME || 'GeoFest 2026';

// UTR validation: 6–30 alphanumeric characters (covers IMPS, NEFT, UPI ref formats)
const UTR_REGEX = /^[A-Za-z0-9]{6,30}$/;

const resolveUserIds = (body) => {
  if (Array.isArray(body.userIds) && body.userIds.length) return body.userIds;
  if (body.userId) return [body.userId];
  return [];
};

const generateReferenceId = () => {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `GF2026-${digits}`;
};

// ─────────────────────────────────────────────
// POST /api/payment/initiate
// Body: { userId } | { userIds: [] }
// Returns: referenceId, upiLink, qrCodeBase64, amount, upiId
// ─────────────────────────────────────────────
const initiatePayment = async (req, res, next) => {
  try {
    const userIds = resolveUserIds(req.body);
    if (!userIds.length) {
      return res.status(400).json({ success: false, message: 'userId or userIds is required' });
    }

    // Ensure at least one pending registration exists
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: pending } = await pool.query(
      `SELECT id FROM registrations
       WHERE user_id IN (${placeholders}) AND status = 'PENDING'`,
      userIds
    );
    if (!pending.length) {
      return res.status(400).json({ success: false, message: 'No pending registrations found' });
    }

    // Check if a PENDING payment already exists for this user (prevent duplicates)
    const { rows: existing } = await pool.query(
      `SELECT reference_id FROM payments
       WHERE user_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC LIMIT 1`,
      [userIds[0]]
    );

    let referenceId;
    if (existing.length) {
      referenceId = existing[0].reference_id;
    } else {
      referenceId = generateReferenceId();
      await paymentModel.createPending(userIds[0], AMOUNT, referenceId, userIds);
    }

    // Build UPI deep-link
    const tn = encodeURIComponent(referenceId);
    const pa = encodeURIComponent(UPI_ID);
    const pn = encodeURIComponent(UPI_NAME);
    const upiLink = `upi://pay?pa=${pa}&pn=${pn}&am=${AMOUNT}&cu=INR&tn=${tn}`;

    // Generate QR code as base64 PNG data URL
    const qrCodeBase64 = await QRCode.toDataURL(upiLink, {
      width:  300,
      margin: 2,
      color:  { dark: '#000000', light: '#ffffff' },
    });

    res.status(201).json({
      success: true,
      data: {
        referenceId,
        upiLink,
        qrCodeBase64,
        amount:    AMOUNT,
        upiId:     UPI_ID,
        payeeName: UPI_NAME,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/payment/submit  (multipart/form-data)
// Fields: referenceId, utr
// File:   screenshot (jpg/jpeg/png, max 5 MB)
// ─────────────────────────────────────────────
const submitPayment = async (req, res, next) => {
  try {
    const { referenceId, utr } = req.body;
    const file = req.file;

    if (!referenceId || !utr) {
      return res.status(400).json({ success: false, message: 'referenceId and utr are required' });
    }
    if (!file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }

    // Validate UTR format
    if (!UTR_REGEX.test(utr)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UTR format. Must be 6–30 alphanumeric characters (no spaces or symbols).',
      });
    }

    // Prevent duplicate UTR
    const isDuplicate = await paymentModel.isUtrDuplicate(utr);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'This UTR has already been submitted. Contact us if you think this is an error.',
      });
    }

    // Verify the payment record exists and is still PENDING
    const payment = await paymentModel.findByReferenceId(referenceId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment reference not found' });
    }
    if (payment.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Payment already submitted or processed. Contact support if needed.',
      });
    }

    // Upload screenshot to Cloudinary
    const cloudResult = await uploadToCloudinary(file.buffer, 'geofest-payments');

    // Update payment record
    const updated = await paymentModel.submitPayment(
      referenceId,
      utr,
      cloudResult.secure_url
    );
    if (!updated) {
      return res.status(500).json({ success: false, message: 'Failed to record payment. Try again.' });
    }

    res.json({
      success: true,
      message: 'Payment details submitted successfully. We will verify and confirm within 24 hours.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiatePayment, submitPayment };

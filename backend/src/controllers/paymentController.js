const crypto              = require('crypto');
const QRCode              = require('qrcode');
const nodemailer          = require('nodemailer');
const paymentModel        = require('../models/paymentModel');
const registrationModel   = require('../models/registrationModel');
const userModel           = require('../models/userModel');
const eventModel          = require('../models/eventModel');
const { uploadToCloudinary } = require('../middleware/upload');
const { pool }            = require('../config/db');

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
// Admin alert email when a user submits payment
// ─────────────────────────────────────────────
const sendAdminAlert = async ({ name, email, phone, college, referenceId, utr, screenshotUrl }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;
  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || `"GeoFest 2026" <${process.env.SMTP_USER}>`,
      to:      process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `[GeoFest 2026] Payment Verification Required — ${referenceId}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#f59e0b;margin-bottom:4px;">GeoFest 2026</h2>
          <h3 style="margin-bottom:20px;">New Payment Awaiting Verification</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:140px;">Name</td><td style="padding:8px 0;font-weight:bold;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="padding:8px 0;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">College</td><td style="padding:8px 0;">${college}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Reference ID</td><td style="padding:8px 0;font-weight:bold;color:#f59e0b;letter-spacing:1px;">${referenceId}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">UTR</td><td style="padding:8px 0;font-family:monospace;color:#34d399;">${utr}</td></tr>
          </table>
          <div style="margin-top:20px;">
            <a href="${screenshotUrl}" target="_blank"
               style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
              View Payment Screenshot
            </a>
          </div>
          <p style="margin-top:24px;font-size:13px;color:#94a3b8;">
            Cross-check: look for an incoming UPI payment of <strong>₹199</strong> with remark <strong style="color:#f59e0b;">${referenceId}</strong> in your bank/UPI app.<br/>
            If it matches, approve the payment in the admin dashboard.
          </p>
          <p style="font-size:12px;color:#64748b;margin-top:8px;">— GeoFest 2026 System</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Failed to send admin alert:', err.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/payment/initiate
// Body: { members: [{name,email,phone,college,participant_type,course}], eventId, projectCategory? }
// Creates users (upsert) and a PENDING payment record — NO registrations yet.
// Registrations are created only after payment proof is submitted.
// Returns: referenceId, upiLink, qrCodeBase64, amount, upiId
// ─────────────────────────────────────────────
const initiatePayment = async (req, res, next) => {
  try {
    const { members, eventId, projectCategory } = req.body;

    if (!members || !Array.isArray(members) || !members.length) {
      return res.status(400).json({ success: false, message: 'members array is required' });
    }
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required' });
    }

    // Validate the event exists
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(400).json({ success: false, message: `Invalid event ID: ${eventId}` });
    }

    // Upsert each member as a user
    const userIds = await Promise.all(
      members.map(async (m) => {
        let user = await userModel.findByEmail(m.email);
        if (!user) {
          user = await userModel.create({
            name:             m.name,
            email:            m.email,
            phone:            m.phone,
            college:          m.college,
            participant_type: m.participant_type || '',
            course:           m.course || '',
          });
        }
        return user.id;
      })
    );

    const primaryUserId = userIds[0];
    const eventIdList   = [eventId];
    const memberModes   = members.map((m) => m.mode_of_participation || '');

    // Check if a PENDING payment already exists for this user (prevent duplicates)
    const { rows: existing } = await pool.query(
      `SELECT reference_id FROM payments
       WHERE user_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC LIMIT 1`,
      [primaryUserId]
    );

    let referenceId;
    if (existing.length) {
      referenceId = existing[0].reference_id;
    } else {
      referenceId = generateReferenceId();
      await paymentModel.createPending(primaryUserId, AMOUNT, referenceId, userIds, eventIdList, memberModes, projectCategory || null);
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

    // Create registrations now that payment proof has been submitted
    try {
      const userIds     = JSON.parse(payment.user_ids     || '[]');
      const eventIds    = JSON.parse(payment.event_ids    || '[]');
      const memberModes = JSON.parse(payment.member_modes || '[]');
      if (userIds.length && eventIds.length) {
        await Promise.all(
          userIds.flatMap((uid, uidIdx) =>
            eventIds.map((eid) => registrationModel.create(uid, eid, memberModes[uidIdx] || ''))
          )
        );
      }
    } catch (regErr) {
      console.error('[Registration] Failed to create registrations after payment submit:', regErr.message);
    }

    // Send admin alert email (awaited so Vercel doesn't kill it before sending)
    try {
      const p = await paymentModel.findByReferenceIdWithUser(referenceId);
      if (p) await sendAdminAlert({
        name:          p.name,
        email:         p.email,
        phone:         p.phone,
        college:       p.college,
        referenceId:   p.reference_id,
        utr:           p.utr,
        screenshotUrl: p.screenshot_url,
      });
    } catch (_) {}

    res.json({
      success: true,
      message: 'Payment details submitted successfully. We will verify and confirm within 24 hours.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// Helpers for category-update-via-email flow
// ─────────────────────────────────────────────
const VALID_CATEGORIES = ['Prototype', 'Model', 'Case study'];

const makeCategoryToken = (ref) =>
  crypto.createHmac('sha256', process.env.ADMIN_PASSWORD || 'geofest-secret')
    .update(ref).digest('hex').slice(0, 20);

const htmlPage = (title, bodyHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title} — GeoFest 2026</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f172a;color:#e2e8f0;font-family:sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#1e293b;border-radius:16px;padding:36px 32px;max-width:480px;width:100%;text-align:center;border:1px solid #334155}
    h2{color:#f59e0b;font-size:1.5rem;margin-bottom:8px}
    p{color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:16px}
    .btn{display:inline-block;background:linear-gradient(to right,#059669,#0d9488);color:#fff;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:0.95rem;margin-top:8px}
    input[type=text]{width:100%;background:#0f172a;border:1px solid #475569;border-radius:10px;padding:12px 16px;color:#fff;font-size:1rem;margin-bottom:16px;outline:none}
    input[type=text]:focus{border-color:#f59e0b}
    button[type=submit]{width:100%;background:linear-gradient(to right,#7c3aed,#4f46e5);color:#fff;font-weight:700;padding:13px;border-radius:10px;border:none;font-size:1rem;cursor:pointer}
  </style>
</head>
<body><div class="card">${bodyHtml}</div></body>
</html>`;

// ─────────────────────────────────────────────
// GET /api/payment/set-category
// ?ref=GF2026-XXXXX&cat=Prototype&tok=XXXX
// One-click category update from email link
// ─────────────────────────────────────────────
const setCategoryByLink = async (req, res) => {
  const { ref, cat, tok } = req.query;
  if (!ref || !cat || !tok || tok !== makeCategoryToken(ref)) {
    return res.status(400).send(htmlPage('Invalid Link',
      '<h2>GeoFest 2026</h2><p>This link is invalid or has expired.</p>'));
  }
  if (!VALID_CATEGORIES.includes(cat)) {
    return res.status(400).send(htmlPage('Invalid Category',
      '<h2>GeoFest 2026</h2><p>Unknown category. Please use the link from your email.</p>'));
  }
  try {
    await pool.query(
      `UPDATE payments SET project_category = $1 WHERE reference_id = $2`,
      [cat, ref]
    );
    return res.send(htmlPage('Category Saved', `
      <h2>GeoFest 2026</h2>
      <p style="color:#34d399;font-size:1.1rem;font-weight:bold;margin-bottom:8px">✅ Done!</p>
      <p>Your project submission category has been saved as <strong style="color:#f59e0b">${cat}</strong>.</p>
      <p>You may close this tab.</p>
    `));
  } catch (err) {
    return res.status(500).send(htmlPage('Error',
      '<h2>GeoFest 2026</h2><p>Something went wrong. Please contact the organizers.</p>'));
  }
};

// ─────────────────────────────────────────────
// GET /api/payment/category-form
// ?ref=GF2026-XXXXX&tok=XXXX
// "Other" category — shows a text input form
// ─────────────────────────────────────────────
const categoryForm = (req, res) => {
  const { ref, tok } = req.query;
  if (!ref || !tok || tok !== makeCategoryToken(ref)) {
    return res.status(400).send(htmlPage('Invalid Link',
      '<h2>GeoFest 2026</h2><p>This link is invalid or has expired.</p>'));
  }
  return res.send(htmlPage('Enter Your Category', `
    <h2>GeoFest 2026</h2>
    <p style="margin-bottom:24px">Please describe your project submission category below.</p>
    <form method="POST" action="/api/payment/category-form">
      <input type="hidden" name="ref" value="${ref}"/>
      <input type="hidden" name="tok" value="${tok}"/>
      <input type="text" name="category" placeholder="e.g. Remote Sensing, GIS, Tunnelling..." required maxlength="100"/>
      <button type="submit">Save Category</button>
    </form>
  `));
};

// ─────────────────────────────────────────────
// POST /api/payment/category-form  (form submit)
// ─────────────────────────────────────────────
const setCategoryOther = async (req, res) => {
  const { ref, tok, category } = req.body;
  if (!ref || !tok || tok !== makeCategoryToken(ref)) {
    return res.status(400).send(htmlPage('Invalid Link',
      '<h2>GeoFest 2026</h2><p>This link is invalid or has expired.</p>'));
  }
  const trimmed = (category || '').trim().slice(0, 100);
  if (!trimmed) {
    return res.status(400).send(htmlPage('Error',
      '<h2>GeoFest 2026</h2><p>Category cannot be empty.</p>'));
  }
  try {
    await pool.query(
      `UPDATE payments SET project_category = $1 WHERE reference_id = $2`,
      [trimmed, ref]
    );
    return res.send(htmlPage('Category Saved', `
      <h2>GeoFest 2026</h2>
      <p style="color:#34d399;font-size:1.1rem;font-weight:bold;margin-bottom:8px">✅ Done!</p>
      <p>Your project submission category has been saved as <strong style="color:#f59e0b">${trimmed}</strong>.</p>
      <p>You may close this tab.</p>
    `));
  } catch (err) {
    return res.status(500).send(htmlPage('Error',
      '<h2>GeoFest 2026</h2><p>Something went wrong. Please contact the organizers.</p>'));
  }
};

module.exports = { initiatePayment, submitPayment, setCategoryByLink, categoryForm, setCategoryOther, makeCategoryToken };

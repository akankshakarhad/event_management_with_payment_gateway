const nodemailer  = require('nodemailer');
const ExcelJS     = require('exceljs');
const adminModel  = require('../models/adminModel');
const paymentModel = require('../models/paymentModel');
const registrationModel = require('../models/registrationModel');

// ─────────────────────────────────────────────────────
// Nodemailer transporter (lazy-init so missing env vars
// don't crash the app on startup)
// ─────────────────────────────────────────────────────
let _transporter = null;
const getTransporter = () => {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
};

const sendApprovalEmail = async (toEmail, toName, referenceId) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured — skipping confirmation email.');
    return;
  }
  try {
    await getTransporter().sendMail({
      from:    process.env.EMAIL_FROM || `"GeoFest 2026" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      subject: 'GeoFest 2026 — Payment Confirmed!',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#f59e0b;margin-bottom:8px;">GeoFest 2026</h2>
          <h3 style="margin-bottom:16px;">Your payment has been approved ✅</h3>
          <p>Hi <strong>${toName}</strong>,</p>
          <p>
            Your payment for <strong>GeoFest 2026</strong> has been verified and confirmed.
            Your spot is now secured!
          </p>
          <div style="background:#1e293b;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Reference ID</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#f59e0b;letter-spacing:2px;">
              ${referenceId}
            </p>
          </div>
          <p style="font-size:13px;color:#94a3b8;">
            Please carry a valid college ID on the event day.<br/>
            See you at GeoFest 2026!
          </p>
          <p style="font-size:12px;color:#64748b;margin-top:24px;">— The GeoFest Team, NICMAR University</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Failed to send approval email:', err.message);
  }
};

// ─────────────────────────────────────────────────────
// Admin password guard (inline, no extra middleware file)
// ─────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6tfcvgY%2026GeoFest';

const checkAdminPassword = (req, res) => {
  const pw = req.headers['x-admin-password'];
  if (pw !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────
// GET /api/admin/users?status=PAID&eventId=<uuid>
// ─────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { status, eventId } = req.query;
    if (status && !['PAID', 'PENDING'].includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'status must be PAID or PENDING' });
    }
    const users = await adminModel.getUsers({ status, eventId });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/admin/export?status=PAID&eventId=<uuid>
// Exports registrations to Excel
// ─────────────────────────────────────────────────────
const exportCSV = async (req, res, next) => {
  try {
    const { status, eventId } = req.query;
    const rows = await adminModel.getUsers({ status, eventId });
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Registrations');

    sheet.columns = [
      { header: 'Name',          key: 'name',        width: 25 },
      { header: 'Email',         key: 'email',       width: 30 },
      { header: 'Phone',         key: 'phone',       width: 15 },
      { header: 'College',       key: 'college',     width: 30 },
      { header: 'Event',         key: 'event_title', width: 25 },
      { header: 'Price',         key: 'price',       width: 10 },
      { header: 'Status',        key: 'status',      width: 12 },
      { header: 'Registered At', key: 'created_at',  width: 22 },
    ];
    sheet.getRow(1).font = { bold: true };
    rows.forEach((r) => {
      sheet.addRow({
        name:        r.name,
        email:       r.email,
        phone:       r.phone,
        college:     r.college,
        event_title: r.event_title,
        price:       r.price,
        status:      r.status,
        created_at:  new Date(r.created_at).toLocaleString('en-IN'),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="geofest_registrations.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/admin/payments?status=VERIFICATION_PENDING
// ─────────────────────────────────────────────────────
const getPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const payments = await paymentModel.getAllPayments({ status });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/admin/payments/:id/approve
// Header: x-admin-password
// ─────────────────────────────────────────────────────
const approvePayment = async (req, res, next) => {
  try {
    if (!checkAdminPassword(req, res)) return;

    const payment = await paymentModel.approvePayment(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not in VERIFICATION_PENDING state',
      });
    }

    // Mark all registrations for the group as PAID
    if (payment.user_ids) {
      const userIds = JSON.parse(payment.user_ids);
      await registrationModel.markAllPaidForUsers(userIds);
    } else {
      await registrationModel.markAllPaidForUser(payment.user_id);
    }

    // Send confirmation email (non-blocking)
    sendApprovalEmail(req.body.email || '', req.body.name || '', payment.reference_id);

    res.json({ success: true, message: 'Payment approved and registrations confirmed.', data: payment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// POST /api/admin/payments/:id/reject
// Header: x-admin-password
// ─────────────────────────────────────────────────────
const rejectPayment = async (req, res, next) => {
  try {
    if (!checkAdminPassword(req, res)) return;

    const payment = await paymentModel.rejectPayment(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not in VERIFICATION_PENDING state',
      });
    }

    res.json({ success: true, message: 'Payment rejected.', data: payment });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// GET /api/admin/payments/export
// Export payments to Excel
// ─────────────────────────────────────────────────────
const exportPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const rows = await paymentModel.getAllPayments({ status });
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'No payment data to export' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payments');

    sheet.columns = [
      { header: 'Name',           key: 'name',           width: 25 },
      { header: 'Email',          key: 'email',          width: 30 },
      { header: 'Phone',          key: 'phone',          width: 15 },
      { header: 'College',        key: 'college',        width: 30 },
      { header: 'Reference ID',   key: 'reference_id',   width: 18 },
      { header: 'Amount (₹)',     key: 'amount',         width: 12 },
      { header: 'UTR',            key: 'utr',            width: 25 },
      { header: 'Screenshot URL', key: 'screenshot_url', width: 60 },
      { header: 'Status',         key: 'status',         width: 22 },
      { header: 'Submitted At',   key: 'created_at',     width: 22 },
    ];
    sheet.getRow(1).font = { bold: true };

    rows.forEach((r) => {
      sheet.addRow({
        name:           r.name,
        email:          r.email,
        phone:          r.phone,
        college:        r.college,
        reference_id:   r.reference_id,
        amount:         r.amount,
        utr:            r.utr || '—',
        screenshot_url: r.screenshot_url || '—',
        status:         r.status,
        created_at:     new Date(r.created_at).toLocaleString('en-IN'),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="geofest_payments.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, exportCSV, getPayments, approvePayment, rejectPayment, exportPayments };

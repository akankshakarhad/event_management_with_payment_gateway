const nodemailer  = require('nodemailer');
const ExcelJS     = require('exceljs');
const { pool }    = require('../config/db');
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
// Exports registrations (grouped by payment group) to Excel
// ─────────────────────────────────────────────────────
const exportCSV = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const groups = await adminModel.getGroups({ eventId, includeAll: true });
    if (!groups.length) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Registrations');

    // Column definitions — all info in one sheet
    sheet.columns = [
      { key: 'ref_id',      width: 18 },
      { key: 'pay_status',  width: 20 },
      { key: 'amount',      width: 12 },
      { key: 'utr',         width: 25 },
      { key: 'name',        width: 25 },
      { key: 'email',       width: 30 },
      { key: 'phone',       width: 15 },
      { key: 'college',     width: 30 },
      { key: 'events',      width: 40 },
      { key: 'mode',        width: 18 },
      { key: 'reg_status',  width: 14 },
      { key: 'date',        width: 22 },
    ];

    // Header row
    const headerRow = sheet.addRow([
      'Reference ID', 'Payment Status', 'Amount (₹)', 'UTR',
      'Member Name', 'Email', 'Phone', 'College',
      'Events Registered', 'Mode of Participation', 'Reg. Status', 'Submitted At',
    ]);
    headerRow.eachCell((cell) => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border    = { bottom: { style: 'thin', color: { argb: 'FF334155' } } };
    });

    const PAY_STATUS_LABEL = {
      APPROVED:             'Approved',
      VERIFICATION_PENDING: 'Needs Review',
      REJECTED:             'Rejected',
      PENDING:              'Unpaid',
    };

    groups.forEach((g) => {
      const payLabel = PAY_STATUS_LABEL[g.payment_status] || g.payment_status;
      const date     = new Date(g.created_at).toLocaleString('en-IN');

      g.members.forEach((m, mIdx) => {
        const events    = m.registrations.map((r) => r.event_title).join(', ') || '—';
        const regStatus = m.registrations.length === 0
          ? '—'
          : m.registrations.every((r) => r.status === 'PAID') ? 'PAID' : 'PENDING';
        const mode      = m.registrations.map((r) => r.mode_of_participation).filter(Boolean)[0] || '—';

        const row = sheet.addRow([
          mIdx === 0 ? g.reference_id : '',
          mIdx === 0 ? payLabel        : '',
          mIdx === 0 ? g.amount        : '',
          mIdx === 0 ? g.utr           : '',
          m.name,
          m.email,
          m.phone,
          m.college,
          events,
          mode,
          regStatus,
          mIdx === 0 ? date            : '',
        ]);

        // Tint first row of each group
        if (mIdx === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF292524' } };
          });
          row.getCell(1).font = { bold: true, color: { argb: 'FFFBBF24' } };
          row.getCell(2).font = {
            bold: true,
            color: {
              argb: g.payment_status === 'APPROVED'             ? 'FF34D399' :
                    g.payment_status === 'VERIFICATION_PENDING' ? 'FFFBBF24' :
                    g.payment_status === 'REJECTED'             ? 'FFF87171' : 'FF94A3B8',
            },
          };
          row.getCell(3).font = { bold: true, color: { argb: 'FF34D399' } };
        }

        // Reg. Status color (col 11)
        if (regStatus === 'PAID') {
          row.getCell(11).font = { bold: true, color: { argb: 'FF34D399' } };
        } else if (regStatus === 'PENDING') {
          row.getCell(11).font = { color: { argb: 'FFFBBF24' } };
        }
      });

      sheet.addRow([]);
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

// ─────────────────────────────────────────────────────
// GET /api/admin/groups?status=PAID&eventId=<uuid>
// Returns registrations grouped by payment group
// ─────────────────────────────────────────────────────
const getGroupRegistrations = async (req, res, next) => {
  try {
    const { status, eventId } = req.query;
    if (status && !['PAID', 'PENDING'].includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'status must be PAID or PENDING' });
    }
    const groups = await adminModel.getGroups({ status, eventId });
    res.json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// DELETE /api/admin/groups/:paymentId
// Removes a payment record and all registrations for every member in the group
// Header: x-admin-password
// ─────────────────────────────────────────────────────
const deleteGroup = async (req, res, next) => {
  try {
    if (!checkAdminPassword(req, res)) return;

    const { paymentId } = req.params;
    const { rows } = await pool.query(
      `SELECT user_ids, user_id FROM payments WHERE id = $1`,
      [paymentId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Payment group not found' });
    }

    let userIds = [];
    try { userIds = JSON.parse(rows[0].user_ids || '[]'); } catch (_) {}
    if (!userIds.length) userIds = [rows[0].user_id];

    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');
    await pool.query(`DELETE FROM registrations WHERE user_id IN (${placeholders})`, userIds);
    await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);

    res.json({ success: true, message: 'Group deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// DELETE /api/admin/groups/:paymentId/members/:userId
// Removes a single member's registrations from a group.
// If it's the last member, the payment record is also deleted.
// Header: x-admin-password
// ─────────────────────────────────────────────────────
const deleteMember = async (req, res, next) => {
  try {
    if (!checkAdminPassword(req, res)) return;

    const { paymentId, userId } = req.params;
    const { rows } = await pool.query(
      `SELECT user_ids, user_id FROM payments WHERE id = $1`,
      [paymentId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Payment group not found' });
    }

    let userIds = [];
    try { userIds = JSON.parse(rows[0].user_ids || '[]'); } catch (_) {}
    if (!userIds.length) userIds = [rows[0].user_id];

    if (!userIds.some((id) => String(id) === String(userId))) {
      return res.status(404).json({ success: false, message: 'Member not found in this group' });
    }

    await pool.query(`DELETE FROM registrations WHERE user_id = $1`, [userId]);

    const remaining = userIds.filter((id) => String(id) !== String(userId));
    if (remaining.length === 0) {
      await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
    } else {
      await pool.query(
        `UPDATE payments SET user_ids = $1 WHERE id = $2`,
        [JSON.stringify(remaining), paymentId]
      );
    }

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, exportCSV, getPayments, approvePayment, rejectPayment, exportPayments, getGroupRegistrations, deleteGroup, deleteMember };

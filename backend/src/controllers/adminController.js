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

    const PAY_STATUS_LABEL = {
      APPROVED:             'Approved',
      VERIFICATION_PENDING: 'Needs Review',
      REJECTED:             'Rejected',
      PENDING:              'Unpaid',
    };

    const COLUMNS = [
      { header: 'Reference ID',          key: 'ref_id',     width: 18 },
      { header: 'Payment Status',        key: 'pay_status', width: 20 },
      { header: 'Amount (₹)',            key: 'amount',     width: 12 },
      { header: 'UTR',                   key: 'utr',        width: 25 },
      { header: 'Member Name',           key: 'name',       width: 25 },
      { header: 'Email',                 key: 'email',      width: 30 },
      { header: 'Phone',                 key: 'phone',      width: 15 },
      { header: 'College',               key: 'college',    width: 30 },
      { header: 'Mode of Participation', key: 'mode',       width: 20 },
      { header: 'Reg. Status',           key: 'reg_status', width: 14 },
      { header: 'Submitted At',          key: 'date',       width: 22 },
    ];

    // Collect rows per event tab
    // eventSheets: Map<eventTitle, row[]>
    const eventSheets = new Map();
    // Also build an "All Registrations" sheet
    const allRows = [];

    groups.forEach((g) => {
      const payLabel = PAY_STATUS_LABEL[g.payment_status] || g.payment_status;
      const date     = new Date(g.created_at).toLocaleString('en-IN');

      g.members.forEach((m) => {
        if (m.registrations.length === 0) {
          // No event registered — add to All sheet only
          const row = [
            g.reference_id, payLabel, g.amount, g.utr,
            m.name, m.email, m.phone, m.college,
            '-', '-', date,
          ];
          allRows.push(row);
          return;
        }

        m.registrations.forEach((r) => {
          const row = [
            g.reference_id, payLabel, g.amount, g.utr,
            m.name, m.email, m.phone, m.college,
            r.mode_of_participation || '-',
            r.status || '-',
            date,
          ];

          // Per-event tab
          const title = r.event_title || 'Unknown Event';
          if (!eventSheets.has(title)) eventSheets.set(title, []);
          eventSheets.get(title).push(row);

          // All sheet
          allRows.push(row);
        });
      });
    });

    const workbook = new ExcelJS.Workbook();

    const addSheet = (name, rows) => {
      // Excel sheet names max 31 chars, strip invalid chars
      const safeName = name.replace(/[:\\/?*[\]]/g, '').slice(0, 31);
      const sheet = workbook.addWorksheet(safeName);
      sheet.columns = COLUMNS;
      const headerRow = sheet.addRow(COLUMNS.map((c) => c.header));
      headerRow.eachCell((cell) => {
        cell.font      = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      rows.forEach((r) => sheet.addRow(r));
    };

    // One tab per event (sorted alphabetically)
    [...eventSheets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([title, rows]) => addSheet(title, rows));

    // Last tab — all registrations combined
    addSheet('All Registrations', allRows);

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

    // Delete in order: registrations → payment → users
    await pool.query(`DELETE FROM registrations WHERE user_id IN (${placeholders})`, userIds);
    await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
    await pool.query(`DELETE FROM users WHERE id IN (${placeholders})`, userIds);

    res.json({ success: true, message: 'Group deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────
// DELETE /api/admin/groups/:paymentId/members/:userId
// Removes a single member from a group.
// If it's the last member, the whole group is gone.
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

    const remaining = userIds.filter((id) => String(id) !== String(userId));

    if (remaining.length > 0) {
      // Update the group payment's member list before deleting the user.
      await pool.query(
        `UPDATE payments SET user_ids = $1 WHERE id = $2`,
        [JSON.stringify(remaining), paymentId]
      );
    } else {
      // Last member — delete the payment record too.
      await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
    }

    // Delete registrations then user explicitly.
    await pool.query(`DELETE FROM registrations WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, exportCSV, getPayments, approvePayment, rejectPayment, exportPayments, getGroupRegistrations, deleteGroup, deleteMember };

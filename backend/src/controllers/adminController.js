const adminModel = require('../models/adminModel');
const ExcelJS = require('exceljs');

// GET /api/admin/users?status=PAID&eventId=<uuid>
const getUsers = async (req, res, next) => {
  try {
    const { status, eventId } = req.query;

    // Validate status if provided
    if (status && !['PAID', 'PENDING'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'status must be PAID or PENDING',
      });
    }

    const users = await adminModel.getUsers({ status, eventId });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/export?status=PAID&eventId=<uuid>
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
      { header: 'Name',          key: 'name',         width: 25 },
      { header: 'Email',         key: 'email',        width: 30 },
      { header: 'Phone',         key: 'phone',        width: 15 },
      { header: 'College',       key: 'college',      width: 30 },
      { header: 'Event',         key: 'event_title',  width: 25 },
      { header: 'Price',         key: 'price',        width: 10 },
      { header: 'Status',        key: 'status',       width: 12 },
      { header: 'Registered At', key: 'created_at',   width: 22 },
    ];

    // Bold header row
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

module.exports = { getUsers, exportCSV };

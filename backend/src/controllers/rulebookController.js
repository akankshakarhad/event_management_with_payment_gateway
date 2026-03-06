const rulebookModel = require('../models/rulebookModel');

const ADMIN_PASSWORD = '6tfcvgY%2026GeoFest';

const verifyAdmin = (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return false;
  }
  return true;
};

// GET /api/rulebook  — public
const getRulebook = async (req, res, next) => {
  try {
    const rulebook = await rulebookModel.findCurrent();
    res.json({ success: true, data: rulebook });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/rulebook  — admin only
const uploadRulebook = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const rulebook = await rulebookModel.upsert({
      fileData,
      fileType: file.mimetype,
      fileName: file.originalname,
    });

    res.json({ success: true, data: rulebook });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/rulebook  — admin only
const deleteRulebook = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;
    await rulebookModel.deleteAll();
    res.json({ success: true, message: 'Rule book deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRulebook, uploadRulebook, deleteRulebook };

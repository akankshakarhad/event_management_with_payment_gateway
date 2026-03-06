const rulebookModel = require('../models/rulebookModel');

const ADMIN_PASSWORD = '6tfcvgY%2026GeoFest';

const verifyAdmin = (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return false;
  }
  return true;
};

// Helper — decode base64 stored as data URL or raw base64
const decodeFileData = (fileData) => {
  const base64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
  return Buffer.from(base64, 'base64');
};

// GET /api/rulebook — public, metadata list only (no file_data, fast)
const getRulebooks = async (req, res, next) => {
  try {
    const rulebooks = await rulebookModel.findAllMeta();
    res.json({ success: true, data: rulebooks });
  } catch (err) {
    next(err);
  }
};

// GET /api/rulebook/:id/view — public, serves file inline for browser viewing
const viewRulebook = async (req, res, next) => {
  try {
    const rb = await rulebookModel.findById(req.params.id);
    if (!rb) return res.status(404).json({ success: false, message: 'Not found.' });

    const buffer = decodeFileData(rb.file_data);
    const safeName = encodeURIComponent(rb.file_name);

    res.setHeader('Content-Type', rb.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${rb.file_name}"; filename*=UTF-8''${safeName}`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// GET /api/rulebook/:id/download — public, forces file download
const downloadRulebook = async (req, res, next) => {
  try {
    const rb = await rulebookModel.findById(req.params.id);
    if (!rb) return res.status(404).json({ success: false, message: 'Not found.' });

    const buffer = decodeFileData(rb.file_data);
    const safeName = encodeURIComponent(rb.file_name);

    res.setHeader('Content-Type', rb.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${rb.file_name}"; filename*=UTF-8''${safeName}`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/rulebook — admin only
const uploadRulebook = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const fileData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const eventId = req.body.eventId || null;

    const rulebook = await rulebookModel.upsertForEvent({
      fileData,
      fileType: file.mimetype,
      fileName: file.originalname,
      eventId,
    });

    res.json({ success: true, data: rulebook });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/rulebook/:id — admin only
const deleteRulebook = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;
    const deleted = await rulebookModel.deleteById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Rule book deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRulebooks, viewRulebook, downloadRulebook, uploadRulebook, deleteRulebook };

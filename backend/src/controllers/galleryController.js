const galleryModel = require('../models/galleryModel');

const ADMIN_PASSWORD = '6tfcvgY%2026GeoFest';

const verifyAdmin = (req, res) => {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return false;
  }
  return true;
};

// GET /api/gallery  — public
const getPhotos = async (req, res, next) => {
  try {
    const photos = await galleryModel.findAll();
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/gallery  — admin only
const uploadPhoto = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }

    const imageData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const description = (req.body.description || '').trim();
    const eventId     = req.body.eventId || null;

    const photo = await galleryModel.create({
      imageData,
      imageType: file.mimetype,
      description,
      eventId,
    });

    res.json({ success: true, data: photo });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/gallery/:id  — admin only
const deletePhoto = async (req, res, next) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const { id } = req.params;
    const deleted = await galleryModel.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }
    res.json({ success: true, message: 'Photo deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPhotos, uploadPhoto, deletePhoto };

const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { getUsers, exportCSV } = require('../controllers/adminController');
const { uploadPhoto, deletePhoto } = require('../controllers/galleryController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

router.get('/users',  getUsers);
router.get('/export', exportCSV);
router.post('/gallery',    upload.single('image'), uploadPhoto);
router.delete('/gallery/:id', deletePhoto);

module.exports = router;

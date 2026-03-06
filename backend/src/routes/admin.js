const express = require('express');
const multer  = require('multer');
const router  = express.Router();

const {
  getUsers,
  exportCSV,
  getPayments,
  approvePayment,
  rejectPayment,
  exportPayments,
  getGroupRegistrations,
} = require('../controllers/adminController');

const { uploadPhoto, deletePhoto } = require('../controllers/galleryController');
const { uploadRulebook, deleteRulebook } = require('../controllers/rulebookController');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

const rulebookUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB, any file type
});

// Registrations
router.get('/users',  getUsers);
router.get('/groups', getGroupRegistrations);
router.get('/export', exportCSV);

// Payments
router.get('/payments',              getPayments);
router.get('/payments/export',       exportPayments);
router.post('/payments/:id/approve', approvePayment);
router.post('/payments/:id/reject',  rejectPayment);

// Gallery
router.post('/gallery',       imageUpload.single('image'), uploadPhoto);
router.delete('/gallery/:id', deletePhoto);

// Rule Book
router.post('/rulebook',   rulebookUpload.single('file'), uploadRulebook);
router.delete('/rulebook', deleteRulebook);

module.exports = router;

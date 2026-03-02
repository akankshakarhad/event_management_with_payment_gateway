const express = require('express');
const router  = express.Router();
const { initiatePayment, submitPayment } = require('../controllers/paymentController');
const { upload } = require('../middleware/upload');

// Step 1: Generate QR + reference ID
router.post('/payment/initiate', initiatePayment);

// Step 2: User submits UTR + screenshot
router.post('/payment/submit', upload.single('screenshot'), submitPayment);

module.exports = router;

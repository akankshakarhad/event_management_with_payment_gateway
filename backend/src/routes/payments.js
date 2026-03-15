const express = require('express');
const router  = express.Router();
const { initiatePayment, submitPayment, setCategoryByLink, categoryForm, setCategoryOther } = require('../controllers/paymentController');
const { upload } = require('../middleware/upload');

// Step 1: Generate QR + reference ID
router.post('/payment/initiate', initiatePayment);

// Step 2: User submits UTR + screenshot
router.post('/payment/submit', upload.single('screenshot'), submitPayment);

// Category update via email link (Project Display)
router.get('/payment/set-category',   setCategoryByLink);
router.get('/payment/category-form',  categoryForm);
router.post('/payment/category-form', express.urlencoded({ extended: false }), setCategoryOther);

module.exports = router;

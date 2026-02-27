const express = require('express');
const router  = express.Router();
const { createOrder, phonePeCallback } = require('../controllers/paymentController');

router.post('/create-order',      createOrder);
router.get('/phonepe-callback',   phonePeCallback);

module.exports = router;

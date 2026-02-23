const express = require('express');
const router = express.Router();
const { register, getRegistrations } = require('../controllers/registrationController');

// POST /api/register
router.post('/register', register);

// GET /api/registrations
router.get('/registrations', getRegistrations);

module.exports = router;

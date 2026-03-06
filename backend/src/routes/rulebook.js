const express = require('express');
const router = express.Router();
const { getRulebook } = require('../controllers/rulebookController');

// Public: anyone can fetch the current rule book
router.get('/', getRulebook);

module.exports = router;

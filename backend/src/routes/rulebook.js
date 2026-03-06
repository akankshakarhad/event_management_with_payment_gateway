const express = require('express');
const router = express.Router();
const { getRulebooks, viewRulebook, downloadRulebook } = require('../controllers/rulebookController');

// Public routes
router.get('/', getRulebooks);
router.get('/:id/view', viewRulebook);
router.get('/:id/download', downloadRulebook);

module.exports = router;

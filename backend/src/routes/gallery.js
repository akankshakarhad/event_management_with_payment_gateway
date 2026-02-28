const express = require('express');
const router = express.Router();
const { getPhotos } = require('../controllers/galleryController');

// Public: anyone can view the gallery
router.get('/', getPhotos);

module.exports = router;

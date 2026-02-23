const express = require('express');
const router  = express.Router();
const { getUsers, exportCSV } = require('../controllers/adminController');

router.get('/users',  getUsers);
router.get('/export', exportCSV);

module.exports = router;

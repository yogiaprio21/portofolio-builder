const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/parse', aiController.parseText);

module.exports = router;

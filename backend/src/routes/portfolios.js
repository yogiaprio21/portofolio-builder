const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.post('/', portfolioController.createPortfolio);
router.get('/:id', portfolioController.getPortfolio);

module.exports = router;
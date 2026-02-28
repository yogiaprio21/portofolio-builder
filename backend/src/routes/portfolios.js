const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { requireAuth } = require('../middleware/jwtAuth');

router.post('/', requireAuth, portfolioController.createPortfolio);
router.get('/:id', requireAuth, portfolioController.getPortfolio);
router.put('/:id', requireAuth, portfolioController.updatePortfolio);
router.delete('/:id', requireAuth, portfolioController.deletePortfolio);

module.exports = router;

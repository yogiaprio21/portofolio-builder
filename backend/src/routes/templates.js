const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { requireAdmin } = require('../middleware/jwtAuth');

router.get('/', templateController.listTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', requireAdmin, templateController.createTemplate);

module.exports = router;

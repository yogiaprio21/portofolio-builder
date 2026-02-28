const express = require('express');
const router = express.Router();
const controller = require('../controllers/portfolioItemController');
const { requireAuth } = require('../middleware/jwtAuth');

router.post('/', requireAuth, controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;

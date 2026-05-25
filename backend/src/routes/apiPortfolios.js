const express = require('express');
const router = express.Router();
const controller = require('../controllers/portfolioItemController');
const { requireAuth } = require('../middleware/jwtAuth');
const { stringField, urlField, validateBody } = require('../middleware/validate');

const portfolioItemBody = {
  title: (value) => stringField(value, { required: true, min: 3, max: 160 }),
  description: (value) => stringField(value, { required: true, min: 3, max: 5000 }),
  image_url: (value) => urlField(value),
  image_provider: (value) => stringField(value, { max: 40 }),
  image_public_id: (value) => stringField(value, { max: 255 }),
  upload_asset_id: (value) => {
    if (value == null || value === '') return { value: undefined };
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return { error: 'must be a positive integer' };
    return { value: parsed };
  },
  project_url: (value) => urlField(value)
};

const portfolioItemUpdateBody = {
  title: (value) => stringField(value, { min: 3, max: 160 }),
  description: (value) => stringField(value, { min: 3, max: 5000 }),
  image_url: (value) => urlField(value),
  image_provider: (value) => stringField(value, { max: 40 }),
  image_public_id: (value) => stringField(value, { max: 255 }),
  upload_asset_id: (value) => {
    if (value == null || value === '') return { value: undefined };
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return { error: 'must be a positive integer' };
    return { value: parsed };
  },
  project_url: (value) => urlField(value)
};

router.post('/', requireAuth, validateBody(portfolioItemBody), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.put('/:id', requireAuth, validateBody(portfolioItemUpdateBody), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;

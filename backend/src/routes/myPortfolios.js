const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/jwtAuth');
const PortfolioItem = require('../models/PortfolioItem');
const { Op } = require('sequelize');
const { integerQuery } = require('../middleware/validate');
const logger = require('../utils/logger');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { q, limit, offset } = req.query || {};
    const parsedLimit = integerQuery(limit, { min: 1, max: 100, fallback: null });
    const parsedOffset = integerQuery(offset, { min: 0, max: 100000, fallback: null });
    if (parsedLimit.error || parsedOffset.error) {
      return res.status(400).json({ error: 'Invalid pagination query' });
    }
    const search = String(q || '').trim().slice(0, 100);
    const where = {
      userId: req.user.sub,
      ...(search
        ? {
            [Op.or]: [
              { title: { [Op.like]: `%${search}%` } },
              { description: { [Op.like]: `%${search}%` } }
            ]
          }
        : {})
    };

    if (parsedLimit.value != null || parsedOffset.value != null) {
      const result = await PortfolioItem.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parsedLimit.value ?? 20,
        offset: parsedOffset.value ?? 0
      });
      res.json({
        items: result.rows,
        total: result.count,
        limit: parsedLimit.value ?? 20,
        offset: parsedOffset.value ?? 0
      });
      return;
    }
    const items = await PortfolioItem.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    logger.error('List my portfolios error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

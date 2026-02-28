const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/jwtAuth');
const PortfolioItem = require('../models/PortfolioItem');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query || {};
    const parsedLimit = Number.isInteger(Number(limit)) ? Math.min(Number(limit), 100) : null;
    const parsedOffset = Number.isInteger(Number(offset)) ? Math.max(Number(offset), 0) : null;
    if (parsedLimit != null || parsedOffset != null) {
      const result = await PortfolioItem.findAndCountAll({
        where: { userId: req.user.sub },
        order: [['createdAt', 'DESC']],
        limit: parsedLimit ?? 20,
        offset: parsedOffset ?? 0
      });
      res.json({
        items: result.rows,
        total: result.count,
        limit: parsedLimit ?? 20,
        offset: parsedOffset ?? 0
      });
      return;
    }
    const items = await PortfolioItem.findAll({
      where: { userId: req.user.sub },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    console.error('List my portfolios error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

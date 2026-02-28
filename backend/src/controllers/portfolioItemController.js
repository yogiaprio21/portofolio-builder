const PortfolioItem = require('../models/PortfolioItem');

function isValidUrl(u) {
  if (!u) return true;
  try { new URL(u); return true; } catch { return false; }
}

exports.create = async (req, res) => {
  try {
    const { title, description, image_url, project_url } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    if (!isValidUrl(image_url) || !isValidUrl(project_url)) {
      return res.status(400).json({ error: 'image_url/project_url must be valid URLs' });
    }
    const created = await PortfolioItem.create({
      title,
      description,
      imageUrl: image_url || null,
      projectUrl: project_url || null,
      userId: req.user?.sub || null
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q, limit, offset } = req.query || {};
    const where = q
      ? {
          [require('sequelize').Op.or]: [
            { title: { [require('sequelize').Op.like]: `%${q}%` } },
            { description: { [require('sequelize').Op.like]: `%${q}%` } }
          ]
        }
      : undefined;
    const parsedLimit = Number.isInteger(Number(limit)) ? Math.min(Number(limit), 100) : null;
    const parsedOffset = Number.isInteger(Number(offset)) ? Math.max(Number(offset), 0) : null;
    if (parsedLimit != null || parsedOffset != null) {
      const result = await PortfolioItem.findAndCountAll({
        where,
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
    const items = await PortfolioItem.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    console.error('List PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await PortfolioItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Get PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, image_url, project_url } = req.body || {};
    const item = await PortfolioItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (title != null && !title) return res.status(400).json({ error: 'title cannot be empty' });
    if (description != null && !description) return res.status(400).json({ error: 'description cannot be empty' });
    if (!isValidUrl(image_url) || !isValidUrl(project_url)) {
      return res.status(400).json({ error: 'image_url/project_url must be valid URLs' });
    }
    if (!req.user || !item.userId || item.userId !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await item.update({
      title: title != null ? title : item.title,
      description: description != null ? description : item.description,
      imageUrl: image_url != null ? image_url : item.imageUrl,
      projectUrl: project_url != null ? project_url : item.projectUrl
    });
    res.json(updated);
  } catch (err) {
    console.error('Update PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await PortfolioItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!req.user || !item.userId || item.userId !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

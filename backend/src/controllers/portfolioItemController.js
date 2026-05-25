const PortfolioItem = require('../models/PortfolioItem');
const UploadAsset = require('../models/UploadAsset');
const { Op } = require('sequelize');
const { integerQuery } = require('../middleware/validate');
const cloudinaryStorage = require('../services/cloudinaryStorage');
const logger = require('../utils/logger');

function isValidUrl(u) {
  if (!u) return true;
  try {
    const parsed = new URL(u);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

async function linkedAssetFor({ url, publicId, userId }) {
  if (!url && !publicId) return null;
  const where = publicId ? { publicId } : { url };
  const asset = await UploadAsset.findOne({ where });
  if (!asset) return null;
  if (asset.userId && userId && asset.userId !== userId) return null;
  return asset;
}

async function cleanupImageAsset(item, req) {
  const asset = await linkedAssetFor({
    url: item.imageUrl,
    publicId: item.imagePublicId,
    userId: item.userId
  });
  const publicId = item.imagePublicId || asset?.publicId;
  if (publicId && (item.imageProvider === 'cloudinary' || asset?.provider === 'cloudinary')) {
    await cloudinaryStorage.destroyImage(publicId).catch((err) => {
      logger.warn('Cloudinary asset cleanup failed', { requestId: req.requestId, error: err.message, publicId });
    });
  }
  if (asset) await asset.destroy().catch(() => {});
}

exports.create = async (req, res) => {
  try {
    const { title, description, image_url, image_public_id, image_provider, upload_asset_id, project_url } = req.validatedBody || req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    if (!isValidUrl(image_url) || !isValidUrl(project_url)) {
      return res.status(400).json({ error: 'image_url/project_url must be valid URLs' });
    }
    let asset = null;
    if (upload_asset_id) {
      asset = await UploadAsset.findByPk(upload_asset_id);
      if (asset && asset.userId && asset.userId !== req.user?.sub) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    if (!asset && (image_url || image_public_id)) {
      asset = await linkedAssetFor({ url: image_url, publicId: image_public_id, userId: req.user?.sub });
    }
    const created = await PortfolioItem.create({
      title,
      description,
      imageUrl: image_url || null,
      imageProvider: image_provider || asset?.provider || null,
      imagePublicId: image_public_id || asset?.publicId || null,
      projectUrl: project_url || null,
      userId: req.user?.sub || null
    });
    if (asset) await asset.update({ portfolioItemId: created.id });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create PortfolioItem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q, limit, offset } = req.query || {};
    const parsedLimit = integerQuery(limit, { min: 1, max: 100, fallback: null });
    const parsedOffset = integerQuery(offset, { min: 0, max: 100000, fallback: null });
    if (parsedLimit.error || parsedOffset.error) {
      return res.status(400).json({ error: 'Invalid pagination query' });
    }
    const search = String(q || '').trim().slice(0, 100);
    const where = search
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        }
      : undefined;
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
    const items = await PortfolioItem.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    logger.error('List PortfolioItem error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await PortfolioItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    logger.error('Get PortfolioItem error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, image_url, image_public_id, image_provider, upload_asset_id, project_url } = req.validatedBody || req.body || {};
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
    let asset = null;
    if (upload_asset_id) {
      asset = await UploadAsset.findByPk(upload_asset_id);
      if (asset && asset.userId && asset.userId !== req.user?.sub) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    if (!asset && (image_url || image_public_id)) {
      asset = await linkedAssetFor({ url: image_url, publicId: image_public_id, userId: req.user?.sub });
    }
    const imageChanged =
      (image_url != null && image_url !== item.imageUrl) ||
      (image_public_id != null && image_public_id !== item.imagePublicId);
    if (imageChanged) await cleanupImageAsset(item, req);
    const updated = await item.update({
      title: title != null ? title : item.title,
      description: description != null ? description : item.description,
      imageUrl: image_url != null ? image_url : item.imageUrl,
      imageProvider: image_provider != null ? image_provider : (asset?.provider || item.imageProvider),
      imagePublicId: image_public_id != null ? image_public_id : (asset?.publicId || item.imagePublicId),
      projectUrl: project_url != null ? project_url : item.projectUrl
    });
    if (asset) await asset.update({ portfolioItemId: updated.id });
    res.json(updated);
  } catch (err) {
    logger.error('Update PortfolioItem error', { requestId: req.requestId, error: err.message });
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
    await cleanupImageAsset(item, req);
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete PortfolioItem error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

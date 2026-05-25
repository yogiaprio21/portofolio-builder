const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/env');
const { requireAuth } = require('../middleware/jwtAuth');
const cloudinaryStorage = require('../services/cloudinaryStorage');
const UploadAsset = require('../models/UploadAsset');
const logger = require('../utils/logger');

const uploadDir = config.uploadDir;
fs.mkdirSync(path.resolve(uploadDir), { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

function isAllowedCv(file) {
  return file.mimetype === 'application/pdf' && path.extname(file.originalname || '').toLowerCase() === '.pdf';
}

function isAllowedImage(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  return (
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) &&
    ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
  );
}

function readHeader(filepath, length = 12) {
  const fd = fs.openSync(filepath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    return buffer;
  } finally {
    fs.closeSync(fd);
  }
}

function isPdfFile(filepath) {
  return readHeader(filepath, 5).toString('utf8') === '%PDF-';
}

function isImageFile(filepath) {
  const header = readHeader(filepath, 12);
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP';
  return isJpeg || isPng || isWebp;
}

function removeUploadedFile(file) {
  if (!file?.path) return;
  fs.unlink(file.path, () => {});
}

function validateSavedFile(kind) {
  return (req, res, next) => {
    if (!req.file) return next();
    try {
      const valid = kind === 'pdf' ? isPdfFile(req.file.path) : isImageFile(req.file.path);
      if (!valid) {
        removeUploadedFile(req.file);
        return res.status(400).json({ error: 'Invalid file content' });
      }
      next();
    } catch (err) {
      removeUploadedFile(req.file);
      return res.status(400).json({ error: 'Invalid file content' });
    }
  };
}

function requireUploadAuth(req, res, next) {
  if (!config.requireUploadAuth) return next();
  return requireAuth(req, res, next);
}

const uploadCv = multer({
  storage,
  limits: { fileSize: config.uploadMaxBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = isAllowedCv(file);
    cb(allowed ? null : new Error('Invalid file type'), allowed);
  }
});

const uploadImage = multer({
  storage,
  limits: { fileSize: config.uploadMaxBytes, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = isAllowedImage(file);
    cb(allowed ? null : new Error('Invalid file type'), allowed);
  }
});

router.post('/cv', requireUploadAuth, uploadCv.single('cv'), validateSavedFile('pdf'), uploadController.parseCv);
router.post('/image', requireUploadAuth, uploadImage.single('image'), validateSavedFile('image'), (req, res) => {
  Promise.resolve()
    .then(async () => {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (config.storageProvider === 'cloudinary') {
        const uploaded = await cloudinaryStorage.uploadImage(req.file);
        removeUploadedFile(req.file);
        const asset = await UploadAsset.create({
          url: uploaded.url,
          provider: uploaded.provider,
          publicId: uploaded.publicId,
          userId: req.user?.sub || null
        });
        return res.status(201).json({
          url: uploaded.url,
          provider: uploaded.provider,
          public_id: uploaded.publicId,
          upload_asset_id: asset.id
        });
      }
      const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const asset = await UploadAsset.create({
        url,
        provider: 'local',
        publicId: null,
        userId: req.user?.sub || null
      });
      return res.status(201).json({ url, provider: 'local', upload_asset_id: asset.id });
    })
    .catch((err) => {
      removeUploadedFile(req.file);
      logger.error('Upload image error', { requestId: req.requestId, error: err.message });
      res.status(500).json({ error: 'Failed to upload image' });
    });
});

router.use((err, req, res, next) => {
  if (err) {
    const message = err.message || 'Upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: message });
  }
  next();
});

module.exports = router;

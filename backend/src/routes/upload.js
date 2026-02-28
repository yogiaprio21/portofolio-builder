const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const fs = require('fs');
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(path.resolve(uploadDir), { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

function isAllowedCv(file) {
  return file.mimetype === 'application/pdf';
}

function isAllowedImage(file) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
}

const uploadCv = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(isAllowedCv(file) ? null : new Error('Invalid file type'), isAllowedCv(file))
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(isAllowedImage(file) ? null : new Error('Invalid file type'), isAllowedImage(file))
});

router.post('/cv', uploadCv.single('cv'), uploadController.parseCv);
router.post('/image', uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.use((err, req, res, next) => {
  if (err) {
    const message = err.message || 'Upload error';
    return res.status(400).json({ error: message });
  }
  next();
});

module.exports = router;

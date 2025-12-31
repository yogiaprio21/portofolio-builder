const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.post('/cv', upload.single('cv'), uploadController.parseCv);

module.exports = router;

const fs = require('fs/promises');
const crypto = require('crypto');
const config = require('../config/env');

function toSignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

function dataUriForFile(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

async function uploadImage(file, { folder = config.cloudinary.folder } = {}) {
  if (!config.cloudinary.enabled) {
    throw new Error('Cloudinary storage is not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder
  };
  const signature = toSignature(params, config.cloudinary.apiSecret);
  const buffer = await fs.readFile(file.path);
  const form = new FormData();
  form.set('file', dataUriForFile(buffer, file.mimetype));
  form.set('timestamp', String(timestamp));
  form.set('folder', folder);
  form.set('api_key', config.cloudinary.apiKey);
  form.set('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    provider: 'cloudinary'
  };
}

async function destroyImage(publicId) {
  if (!config.cloudinary.enabled) return { skipped: true };
  if (!publicId) return { skipped: true };

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    public_id: publicId,
    timestamp
  };
  const signature = toSignature(params, config.cloudinary.apiSecret);
  const form = new FormData();
  form.set('public_id', publicId);
  form.set('timestamp', String(timestamp));
  form.set('api_key', config.cloudinary.apiKey);
  form.set('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/destroy`,
    { method: 'POST', body: form }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || 'Cloudinary delete failed');
  }
  return data;
}

module.exports = { uploadImage, destroyImage };

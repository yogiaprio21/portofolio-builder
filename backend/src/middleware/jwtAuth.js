const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { parseCookies } = require('../utils/cookies');

function getJwtSecret() {
  const secret = config.jwtSecret;
  if (!secret) return null;
  return secret;
}

function requireAuth(req, res, next) {
  const secret = getJwtSecret();
  if (!secret) return res.status(500).json({ error: 'Server not configured' });
  const header = req.headers.authorization || '';
  const cookies = parseCookies(req.headers.cookie);
  const token = header.startsWith('Bearer ') ? header.slice(7) : cookies[config.authCookieName] || '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ error: 'Forbidden' });
  });
}

module.exports = { requireAuth, requireAdmin };

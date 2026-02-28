const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return secret;
}

function signToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const tokenValue = require('crypto').randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const user = await User.create({ email, passwordHash, role: 'user', emailVerified: false, verificationToken: tokenValue, verificationExpires: expires });
    const verificationUrl = `${req.protocol}://${req.get('host')}/auth/verify?token=${tokenValue}`;
    res.status(201).json({ verification_url: verificationUrl, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    if (!getJwtSecret()) return res.status(500).json({ error: 'Server not configured' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ error: 'email not verified' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || '';
    if (!token) return res.status(400).json({ error: 'missing token' });
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) return res.status(404).json({ error: 'invalid token' });
    if (user.verificationExpires && user.verificationExpires < new Date()) return res.status(410).json({ error: 'token expired' });
    await user.update({ emailVerified: true, verificationToken: null, verificationExpires: null });
    res.json({ success: true });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

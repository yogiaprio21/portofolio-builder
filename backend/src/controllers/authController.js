const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const config = require('../config/env');
const { parseCookies } = require('../utils/cookies');
const { serializeCookie } = require('../utils/cookies');
const logger = require('../utils/logger');
const { sendVerificationEmail } = require('../services/emailService');

function getJwtSecret() {
  const secret = config.jwtSecret;
  if (!secret) return null;
  return secret;
}

function signToken(user) {
  const secret = getJwtSecret();
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: config.jwtExpiresIn });
}

function hashVerificationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function appendCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookie);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookie]);
  } else {
    res.setHeader('Set-Cookie', [existing, cookie]);
  }
}

function setAuthCookie(res, token) {
  appendCookie(
    res,
    serializeCookie(config.authCookieName, token, {
      httpOnly: true,
      secure: config.authCookieSecure,
      sameSite: config.authCookieSameSite,
      maxAge: 7 * 24 * 60 * 60
    })
  );
}

function setRefreshCookie(res, token) {
  appendCookie(
    res,
    serializeCookie(config.refreshCookieName, token, {
      httpOnly: true,
      secure: config.authCookieSecure,
      sameSite: config.authCookieSameSite,
      maxAge: config.refreshTokenDays * 24 * 60 * 60
    })
  );
}

function clearAuthCookies(res) {
  for (const name of [config.authCookieName, config.refreshCookieName]) {
    appendCookie(
      res,
      serializeCookie(name, '', {
        httpOnly: true,
        secure: config.authCookieSecure,
        sameSite: config.authCookieSameSite,
        maxAge: 0
      })
    );
  }
}

async function createSession(req, user) {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + config.refreshTokenDays * 24 * 60 * 60 * 1000);
  await Session.create({
    userId: user.id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 255),
    ipAddress: req.ip || req.socket.remoteAddress || null,
    expiresAt,
    lastUsedAt: new Date()
  });
  return refreshToken;
}

async function sendVerification(user, req) {
  const tokenValue = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashVerificationToken(tokenValue);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.update({
    verificationToken: tokenHash,
    verificationExpires: expires,
    verificationSentAt: new Date()
  });
  const verificationUrl = `${req.protocol}://${req.get('host')}/auth/verify?token=${tokenValue}`;
  await sendVerificationEmail({ to: user.email, verificationUrl, requestId: req.requestId });
  return verificationUrl;
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.validatedBody || req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: 'user', emailVerified: false });
    const verificationUrl = await sendVerification(user, req);
    if (config.isProduction) {
      logger.info('Email verification token created', { userId: user.id, requestId: req.requestId });
      return res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: { id: user.id, email: user.email, role: user.role }
      });
    }
    res.status(201).json({ verification_url: verificationUrl, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Register error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody || req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
    if (!getJwtSecret()) return res.status(500).json({ error: 'Server not configured' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ error: 'email not verified' });
    const token = signToken(user);
    const refreshToken = await createSession(req, user);
    setAuthCookie(res, token);
    setRefreshCookie(res, refreshToken);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Login error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || '';
    if (!token) return res.status(400).json({ error: 'missing token' });
    const user = await User.findOne({ where: { verificationToken: hashVerificationToken(token) } });
    if (!user) return res.status(404).json({ error: 'invalid token' });
    if (user.verificationExpires && user.verificationExpires < new Date()) return res.status(410).json({ error: 'token expired' });
    await user.update({ emailVerified: true, verificationToken: null, verificationExpires: null });
    res.json({ success: true });
  } catch (err) {
    logger.error('Verify error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies[config.refreshCookieName];
  if (refreshToken) {
    await Session.update(
      { revokedAt: new Date() },
      { where: { refreshTokenHash: hashRefreshToken(refreshToken), revokedAt: null } }
    ).catch((err) => logger.warn('Failed to revoke session on logout', { requestId: req.requestId, error: err.message }));
  }
  clearAuthCookies(res);
  res.json({ success: true });
};

exports.refresh = async (req, res) => {
  try {
    if (!getJwtSecret()) return res.status(500).json({ error: 'Server not configured' });
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies[config.refreshCookieName];
    if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

    const session = await Session.findOne({
      where: {
        refreshTokenHash: hashRefreshToken(refreshToken),
        revokedAt: null
      }
    });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(session.userId);
    if (!user || !user.emailVerified) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await session.update({ revokedAt: new Date(), lastUsedAt: new Date() });
    const token = signToken(user);
    const nextRefreshToken = await createSession(req, user);
    setAuthCookie(res, token);
    setRefreshCookie(res, nextRefreshToken);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Refresh error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.validatedBody || req.body || {};
    const user = await User.findOne({ where: { email } });
    const generic = { success: true, message: 'If the account exists and needs verification, a verification email will be sent.' };
    if (!user || user.emailVerified) return res.json(generic);

    if (user.verificationSentAt) {
      const secondsSinceLastSend = Math.floor((Date.now() - user.verificationSentAt.getTime()) / 1000);
      if (secondsSinceLastSend < config.verificationCooldownSeconds) {
        return res.status(429).json({
          error: 'Please wait before requesting another verification email',
          retry_after: config.verificationCooldownSeconds - secondsSinceLastSend
        });
      }
    }

    const verificationUrl = await sendVerification(user, req);
    if (config.isProduction) return res.json(generic);
    return res.json({ ...generic, verification_url: verificationUrl });
  } catch (err) {
    logger.error('Resend verification error', { requestId: req.requestId, error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function csv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function intFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function boolFromEnv(name, fallback) {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function requireInProduction(name) {
  if (!isProduction) return;
  if (!process.env[name]) {
    throw new Error(`${name} is required when NODE_ENV=production`);
  }
}

requireInProduction('DATABASE_URL');
requireInProduction('JWT_SECRET');
requireInProduction('CORS_ORIGIN');

const uploadMaxBytes = intFromEnv('UPLOAD_MAX_BYTES', 5 * 1024 * 1024);
const storageProvider = process.env.STORAGE_PROVIDER || 'local';

module.exports = {
  isProduction,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'sqlite:./database.sqlite',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'access_token',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'refresh_token',
  refreshTokenDays: intFromEnv('REFRESH_TOKEN_DAYS', 30),
  authCookieSameSite: process.env.AUTH_COOKIE_SAMESITE || 'Lax',
  authCookieSecure: boolFromEnv('AUTH_COOKIE_SECURE', isProduction),
  verificationCooldownSeconds: intFromEnv('VERIFICATION_RESEND_COOLDOWN_SECONDS', 60),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  uploadMaxBytes,
  requireUploadAuth: boolFromEnv('REQUIRE_UPLOAD_AUTH', isProduction),
  storageProvider,
  cloudinary: {
    enabled: storageProvider === 'cloudinary',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'portfolio-builder'
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'log',
    from: process.env.EMAIL_FROM || 'Portfolio Builder <onboarding@resend.dev>',
    resendApiKey: process.env.RESEND_API_KEY || '',
    appUrl: process.env.APP_URL || ''
  },
  corsOrigins: csv(process.env.CORS_ORIGIN),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '1mb',
  trustProxy: process.env.TRUST_PROXY || (isProduction ? '1' : ''),
  rateLimits: {
    api: {
      windowMs: intFromEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      max: intFromEnv('RATE_LIMIT_MAX', 600)
    },
    auth: {
      windowMs: intFromEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      max: intFromEnv('AUTH_RATE_LIMIT_MAX', 20)
    },
    upload: {
      windowMs: intFromEnv('UPLOAD_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      max: intFromEnv('UPLOAD_RATE_LIMIT_MAX', 30)
    },
    ai: {
      windowMs: intFromEnv('AI_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      max: intFromEnv('AI_RATE_LIMIT_MAX', 60)
    }
  }
};

if (storageProvider === 'cloudinary') {
  requireInProduction('CLOUDINARY_CLOUD_NAME');
  requireInProduction('CLOUDINARY_API_KEY');
  requireInProduction('CLOUDINARY_API_SECRET');
}

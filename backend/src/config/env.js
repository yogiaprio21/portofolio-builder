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

function stringFromEnv(name, fallback = '') {
  const value = process.env[name];
  if (value == null) return fallback;
  return String(value).trim();
}

function secretFromEnv(name, fallback = '') {
  const value = process.env[name];
  if (value == null) return fallback;
  const normalized = String(value).trim();
  if (boolFromEnv('SMTP_STRIP_PASSWORD_SPACES', true)) {
    return normalized.replace(/\s+/g, '');
  }
  return normalized;
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
const aiProvider = (process.env.AI_PROVIDER || 'heuristic').toLowerCase();
const aiProviderChain = csv(process.env.AI_PROVIDER_CHAIN).map((provider) => provider.toLowerCase());

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
  seed: {
    onStart: boolFromEnv('SEED_ON_START', true),
    updateExistingTemplates: boolFromEnv('SEED_UPDATE_EXISTING_TEMPLATES', true),
    adminEmail: process.env.SEED_ADMIN_EMAIL || '',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || '',
    demoPortfolio: boolFromEnv('SEED_DEMO_PORTFOLIO', false),
    demoEmail: process.env.SEED_DEMO_EMAIL || '',
    demoPassword: process.env.SEED_DEMO_PASSWORD || ''
  },
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
    brevoApiKey: process.env.BREVO_API_KEY || '',
    appUrl: stringFromEnv('APP_URL'),
    smtp: {
      host: stringFromEnv('SMTP_HOST'),
      port: intFromEnv('SMTP_PORT', 587),
      secure: boolFromEnv('SMTP_SECURE', false),
      user: stringFromEnv('SMTP_USER'),
      pass: secretFromEnv('SMTP_PASS'),
      rejectUnauthorized: boolFromEnv('SMTP_REJECT_UNAUTHORIZED', true),
      ehloName: stringFromEnv('SMTP_EHLO_NAME', 'portfolio-builder.local')
    }
  },
  ai: {
    provider: aiProvider,
    providerChain: aiProviderChain.length ? aiProviderChain : [aiProvider],
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free',
    openrouterReferer: process.env.OPENROUTER_REFERER || process.env.APP_URL || '',
    openrouterTitle: process.env.OPENROUTER_TITLE || 'Portfolio Builder',
    timeoutMs: intFromEnv('AI_TIMEOUT_MS', 20000),
    maxInputChars: intFromEnv('AI_MAX_INPUT_CHARS', 50000)
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

if (process.env.EMAIL_PROVIDER === 'resend') {
  requireInProduction('RESEND_API_KEY');
}

if (process.env.EMAIL_PROVIDER === 'brevo') {
  requireInProduction('BREVO_API_KEY');
}

if (process.env.EMAIL_PROVIDER === 'smtp') {
  requireInProduction('SMTP_HOST');
  requireInProduction('SMTP_USER');
  requireInProduction('SMTP_PASS');
}

const requiredAiProviders = new Set(aiProviderChain.length ? aiProviderChain : [aiProvider]);

if (requiredAiProviders.has('openai')) {
  requireInProduction('OPENAI_API_KEY');
}

if (requiredAiProviders.has('gemini')) {
  requireInProduction('GEMINI_API_KEY');
}

if (requiredAiProviders.has('groq')) {
  requireInProduction('GROQ_API_KEY');
}

if (requiredAiProviders.has('openrouter')) {
  requireInProduction('OPENROUTER_API_KEY');
}

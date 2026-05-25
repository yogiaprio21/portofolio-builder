const crypto = require('crypto');
const config = require('../config/env');
const logger = require('../utils/logger');
const { sendSmtpMail } = require('./smtpClient');

function maskEmail(value) {
  const input = String(value || '');
  const [name, domain] = input.split('@');
  if (!domain) return input ? '***' : '';
  return `${name.slice(0, 2)}***@${domain}`;
}

function smtpSummary() {
  return {
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    user: maskEmail(config.email.smtp.user),
    from: config.email.from,
    passConfigured: Boolean(config.email.smtp.pass),
    passLength: config.email.smtp.pass ? config.email.smtp.pass.length : 0,
    ehloName: config.email.smtp.ehloName,
    rejectUnauthorized: config.email.smtp.rejectUnauthorized
  };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendWithResend({ to, subject, html, text }) {
  if (!config.email.resendApiKey) {
    throw new Error('RESEND_API_KEY is required for EMAIL_PROVIDER=resend');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.email.resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      from: config.email.from,
      to: [to],
      subject,
      html,
      text
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Resend email failed');
  }
  return data;
}

async function sendVerificationEmail({ to, verificationUrl, requestId }) {
  const subject = 'Verify your Portfolio Builder account';
  const safeUrl = escapeHtml(verificationUrl);
  const html = `
    <p>Thanks for registering with Portfolio Builder.</p>
    <p><a href="${safeUrl}">Verify your email address</a></p>
    <p>If the button does not work, open this link:</p>
    <p>${safeUrl}</p>
  `;
  const text = `Verify your email address: ${verificationUrl}`;

  if (config.email.provider === 'resend') {
    return await sendWithResend({ to, subject, html, text });
  }

  if (config.email.provider === 'smtp') {
    logger.info('Sending verification email with SMTP', {
      to: maskEmail(to),
      requestId,
      smtp: smtpSummary()
    });
    return await sendSmtpMail({
      smtp: config.email.smtp,
      from: config.email.from,
      to,
      subject,
      html,
      text
    });
  }

  logger.info('Verification email delivery skipped', {
    provider: config.email.provider,
    to,
    verificationUrl: config.isProduction ? undefined : verificationUrl,
    requestId
  });
  return { skipped: true };
}

module.exports = { sendVerificationEmail };

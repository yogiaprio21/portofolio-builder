const crypto = require('crypto');
const config = require('../config/env');
const logger = require('../utils/logger');
const { sendSmtpMail } = require('./smtpClient');

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

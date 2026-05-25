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

function parseEmailIdentity(value) {
  const input = String(value || '').trim();
  const match = input.match(/^(.*?)\s*<([^>]+)>$/);
  if (!match) return { email: input };
  const name = match[1].trim().replace(/^"|"$/g, '');
  return {
    name: name || undefined,
    email: match[2].trim()
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

function buildVerificationEmail(verificationUrl) {
  const safeUrl = escapeHtml(verificationUrl);
  const subject = 'Verifikasi akun PortoBuilder Anda';
  const text = [
    'Verifikasi akun PortoBuilder Anda',
    '',
    'Terima kasih sudah membuat akun PortoBuilder.',
    'Klik tautan berikut untuk mengaktifkan workspace CV Anda:',
    verificationUrl,
    '',
    'Tautan ini berlaku selama 24 jam. Abaikan email ini jika Anda tidak membuat akun PortoBuilder.'
  ].join('\n');
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#e7edf7;padding:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#e7edf7;margin:0;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe5f0;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.12);">
            <tr>
              <td style="background:#020617;padding:28px 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;width:42px;height:42px;border-radius:12px;background:#2563eb;color:#ffffff;text-align:center;line-height:42px;font-size:18px;font-weight:800;">PB</div>
                    </td>
                    <td align="right" style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#93c5fd;">
                      CV Workspace
                    </td>
                  </tr>
                </table>
                <h1 style="margin:28px 0 0;font-size:30px;line-height:1.15;color:#ffffff;font-weight:800;">
                  Verifikasi email untuk mulai membangun CV Anda.
                </h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#cbd5e1;">
                  Aktifkan akun PortoBuilder agar draft CV, template, dan export PDF tersimpan aman di workspace Anda.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 10px;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#334155;">
                  Terima kasih sudah mendaftar. Klik tombol di bawah ini untuk memverifikasi email dan membuka workspace PortoBuilder.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 24px;">
                  <tr>
                    <td bgcolor="#2563eb" style="border-radius:12px;">
                      <a href="${safeUrl}" style="display:inline-block;padding:14px 22px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:12px;">
                        Verifikasi Email
                      </a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#1e3a8a;">
                        Tautan ini berlaku selama <strong>24 jam</strong>. Jika tombol tidak berfungsi, salin tautan di bawah ini ke browser Anda.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;word-break:break-all;">
                  ${safeUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding-top:18px;">
                      <p style="margin:0;font-size:12px;line-height:1.7;color:#94a3b8;">
                        Jika Anda tidak membuat akun PortoBuilder, abaikan email ini. Akun tidak akan aktif sebelum email diverifikasi.
                      </p>
                      <p style="margin:14px 0 0;font-size:12px;color:#64748b;font-weight:700;">
                        PortoBuilder
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
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

async function sendWithBrevo({ to, subject, html, text }) {
  if (!config.email.brevoApiKey) {
    throw new Error('BREVO_API_KEY is required for EMAIL_PROVIDER=brevo');
  }
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': config.email.brevoApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: parseEmailIdentity(config.email.from),
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.code || 'Brevo email failed');
  }
  return data;
}

async function sendVerificationEmail({ to, verificationUrl, requestId }) {
  const { subject, html, text } = buildVerificationEmail(verificationUrl);

  if (config.email.provider === 'resend') {
    return await sendWithResend({ to, subject, html, text });
  }

  if (config.email.provider === 'brevo') {
    logger.info('Sending verification email with Brevo API', {
      to: maskEmail(to),
      requestId,
      from: config.email.from,
      apiKeyConfigured: Boolean(config.email.brevoApiKey)
    });
    return await sendWithBrevo({ to, subject, html, text });
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

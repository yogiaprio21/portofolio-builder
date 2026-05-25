const config = require('../src/config/env');
const { sendSmtpMail } = require('../src/services/smtpClient');

function mask(value) {
  const input = String(value || '');
  if (!input) return '(empty)';
  if (input.length <= 4) return '*'.repeat(input.length);
  return `${input.slice(0, 2)}${'*'.repeat(Math.max(4, input.length - 4))}${input.slice(-2)}`;
}

async function main() {
  const to = process.env.SMTP_TEST_TO || config.email.smtp.user;

  if (!config.email.smtp.host || !config.email.smtp.user || !config.email.smtp.pass) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required to verify SMTP delivery.');
  }

  console.log('SMTP verification starting');
  console.log(
    JSON.stringify({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      user: config.email.smtp.user,
      pass: mask(config.email.smtp.pass),
      passLength: config.email.smtp.pass.length,
      from: config.email.from,
      to,
      ehloName: config.email.smtp.ehloName,
      rejectUnauthorized: config.email.smtp.rejectUnauthorized
    })
  );

  await sendSmtpMail({
    smtp: config.email.smtp,
    from: config.email.from,
    to,
    subject: 'Portfolio Builder SMTP verification',
    text: 'SMTP verification succeeded.',
    html: '<p>SMTP verification succeeded.</p>'
  });

  console.log('SMTP verification email sent');
}

main().catch((err) => {
  console.error('SMTP verification failed');
  console.error(err.message);
  process.exit(1);
});

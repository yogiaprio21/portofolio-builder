const net = require('net');
const tls = require('tls');

function extractEmailAddress(value) {
  const input = String(value || '').trim();
  const match = input.match(/<([^>]+)>/);
  return (match ? match[1] : input).trim();
}

function encodeHeader(value) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function dotStuff(value) {
  return String(value || '')
    .replace(/\r?\n/g, '\r\n')
    .replace(/^\./gm, '..');
}

function buildMessage({ from, to, subject, html, text }) {
  const boundary = `pb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const safeSubject = encodeHeader(subject);
  const safeFrom = encodeHeader(from);
  const safeTo = encodeHeader(to);
  const plainText = text || String(html || '').replace(/<[^>]+>/g, ' ');

  return [
    `From: ${safeFrom}`,
    `To: ${safeTo}`,
    `Subject: ${safeSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    plainText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html || '',
    '',
    `--${boundary}--`,
    ''
  ].join('\r\n');
}

class SmtpConnection {
  constructor(options) {
    this.options = options;
    this.socket = null;
    this.buffer = '';
  }

  connectSocket() {
    const { host, port, secure, rejectUnauthorized } = this.options;
    return new Promise((resolve, reject) => {
      const onConnect = () => resolve();
      const onError = (err) => reject(err);
      this.socket = secure
        ? tls.connect({ host, port, servername: host, rejectUnauthorized }, onConnect)
        : net.connect({ host, port }, onConnect);
      this.socket.once('error', onError);
      this.socket.setTimeout(15000, () => {
        this.socket.destroy(new Error('SMTP connection timed out'));
      });
      this.socket.once('connect', () => {
        this.socket.off('error', onError);
      });
    });
  }

  readResponse() {
    return new Promise((resolve, reject) => {
      const onData = (chunk) => {
        this.buffer += chunk.toString('utf8');
        const lines = this.buffer.split(/\r?\n/).filter(Boolean);
        if (!lines.length) return;
        const last = lines[lines.length - 1];
        if (/^\d{3} /.test(last)) {
          this.socket.off('data', onData);
          this.socket.off('error', onError);
          const response = this.buffer.trimEnd();
          this.buffer = '';
          const code = Number(last.slice(0, 3));
          resolve({ code, response });
        }
      };
      const onError = (err) => {
        this.socket.off('data', onData);
        reject(err);
      };
      this.socket.on('data', onData);
      this.socket.once('error', onError);
    });
  }

  async expect(codes, label) {
    const result = await this.readResponse();
    const allowed = Array.isArray(codes) ? codes : [codes];
    if (!allowed.includes(result.code)) {
      throw new Error(`${label} failed: ${result.response}`);
    }
    return result;
  }

  send(command) {
    this.socket.write(`${command}\r\n`);
  }

  async command(command, codes, label = command) {
    this.send(command);
    return await this.expect(codes, label);
  }

  async authenticate() {
    const { user, pass } = this.options;
    const plainAuth = Buffer.from(`\u0000${user}\u0000${pass}`).toString('base64');
    try {
      await this.command(`AUTH PLAIN ${plainAuth}`, 235, 'AUTH PLAIN');
      return;
    } catch (err) {
      if (!/AUTH PLAIN failed/i.test(err.message)) throw err;
    }

    await this.command('AUTH LOGIN', 334, 'AUTH LOGIN');
    await this.command(Buffer.from(user).toString('base64'), 334, 'AUTH LOGIN username');
    await this.command(Buffer.from(pass).toString('base64'), 235, 'AUTH LOGIN password');
  }

  async upgradeToTls() {
    const { host, rejectUnauthorized } = this.options;
    await this.command('STARTTLS', 220, 'STARTTLS');
    this.socket = tls.connect({
      socket: this.socket,
      servername: host,
      rejectUnauthorized
    });
    await new Promise((resolve, reject) => {
      this.socket.once('secureConnect', resolve);
      this.socket.once('error', reject);
    });
  }

  close() {
    if (this.socket && !this.socket.destroyed) this.socket.end();
  }
}

async function sendSmtpMail({ smtp, from, to, subject, html, text }) {
  const connection = new SmtpConnection(smtp);
  await connection.connectSocket();
  try {
    await connection.expect(220, 'SMTP greeting');
    await connection.command(`EHLO ${smtp.ehloName}`, 250, 'EHLO');
    if (!smtp.secure) {
      await connection.upgradeToTls();
      await connection.command(`EHLO ${smtp.ehloName}`, 250, 'EHLO after STARTTLS');
    }

    await connection.authenticate();
    await connection.command(`MAIL FROM:<${extractEmailAddress(from)}>`, 250, 'MAIL FROM');
    await connection.command(`RCPT TO:<${extractEmailAddress(to)}>`, [250, 251], 'RCPT TO');
    await connection.command('DATA', 354, 'DATA');
    connection.send(`${dotStuff(buildMessage({ from, to, subject, html, text }))}\r\n.`);
    await connection.expect(250, 'message body');
    await connection.command('QUIT', 221, 'QUIT').catch(() => {});
    return { sent: true };
  } finally {
    connection.close();
  }
}

module.exports = { sendSmtpMail };

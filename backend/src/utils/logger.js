const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')] ?? levels.info;

function write(level, message, meta = {}) {
  if (levels[level] > currentLevel) return;
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  error(message, meta) {
    write('error', message, meta);
  },
  warn(message, meta) {
    write('warn', message, meta);
  },
  info(message, meta) {
    write('info', message, meta);
  },
  debug(message, meta) {
    write('debug', message, meta);
  }
};

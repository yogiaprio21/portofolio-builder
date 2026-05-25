require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/sequelize');
const config = require('./config/env');
const { runMigrations } = require('./db/migrator');
const Template = require('./models/Template');
require('./models/PortfolioItem');
require('./models/User');
require('./models/Session');
require('./models/UploadAsset');
const templateSeeds = require('./data/templates');
const logger = require('./utils/logger');
const { markFailed, markReady, markStarting } = require('./state/readiness');

const PORT = config.port;
let server;

async function initializeDatabase() {
  markStarting();
  logger.info('Database initialization starting');
  await runMigrations(sequelize);
  logger.info('Database migrations complete');

  let createdTemplates = 0;
  for (const seed of templateSeeds) {
    const existing = await Template.findByPk(seed.id);
    if (!existing) {
      await Template.create(seed);
      createdTemplates += 1;
    }
  }
  logger.info('Template seed complete', { createdTemplates });
  markReady();
}

async function start() {
  server = app.listen(PORT, () => logger.info('Backend running', { port: PORT }));
  initializeDatabase().catch((err) => {
    markFailed(err);
    logger.error('Backend startup failed', { error: err.message, stack: err.stack });
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

start();

async function shutdown(signal) {
  logger.info('Shutdown requested', { signal });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await sequelize.close().catch((err) => {
    logger.error('Failed to close database connection', { error: err.message });
  });
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

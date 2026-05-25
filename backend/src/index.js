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

const PORT = config.port;
let server;

async function start(){
  try{
    await runMigrations(sequelize);
    for (const seed of templateSeeds) {
      const existing = await Template.findByPk(seed.id);
      if (!existing) {
        await Template.create(seed);
      }
    }
    server = app.listen(PORT, () => logger.info('Backend running', { port: PORT }));
  }catch(err){
    logger.error('Backend startup failed', { error: err.message });
    process.exit(1);
  }
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

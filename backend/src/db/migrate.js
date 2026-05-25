require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const { runMigrations } = require('./migrator');

runMigrations(sequelize)
  .then(async () => {
    await sequelize.close();
    console.log('Migrations complete');
  })
  .catch(async (err) => {
    console.error('Migration failed:', err);
    await sequelize.close().catch(() => {});
    process.exit(1);
  });

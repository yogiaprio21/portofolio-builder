require('dotenv').config();
const { sequelize } = require('../src/config/sequelize');
require('../src/models/Template');
require('../src/models/User');
require('../src/models/Portfolio');
require('../src/models/PortfolioItem');
require('../src/models/Session');
require('../src/models/UploadAsset');
const { runMigrations } = require('../src/db/migrator');
const { seedDatabase } = require('../src/db/seeder');

async function main() {
  try {
    await runMigrations(sequelize);
    const result = await seedDatabase();
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

main();

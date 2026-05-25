const fs = require('fs');
const path = require('path');
const { DataTypes, QueryTypes } = require('sequelize');

const migrationsDir = path.join(__dirname, 'migrations');
const metaTable = 'SequelizeMeta';

async function tableExists(queryInterface, tableName, transaction) {
  try {
    await queryInterface.describeTable(tableName, { transaction });
    return true;
  } catch {
    return false;
  }
}

async function ensureMetaTable(queryInterface, transaction) {
  if (await tableExists(queryInterface, metaTable, transaction)) return;
  await queryInterface.createTable(
    metaTable,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      }
    },
    { transaction }
  );
}

function loadMigrations() {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+.*\.js$/.test(file))
    .sort()
    .map((file) => {
      const migration = require(path.join(migrationsDir, file));
      return {
        name: file,
        up: migration.up
      };
    });
}

async function executedMigrationNames(sequelize) {
  const rows = await sequelize.query(`SELECT name FROM "${metaTable}" ORDER BY name ASC`, {
    type: QueryTypes.SELECT
  });
  return new Set(rows.map((row) => row.name));
}

async function runMigrations(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.transaction(async (transaction) => {
    await ensureMetaTable(queryInterface, transaction);
  });

  const executed = await executedMigrationNames(sequelize);
  const migrations = loadMigrations();

  for (const migration of migrations) {
    if (executed.has(migration.name)) continue;

    await sequelize.transaction(async (transaction) => {
      await migration.up(queryInterface, DataTypes, { transaction, sequelize });
      await queryInterface.bulkInsert(
        metaTable,
        [{ name: migration.name }],
        { transaction }
      );
    });
    console.log(`Migration applied: ${migration.name}`);
  }
}

module.exports = { runMigrations };

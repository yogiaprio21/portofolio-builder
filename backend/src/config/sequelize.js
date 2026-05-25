const { Sequelize } = require('sequelize');
const config = require('./env');

const databaseUrl = config.databaseUrl;
const isPostgres = databaseUrl.startsWith('postgres');
const sequelize = new Sequelize(databaseUrl, {
  logging: false,
  dialectOptions: isPostgres
    ? {
        ssl: process.env.PG_SSL === 'true'
          ? { require: true, rejectUnauthorized: false }
          : undefined
      }
    : undefined
});

module.exports = { sequelize };

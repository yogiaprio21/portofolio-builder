const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';
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

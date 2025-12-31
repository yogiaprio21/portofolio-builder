const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';
const sequelize = new Sequelize(databaseUrl, {
  logging: false
});

module.exports = { sequelize };

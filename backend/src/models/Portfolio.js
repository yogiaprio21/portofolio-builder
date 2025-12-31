const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Portfolio = sequelize.define('Portfolio', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  bio: DataTypes.TEXT,
  skills: DataTypes.TEXT,
  experience: DataTypes.TEXT,
  template: DataTypes.INTEGER,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Portfolio;

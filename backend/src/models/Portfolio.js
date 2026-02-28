const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Portfolio = sequelize.define('Portfolio', {
  cv: DataTypes.JSON,
  templateId: DataTypes.INTEGER,
  theme: DataTypes.JSON,
  sectionsOrder: DataTypes.JSON,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Portfolio;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const PortfolioItem = sequelize.define('PortfolioItem', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url'
  },
  projectUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'project_url'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  portfolioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'portfolio_id'
  }
}, {
  tableName: 'portfolio',
  timestamps: true
});

module.exports = PortfolioItem;

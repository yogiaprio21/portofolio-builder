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
  imageProvider: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_provider'
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_public_id'
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

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const UploadAsset = sequelize.define('UploadAsset', {
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'local'
  },
  publicId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'public_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  portfolioItemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'portfolio_item_id'
  }
}, {
  tableName: 'upload_assets',
  timestamps: true
});

module.exports = UploadAsset;

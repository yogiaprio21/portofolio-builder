const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Session = sequelize.define('Session', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  refreshTokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'refresh_token_hash'
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_agent'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at'
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_used_at'
  }
}, {
  tableName: 'sessions',
  timestamps: true
});

module.exports = Session;

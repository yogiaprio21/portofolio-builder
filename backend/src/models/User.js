const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'email_verified' },
  verificationToken: { type: DataTypes.STRING, allowNull: true, field: 'verification_token' },
  verificationExpires: { type: DataTypes.DATE, allowNull: true, field: 'verification_expires' }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;

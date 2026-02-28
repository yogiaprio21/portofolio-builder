const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Template = sequelize.define('Template', {
  name: DataTypes.STRING,
  category: DataTypes.STRING,
  layout: DataTypes.STRING,
  style: DataTypes.JSON,
  sections: DataTypes.JSON,
  tags: DataTypes.JSON,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Template;

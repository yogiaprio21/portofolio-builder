async function tableExists(queryInterface, tableName, options) {
  try {
    await queryInterface.describeTable(tableName, options);
    return true;
  } catch {
    return false;
  }
}

async function ensureColumn(queryInterface, tableName, columnName, definition, options) {
  const description = await queryInterface.describeTable(tableName, options);
  if (!description[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition, options);
  }
}

module.exports = {
  async up(queryInterface, DataTypes, { transaction }) {
    if (await tableExists(queryInterface, 'Templates', { transaction })) {
      await ensureColumn(queryInterface, 'Templates', 'metadata', { type: DataTypes.JSON, allowNull: true }, { transaction });
    }
  }
};

async function tableExists(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function ensureColumn(queryInterface, tableName, columnName, definition, options) {
  const description = await queryInterface.describeTable(tableName);
  if (!description[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition, options);
  }
}

async function ensureTable(queryInterface, tableName, columns, options) {
  if (!(await tableExists(queryInterface, tableName))) {
    await queryInterface.createTable(tableName, columns, options);
  }
}

module.exports = {
  async up(queryInterface, DataTypes, { transaction }) {
    const timestamps = {
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    };

    await ensureTable(
      queryInterface,
      'users',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
        email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        verification_token: { type: DataTypes.STRING, allowNull: true },
        verification_expires: { type: DataTypes.DATE, allowNull: true },
        ...timestamps
      },
      { transaction }
    );

    await ensureTable(
      queryInterface,
      'Templates',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: true },
        category: { type: DataTypes.STRING, allowNull: true },
        layout: { type: DataTypes.STRING, allowNull: true },
        style: { type: DataTypes.JSON, allowNull: true },
        sections: { type: DataTypes.JSON, allowNull: true },
        tags: { type: DataTypes.JSON, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
        ...timestamps
      },
      { transaction }
    );

    await ensureTable(
      queryInterface,
      'Portfolios',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        cv: { type: DataTypes.JSON, allowNull: true },
        templateId: { type: DataTypes.INTEGER, allowNull: true },
        theme: { type: DataTypes.JSON, allowNull: true },
        sectionsOrder: { type: DataTypes.JSON, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        ...timestamps
      },
      { transaction }
    );

    await ensureTable(
      queryInterface,
      'portfolio',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        image_url: { type: DataTypes.STRING, allowNull: true },
        project_url: { type: DataTypes.STRING, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        portfolio_id: { type: DataTypes.INTEGER, allowNull: true },
        ...timestamps
      },
      { transaction }
    );

    if (await tableExists(queryInterface, 'portfolio')) {
      await ensureColumn(queryInterface, 'portfolio', 'user_id', { type: DataTypes.INTEGER, allowNull: true }, { transaction });
      await ensureColumn(queryInterface, 'portfolio', 'portfolio_id', { type: DataTypes.INTEGER, allowNull: true }, { transaction });
    }

    for (const tableName of ['Portfolios', 'portfolios']) {
      if (await tableExists(queryInterface, tableName)) {
        await ensureColumn(queryInterface, tableName, 'user_id', { type: DataTypes.INTEGER, allowNull: true }, { transaction });
      }
    }
  }
};

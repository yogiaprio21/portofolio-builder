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

async function addIndexIfMissing(queryInterface, tableName, fields, options) {
  try {
    await queryInterface.addIndex(tableName, fields, options);
  } catch (err) {
    const message = String(err?.message || '');
    if (!/already exists|duplicate|exists/i.test(message)) throw err;
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

    if (await tableExists(queryInterface, 'users')) {
      await ensureColumn(queryInterface, 'users', 'verification_sent_at', { type: DataTypes.DATE, allowNull: true }, { transaction });
    }

    if (await tableExists(queryInterface, 'portfolio')) {
      await ensureColumn(queryInterface, 'portfolio', 'image_provider', { type: DataTypes.STRING, allowNull: true }, { transaction });
      await ensureColumn(queryInterface, 'portfolio', 'image_public_id', { type: DataTypes.STRING, allowNull: true }, { transaction });
    }

    await ensureTable(
      queryInterface,
      'sessions',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        refresh_token_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
        user_agent: { type: DataTypes.STRING, allowNull: true },
        ip_address: { type: DataTypes.STRING, allowNull: true },
        expires_at: { type: DataTypes.DATE, allowNull: false },
        revoked_at: { type: DataTypes.DATE, allowNull: true },
        last_used_at: { type: DataTypes.DATE, allowNull: true },
        ...timestamps
      },
      { transaction }
    );

    await ensureTable(
      queryInterface,
      'upload_assets',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
        url: { type: DataTypes.STRING, allowNull: false },
        provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'local' },
        public_id: { type: DataTypes.STRING, allowNull: true },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        portfolio_item_id: { type: DataTypes.INTEGER, allowNull: true },
        ...timestamps
      },
      { transaction }
    );

    await addIndexIfMissing(queryInterface, 'sessions', ['user_id'], { name: 'idx_sessions_user_id', transaction });
    await addIndexIfMissing(queryInterface, 'sessions', ['refresh_token_hash'], { name: 'idx_sessions_refresh_token_hash', unique: true, transaction });
    await addIndexIfMissing(queryInterface, 'sessions', ['expires_at'], { name: 'idx_sessions_expires_at', transaction });
    await addIndexIfMissing(queryInterface, 'upload_assets', ['url'], { name: 'idx_upload_assets_url', transaction });
    await addIndexIfMissing(queryInterface, 'upload_assets', ['public_id'], { name: 'idx_upload_assets_public_id', transaction });
    await addIndexIfMissing(queryInterface, 'upload_assets', ['user_id'], { name: 'idx_upload_assets_user_id', transaction });
    await addIndexIfMissing(queryInterface, 'upload_assets', ['portfolio_item_id'], { name: 'idx_upload_assets_portfolio_item_id', transaction });
  }
};

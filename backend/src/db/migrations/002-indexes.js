async function tableExists(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function addIndexIfMissing(queryInterface, tableName, fields, options) {
  const existingIndexes = await queryInterface.showIndex(tableName, options);
  if (existingIndexes.some((index) => index.name === options.name)) return;
  await queryInterface.addIndex(tableName, fields, options);
}

module.exports = {
  async up(queryInterface, DataTypes, { transaction }) {
    if (await tableExists(queryInterface, 'users')) {
      await addIndexIfMissing(queryInterface, 'users', ['email'], {
        name: 'idx_users_email',
        unique: true,
        transaction
      });
      await addIndexIfMissing(queryInterface, 'users', ['verification_token'], {
        name: 'idx_users_verification_token',
        transaction
      });
    }

    if (await tableExists(queryInterface, 'portfolio')) {
      await addIndexIfMissing(queryInterface, 'portfolio', ['user_id'], {
        name: 'idx_portfolio_user_id',
        transaction
      });
      await addIndexIfMissing(queryInterface, 'portfolio', ['portfolio_id'], {
        name: 'idx_portfolio_portfolio_id',
        transaction
      });
      await addIndexIfMissing(queryInterface, 'portfolio', ['createdAt'], {
        name: 'idx_portfolio_created_at',
        transaction
      });
    }

    for (const tableName of ['Portfolios', 'portfolios']) {
      if (await tableExists(queryInterface, tableName)) {
        await addIndexIfMissing(queryInterface, tableName, ['user_id'], {
          name: `idx_${tableName.toLowerCase()}_user_id`,
          transaction
        });
      }
    }
  }
};

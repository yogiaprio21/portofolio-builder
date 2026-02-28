require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/sequelize');
const Template = require('./models/Template');
require('./models/PortfolioItem');
const User = require('./models/User');
const templateSeeds = require('./data/templates');

const PORT = process.env.PORT || 3000;

async function start(){
  try{
    await sequelize.sync();
    const qi = sequelize.getQueryInterface();
    try {
      const desc = await qi.describeTable('portfolio');
      if (!desc.user_id) {
        await qi.addColumn('portfolio', 'user_id', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
      }
      if (!desc.portfolio_id) {
        await qi.addColumn('portfolio', 'portfolio_id', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
      }
    } catch (e) {
      console.error('Table introspection/addColumn error:', e);
    }
    try {
      const portfolioTableCandidates = ['Portfolios', 'portfolios'];
      for (const tableName of portfolioTableCandidates) {
        try {
          const desc = await qi.describeTable(tableName);
          if (!desc.user_id) {
            await qi.addColumn(tableName, 'user_id', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
          }
          break;
        } catch {}
      }
    } catch (e) {
      console.error('Portfolio table addColumn error:', e);
    }
    for (const seed of templateSeeds) {
      const existing = await Template.findByPk(seed.id);
      if (!existing) {
        await Template.create(seed);
      }
    }
    app.listen(PORT, ()=> console.log(`Backend running on ${PORT}`));
  }catch(err){
    console.error(err);
  }
}

start();

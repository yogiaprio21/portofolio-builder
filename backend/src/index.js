require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/sequelize');

const PORT = process.env.PORT || 3000;

async function start(){
  try{
    await sequelize.sync(); // sync models
    app.listen(PORT, ()=> console.log(`Backend running on ${PORT}`));
  }catch(err){
    console.error(err);
  }
}

start();

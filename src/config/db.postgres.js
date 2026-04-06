const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    // In production, migrations should be handled properly. We use sync for this project template.
    await sequelize.sync(); 
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };

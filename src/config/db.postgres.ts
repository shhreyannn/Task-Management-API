import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(
  env.POSTGRES_DB as string,
  env.POSTGRES_USER as string,
  env.POSTGRES_PASSWORD as string,
  {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT as number,
    dialect: 'postgres',
    logging: false,
  },
);

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

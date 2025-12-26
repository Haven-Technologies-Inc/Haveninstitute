import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { models } from '../models';

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'haven_institute',
  dialect: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'haven_user',
  password: process.env.DB_PASSWORD,
  models: models,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 10,
    min: Number(process.env.DB_POOL_MIN) || 2,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timezone: '+00:00',
    ssl: process.env.DB_SSL === 'true' ? true : false
  },
  timezone: '+00:00',
  define: {
    timestamps: true,
    underscored: true
  }
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Only sync new tables, don't alter existing ones
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

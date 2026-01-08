/**
 * Migration Runner - Execute SQL migrations in order
 * Run with: npx ts-node src/database/migrations/run-migrations.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../../utils/logger';

dotenv.config();

async function runMigrations() {
  logger.info('Starting database migrations...');

  const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'haven_institute',
    dialect: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'haven_user',
    password: process.env.DB_PASSWORD,
    logging: false
  });

  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Get migration files
    const migrationsDir = __dirname;
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    logger.info(`Found ${files.length} migration files`);

    for (const file of files) {
      logger.info(`Running: ${file}`);
      
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf8');

      // Split by semicolon and filter empty statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await sequelize.query(statement);
        } catch (error: any) {
          // Ignore "table already exists" errors
          if (error.original?.errno === 1050) {
            logger.info(`Table already exists, skipping...`);
          } else {
            throw error;
          }
        }
      }

      logger.info(`Completed: ${file}`);
    }

    logger.info('All migrations completed successfully!');

  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();

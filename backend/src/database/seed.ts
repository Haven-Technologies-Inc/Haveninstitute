/**
 * Database Seeder - Run all seeders
 */
import { sequelize } from '../config/database';
import { seedUsers } from './seeders/users.seeder';
import { logger } from '../utils/logger';

async function runSeeders() {
  try {
    logger.info('Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connected');

    // Run seeders
    await seedUsers();

    logger.info('All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();

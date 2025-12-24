/**
 * Database Seeder - Run all seeders
 */
import { sequelize } from '../config/database';
import { seedUsers } from './seeders/users.seeder';

async function runSeeders() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Run seeders
    await seedUsers();

    console.log('✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();

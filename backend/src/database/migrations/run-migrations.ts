/**
 * Migration Runner - Execute SQL migrations in order
 * Run with: npx ts-node src/database/migrations/run-migrations.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

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
    console.log('✅ Database connection established\n');

    // Get migration files
    const migrationsDir = __dirname;
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`📄 Running: ${file}`);
      
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
            console.log(`   ⏭️  Table already exists, skipping...`);
          } else {
            throw error;
          }
        }
      }

      console.log(`   ✅ Completed\n`);
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();

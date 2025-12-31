/**
 * Fix books table - add missing columns
 * Run with: npx ts-node src/database/fix-books-table.ts
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function fixBooksTable() {
  console.log('🚀 Fixing books table...\n');

  const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'haven_institute',
    dialect: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'haven_user',
    password: process.env.DB_PASSWORD,
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Add missing columns to books table
    const alterStatements = [
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) NULL",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS duration_minutes INT NULL",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'",
      "ALTER TABLE books ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN DEFAULT FALSE",
      "ALTER TABLE books MODIFY COLUMN format ENUM('pdf', 'epub', 'video', 'audio') DEFAULT 'pdf'",
    ];

    for (const sql of alterStatements) {
      try {
        await sequelize.query(sql);
        console.log(`✅ ${sql.substring(0, 60)}...`);
      } catch (e: any) {
        if (e.original?.errno === 1060) {
          console.log(`⏭️  Column already exists, skipping...`);
        } else {
          console.error(`❌ Failed: ${e.message}`);
        }
      }
    }

    console.log('\n🎉 Books table fixed!');

  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixBooksTable();

/**
 * Quick migration to add OAuth and MFA columns to users table
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function addOAuthColumns() {
  const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'haven_institute',
    dialect: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'haven_user',
    password: process.env.DB_PASSWORD,
    logging: false
  });

  const columns = [
    { name: 'google_id', sql: 'ALTER TABLE users ADD COLUMN google_id VARCHAR(100) NULL' },
    { name: 'apple_id', sql: 'ALTER TABLE users ADD COLUMN apple_id VARCHAR(100) NULL' },
    { name: 'auth_provider', sql: "ALTER TABLE users ADD COLUMN auth_provider ENUM('local', 'google', 'apple') DEFAULT 'local'" },
    { name: 'mfa_enabled', sql: 'ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE' },
    { name: 'mfa_secret', sql: 'ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(100) NULL' },
    { name: 'mfa_backup_codes', sql: 'ALTER TABLE users ADD COLUMN mfa_backup_codes JSON NULL' },
  ];

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    for (const col of columns) {
      try {
        await sequelize.query(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (error: any) {
        if (error.original?.errno === 1060) {
          console.log(`⏭️  Column ${col.name} already exists`);
        } else {
          console.log(`❌ Error adding ${col.name}:`, error.message);
        }
      }
    }

    // Add indexes
    try {
      await sequelize.query('CREATE INDEX idx_users_google_id ON users(google_id)');
      console.log('✅ Added index: idx_users_google_id');
    } catch (e: any) {
      if (e.original?.errno === 1061) console.log('⏭️  Index idx_users_google_id already exists');
    }

    try {
      await sequelize.query('CREATE INDEX idx_users_apple_id ON users(apple_id)');
      console.log('✅ Added index: idx_users_apple_id');
    } catch (e: any) {
      if (e.original?.errno === 1061) console.log('⏭️  Index idx_users_apple_id already exists');
    }

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

addOAuthColumns();

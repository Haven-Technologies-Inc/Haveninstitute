/**
 * Migration: Create study group tables
 * Run with: npx ts-node src/database/create-study-group-tables.ts
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🚀 Creating study group tables...\n');

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

    // Create study_groups table
    console.log('Creating study_groups table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS study_groups (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by CHAR(36) NOT NULL,
        max_members INT DEFAULT 6,
        is_public BOOLEAN DEFAULT TRUE,
        category VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_created_by (created_by),
        INDEX idx_is_public (is_public),
        INDEX idx_category (category)
      ) ENGINE=InnoDB
    `);
    console.log('✅ study_groups table created\n');

    // Create group_members table
    console.log('Creating group_members table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        group_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        role ENUM('creator', 'admin', 'member') DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_group_user (group_id, user_id),
        INDEX idx_group_id (group_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB
    `);
    console.log('✅ group_members table created\n');

    // Create group_messages table
    console.log('Creating group_messages table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        group_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        message_type ENUM('text', 'image', 'resource_link') DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_group_id (group_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB
    `);
    console.log('✅ group_messages table created\n');

    // Create group_invitations table
    console.log('Creating group_invitations table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS group_invitations (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        group_id CHAR(36) NOT NULL,
        inviter_id CHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE,
        status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_group_id (group_id),
        INDEX idx_token (token)
      ) ENGINE=InnoDB
    `);
    console.log('✅ group_invitations table created\n');

    console.log('✅ All study group tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();

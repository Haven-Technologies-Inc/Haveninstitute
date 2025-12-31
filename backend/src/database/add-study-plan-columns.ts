/**
 * Migration: Add missing columns to study_plans table
 * Run with: npx ts-node src/database/add-study-plan-columns.ts
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🚀 Adding missing columns to study_plans table...\n');

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

    // Create study_plans table if it doesn't exist
    console.log('Creating study_plans table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        started_at DATETIME,
        exam_date DATE,
        status ENUM('draft', 'active', 'completed', 'abandoned') DEFAULT 'active',
        study_hours_per_day DECIMAL(4, 2) DEFAULT 2.00,
        focus_areas JSON DEFAULT ('[]'),
        weak_areas JSON DEFAULT ('[]'),
        preferences JSON,
        progress JSON,
        ai_generated BOOLEAN DEFAULT FALSE,
        ai_insights JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `);
    console.log('✅ study_plans table created\n');

    // Create study_plan_tasks table if it doesn't exist
    console.log('Creating study_plan_tasks table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS study_plan_tasks (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        plan_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('quiz', 'cat', 'flashcard', 'reading', 'video', 'review', 'practice', 'custom') DEFAULT 'custom',
        category VARCHAR(255),
        topic VARCHAR(255),
        scheduled_date DATE NOT NULL,
        estimated_minutes INT DEFAULT 30,
        actual_minutes INT,
        status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
        completed_at DATETIME,
        priority INT DEFAULT 1,
        sort_order INT DEFAULT 0,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
        INDEX idx_plan_id (plan_id),
        INDEX idx_scheduled_date (scheduled_date)
      ) ENGINE=InnoDB
    `);
    console.log('✅ study_plan_tasks table created\n');

    // Create study_plan_milestones table if it doesn't exist
    console.log('Creating study_plan_milestones table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS study_plan_milestones (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        plan_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date DATE NOT NULL,
        status ENUM('pending', 'achieved', 'missed') DEFAULT 'pending',
        achieved_at DATETIME,
        criteria JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
        INDEX idx_plan_id (plan_id)
      ) ENGINE=InnoDB
    `);
    console.log('✅ study_plan_milestones table created\n');

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();

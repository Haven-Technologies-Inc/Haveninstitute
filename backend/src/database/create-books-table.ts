/**
 * Create books table directly
 * Run with: npx ts-node src/database/create-books-table.ts
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function createBooksTable() {
  console.log('🚀 Creating books table...\n');

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

    // Create books table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS books (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url VARCHAR(500),
        file_url VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        format ENUM('epub', 'pdf', 'video', 'audio') DEFAULT 'pdf',
        page_count INT,
        file_size INT,
        isbn VARCHAR(20),
        publisher VARCHAR(255),
        published_at DATE,
        language VARCHAR(10) DEFAULT 'en',
        price DECIMAL(10, 2) DEFAULT 0,
        is_free BOOLEAN DEFAULT TRUE,
        is_premium_only BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT FALSE,
        tags JSON,
        metadata JSON,
        download_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        average_rating DECIMAL(3, 2) DEFAULT 0,
        rating_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Books table created\n');

    // Create user_books table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_books (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        book_id CHAR(36) NOT NULL,
        current_page INT DEFAULT 0,
        total_pages INT DEFAULT 0,
        progress_percent DECIMAL(5, 2) DEFAULT 0,
        last_read_at TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        is_favorite BOOLEAN DEFAULT FALSE,
        highlights JSON,
        bookmarks JSON,
        notes JSON,
        rating INT,
        review TEXT,
        time_spent_minutes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_book (user_id, book_id)
      )
    `);
    console.log('✅ User_books table created\n');

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createBooksTable();

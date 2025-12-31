/**
 * Create flashcard tables migration
 */

import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

async function createFlashcardTables() {
  console.log('Creating flashcard tables...');

  try {
    // Create flashcard_decks table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS flashcard_decks (
        id CHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        tags JSON,
        is_public BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        card_count INT DEFAULT 0,
        color VARCHAR(7) DEFAULT '#6366f1',
        icon VARCHAR(50),
        created_by CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `, { type: QueryTypes.RAW });
    console.log('✅ flashcard_decks table created');

    // Create flashcards table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id CHAR(36) PRIMARY KEY,
        deck_id CHAR(36) NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        notes TEXT,
        image_url VARCHAR(500),
        tags JSON,
        is_active BOOLEAN DEFAULT TRUE,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
      )
    `, { type: QueryTypes.RAW });
    console.log('✅ flashcards table created');

    // Create user_flashcard_progress table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_flashcard_progress (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        flashcard_id CHAR(36) NOT NULL,
        ease_factor FLOAT DEFAULT 2.5,
        \`interval\` INT DEFAULT 0,
        repetitions INT DEFAULT 0,
        next_review DATETIME NULL,
        last_reviewed DATETIME NULL,
        times_reviewed INT DEFAULT 0,
        times_correct INT DEFAULT 0,
        mastery_level VARCHAR(20) DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_flashcard (user_id, flashcard_id)
      )
    `, { type: QueryTypes.RAW });
    console.log('✅ user_flashcard_progress table created');

    console.log('\n✅ All flashcard tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Run migration
createFlashcardTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

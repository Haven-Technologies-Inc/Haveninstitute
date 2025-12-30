import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function createSystemSettingsTable() {
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
    console.log('✅ Connected to database\n');

    // Create table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'general',
        description VARCHAR(255),
        is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
        is_secret BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created system_settings table');

    // Add AI settings
    const settings = [
      { key: 'openai_api_key', category: 'ai', description: 'OpenAI API Key', isSecret: true, value: null },
      { key: 'openai_model', category: 'ai', description: 'OpenAI Model', isSecret: false, value: 'gpt-4-turbo-preview' },
      { key: 'deepseek_api_key', category: 'ai', description: 'DeepSeek API Key', isSecret: true, value: null },
      { key: 'ai_provider', category: 'ai', description: 'Default AI Provider', isSecret: false, value: 'openai' },
      { key: 'enable_ai_chat', category: 'features', description: 'Enable AI Chat', isSecret: false, value: 'true' },
    ];

    for (const s of settings) {
      await sequelize.query(
        `INSERT INTO system_settings (id, setting_key, value, category, description, is_secret) 
         VALUES (UUID(), ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        { replacements: [s.key, s.value, s.category, s.description, s.isSecret] }
      );
      console.log(`✅ Added: ${s.key}`);
    }

    console.log('\n🎉 System settings table ready!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

createSystemSettingsTable();

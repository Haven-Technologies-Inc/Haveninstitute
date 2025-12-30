import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function addAISettings() {
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

    // Add AI settings
    const aiSettings = [
      { key: 'openai_api_key', category: 'ai', description: 'OpenAI API Key', isSecret: true },
      { key: 'openai_model', category: 'ai', description: 'OpenAI Model', isSecret: false, defaultValue: 'gpt-4-turbo-preview' },
      { key: 'deepseek_api_key', category: 'ai', description: 'DeepSeek API Key', isSecret: true },
      { key: 'ai_provider', category: 'ai', description: 'Default AI Provider (openai/deepseek)', isSecret: false, defaultValue: 'openai' },
    ];

    for (const setting of aiSettings) {
      try {
        await sequelize.query(
          `INSERT INTO system_settings (\`key\`, value, category, description, is_secret) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE description = VALUES(description)`,
          {
            replacements: [setting.key, setting.defaultValue || null, setting.category, setting.description, setting.isSecret]
          }
        );
        console.log(`✅ Added setting: ${setting.key}`);
      } catch (error: any) {
        console.log(`⏭️ Setting ${setting.key}: ${error.message.slice(0, 50)}`);
      }
    }

    console.log('\n🎉 AI settings added!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

addAISettings();

/**
 * Set OpenAI API Key in database
 * Usage: npx ts-node src/database/set-openai-key.ts YOUR_API_KEY
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function setOpenAIKey() {
  const apiKey = process.argv[2];
  
  if (!apiKey) {
    console.log('Usage: npx ts-node src/database/set-openai-key.ts sk-your-api-key-here');
    process.exit(1);
  }

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
    
    await sequelize.query(
      `UPDATE system_settings SET value = ? WHERE setting_key = 'openai_api_key'`,
      { replacements: [apiKey] }
    );
    
    console.log('✅ OpenAI API key saved to database!');
    console.log('🔄 Restart the backend server to apply changes.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

setOpenAIKey();

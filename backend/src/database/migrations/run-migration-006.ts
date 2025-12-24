import { Sequelize } from 'sequelize-typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const sequelize = new Sequelize({
    dialect: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'haven_institute',
    logging: console.log,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const migrationPath = path.join(__dirname, '006_create_remaining_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    console.log(`\n📝 Running ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.length > 10) {
        try {
          await sequelize.query(stmt);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (err: any) {
          if (err.message.includes('already exists') || err.message.includes('Duplicate')) {
            console.log(`⚠️ Statement ${i + 1}: Already exists, skipping`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, err.message);
          }
        }
      }
    }

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();

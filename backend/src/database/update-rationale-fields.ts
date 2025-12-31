/**
 * Update rationale fields to TEXT type for longer content
 */

import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

async function updateRationaleFields() {
  console.log('Updating rationale fields to TEXT type...');

  try {
    // Update rationale_correct to TEXT
    await sequelize.query(`
      ALTER TABLE questions 
      MODIFY COLUMN rationale_correct TEXT
    `, { type: QueryTypes.RAW });
    console.log('✅ rationale_correct updated to TEXT');

    // Update rationale_incorrect to TEXT  
    await sequelize.query(`
      ALTER TABLE questions 
      MODIFY COLUMN rationale_incorrect TEXT
    `, { type: QueryTypes.RAW });
    console.log('✅ rationale_incorrect updated to TEXT');

    // Add clinical_pearl column if not exists
    await sequelize.query(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS clinical_pearl TEXT
    `, { type: QueryTypes.RAW });
    console.log('✅ clinical_pearl column added/verified');

    // Add scenario column if not exists (for case studies)
    await sequelize.query(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS scenario TEXT
    `, { type: QueryTypes.RAW });
    console.log('✅ scenario column added/verified');

    console.log('\n✅ All rationale fields updated successfully!');
  } catch (error: any) {
    // Handle "column already exists" gracefully
    if (error.message?.includes('Duplicate column')) {
      console.log('Some columns already exist, continuing...');
    } else {
      console.error('Error updating fields:', error);
      throw error;
    }
  }
}

// Run migration
updateRationaleFields()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

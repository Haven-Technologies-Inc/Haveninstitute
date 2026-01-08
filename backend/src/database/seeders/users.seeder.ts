import { User } from '../../models/User';
import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger';

export async function seedUsers() {
  logger.info('Seeding users...');

  // Pre-hash the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('kingston@2025USA', salt);

  const users = [
    {
      email: 'adeenamoses@gmail.com',
      fullName: 'Adeena Moses',
      role: 'student',
      subscriptionTier: 'Premium',
      hasCompletedOnboarding: true,
      emailVerified: true,
      isActive: true,
      nclexType: 'RN',
      goals: ['Pass NCLEX-RN', 'Become a Registered Nurse'],
    },
    {
      email: 'thehaven750@gmail.com',
      fullName: 'Haven Admin',
      role: 'admin',
      subscriptionTier: 'Premium',
      hasCompletedOnboarding: true,
      emailVerified: true,
      isActive: true,
    },
  ];

  for (const userData of users) {
    try {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        logger.info(`User ${userData.email} already exists, resetting password...`);
        // Use raw query to bypass hooks and set the pre-hashed password
        await User.sequelize?.query(
          `UPDATE users SET password_hash = ?, full_name = ?, role = ?, subscription_tier = ?, 
           has_completed_onboarding = ?, email_verified = ?, is_active = ?, updated_at = NOW() 
           WHERE email = ?`,
          {
            replacements: [
              hashedPassword,
              userData.fullName,
              userData.role,
              userData.subscriptionTier,
              userData.hasCompletedOnboarding ? 1 : 0,
              userData.emailVerified ? 1 : 0,
              userData.isActive ? 1 : 0,
              userData.email
            ]
          }
        );
      } else {
        logger.info(`Creating user ${userData.email}...`);
        // Use raw query to bypass hooks
        await User.sequelize?.query(
          `INSERT INTO users (id, email, password_hash, full_name, role, subscription_tier, 
           has_completed_onboarding, email_verified, is_active, created_at, updated_at) 
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          {
            replacements: [
              userData.email,
              hashedPassword,
              userData.fullName,
              userData.role,
              userData.subscriptionTier,
              userData.hasCompletedOnboarding ? 1 : 0,
              userData.emailVerified ? 1 : 0,
              userData.isActive ? 1 : 0
            ]
          }
        );
      }
      logger.info(`User ${userData.email} ready!`);
    } catch (error) {
      logger.error(`Error seeding user ${userData.email}:`, error);
    }
  }

  logger.info('Users seeded successfully!');
}

// Run directly if called as script
if (require.main === module) {
  const { sequelize } = require('../../config/database');

  sequelize.authenticate()
    .then(() => seedUsers())
    .then(() => {
      logger.info('Done!');
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error('Seeding failed:', err);
      process.exit(1);
    });
}

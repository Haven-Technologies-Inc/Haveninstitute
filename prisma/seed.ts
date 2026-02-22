import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create NCLEX categories
  const categories = await Promise.all([
    prisma.nCLEXCategory.upsert({
      where: { code: 'MGMT_CARE' },
      update: {},
      create: { name: 'Management of Care', code: 'MGMT_CARE', description: 'Providing integrated, cost-effective care', displayOrder: 1 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'SAFETY_INFECT' },
      update: {},
      create: { name: 'Safety and Infection Control', code: 'SAFETY_INFECT', description: 'Protecting clients and healthcare personnel', displayOrder: 2 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'HEALTH_PROMO' },
      update: {},
      create: { name: 'Health Promotion and Maintenance', code: 'HEALTH_PROMO', description: 'Health promotion and disease prevention', displayOrder: 3 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'PSYCHOSOCIAL' },
      update: {},
      create: { name: 'Psychosocial Integrity', code: 'PSYCHOSOCIAL', description: 'Emotional, mental, and social well-being', displayOrder: 4 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'BASIC_CARE' },
      update: {},
      create: { name: 'Basic Care and Comfort', code: 'BASIC_CARE', description: 'Activities of daily living', displayOrder: 5 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'PHARMACOLOGY' },
      update: {},
      create: { name: 'Pharmacological Therapies', code: 'PHARMACOLOGY', description: 'Medication administration', displayOrder: 6 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'RISK_REDUCTION' },
      update: {},
      create: { name: 'Reduction of Risk Potential', code: 'RISK_REDUCTION', description: 'Reducing complications', displayOrder: 7 },
    }),
    prisma.nCLEXCategory.upsert({
      where: { code: 'PHYSIO_ADAPT' },
      update: {},
      create: { name: 'Physiological Adaptation', code: 'PHYSIO_ADAPT', description: 'Acute, chronic, or life-threatening conditions', displayOrder: 8 },
    }),
  ]);

  console.log(`Created ${categories.length} NCLEX categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@havenstudy.com' },
    update: {},
    create: {
      email: 'admin@havenstudy.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      subscriptionTier: 'Premium',
      emailVerified: true,
      hasCompletedOnboarding: true,
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create demo student
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@havenstudy.com' },
    update: {},
    create: {
      email: 'student@havenstudy.com',
      passwordHash: studentPassword,
      fullName: 'Demo Student',
      role: 'student',
      subscriptionTier: 'Pro',
      emailVerified: true,
      hasCompletedOnboarding: true,
      nclexType: 'RN',
      examDate: new Date('2026-06-15'),
    },
  });

  console.log(`Created student user: ${student.email}`);

  // Create sample questions
  const sampleQuestions = [
    {
      categoryId: categories[0]!.id,
      questionText: 'A nurse is delegating tasks to an unlicensed assistive personnel (UAP). Which task is appropriate to delegate?',
      questionType: 'multiple_choice' as const,
      options: JSON.stringify([
        { id: 'a', text: 'Measuring intake and output', isCorrect: true },
        { id: 'b', text: 'Assessing a new admission', isCorrect: false },
        { id: 'c', text: 'Developing a care plan', isCorrect: false },
        { id: 'd', text: 'Teaching a patient about medications', isCorrect: false },
      ]),
      difficulty: 'medium' as const,
      explanation: 'Measuring I&O is a routine task that can be delegated to UAP. Assessment, care planning, and patient education require nursing judgment.',
      rationale: 'The five rights of delegation: right task, right circumstance, right person, right direction/communication, right supervision.',
    },
    {
      categoryId: categories[1]!.id,
      questionText: 'Which action is the priority when a fire alarm sounds on a hospital unit?',
      questionType: 'multiple_choice' as const,
      options: JSON.stringify([
        { id: 'a', text: 'Close all doors and windows', isCorrect: false },
        { id: 'b', text: 'Rescue patients in immediate danger', isCorrect: true },
        { id: 'c', text: 'Activate the fire alarm', isCorrect: false },
        { id: 'd', text: 'Extinguish the fire', isCorrect: false },
      ]),
      difficulty: 'easy' as const,
      explanation: 'RACE acronym: Rescue, Alarm, Contain, Extinguish. Rescue is always the first priority.',
      rationale: 'Patient safety is the top priority. RACE protocol guides the order of actions during a fire.',
    },
    {
      categoryId: categories[5]!.id,
      questionText: 'A patient is receiving heparin therapy. Which lab value should the nurse monitor?',
      questionType: 'multiple_choice' as const,
      options: JSON.stringify([
        { id: 'a', text: 'INR', isCorrect: false },
        { id: 'b', text: 'aPTT', isCorrect: true },
        { id: 'c', text: 'PT', isCorrect: false },
        { id: 'd', text: 'Platelet count only', isCorrect: false },
      ]),
      difficulty: 'medium' as const,
      explanation: 'aPTT (activated partial thromboplastin time) monitors heparin therapy. INR/PT monitors warfarin.',
      rationale: 'Heparin affects the intrinsic pathway; aPTT measures intrinsic pathway function.',
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.question.create({
      data: {
        ...q,
        createdBy: admin.id,
        isVerified: true,
      },
    });
  }

  console.log(`Created ${sampleQuestions.length} sample questions`);

  // Create discussion categories
  const discussionCategories = [
    { name: 'General Discussion', slug: 'general', icon: 'message-circle', color: '#6366f1', displayOrder: 1 },
    { name: 'Study Tips', slug: 'study-tips', icon: 'lightbulb', color: '#f59e0b', displayOrder: 2 },
    { name: 'Question Help', slug: 'question-help', icon: 'help-circle', color: '#10b981', displayOrder: 3 },
    { name: 'Test Day Tips', slug: 'test-day', icon: 'calendar', color: '#ef4444', displayOrder: 4 },
    { name: 'Success Stories', slug: 'success-stories', icon: 'trophy', color: '#8b5cf6', displayOrder: 5 },
  ];

  for (const cat of discussionCategories) {
    await prisma.discussionCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, description: `${cat.name} forum category` },
    });
  }

  console.log(`Created ${discussionCategories.length} discussion categories`);

  // Create achievements
  const achievements = [
    { name: 'First Steps', description: 'Complete your first practice question', achievementType: 'questions', thresholdValue: 1, xpReward: 10, rarity: 'common', icon: 'footprints' },
    { name: 'Century Club', description: 'Complete 100 practice questions', achievementType: 'questions', thresholdValue: 100, xpReward: 100, rarity: 'uncommon', icon: 'award' },
    { name: 'On Fire', description: 'Maintain a 3-day study streak', achievementType: 'streak', thresholdValue: 3, xpReward: 50, rarity: 'common', icon: 'fire' },
    { name: 'Week Warrior', description: 'Maintain a 7-day study streak', achievementType: 'streak', thresholdValue: 7, xpReward: 100, rarity: 'uncommon', icon: 'calendar' },
    { name: 'Perfect Score', description: 'Get 100% on a quiz with 10+ questions', achievementType: 'score', thresholdValue: 100, xpReward: 150, rarity: 'uncommon', icon: 'star' },
    { name: 'CAT Conqueror', description: 'Pass a CAT session', achievementType: 'milestone', thresholdValue: 1, xpReward: 75, rarity: 'common', icon: 'graduation-cap' },
  ];

  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }

  console.log(`Created ${achievements.length} achievements`);
  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

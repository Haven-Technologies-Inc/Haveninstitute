// ============================================================================
// SEED QUESTIONS SCRIPT
// ============================================================================
// Seeds the database with questions from catQuestions.ts
// Run this script to populate the question bank

import { questionApi } from '../services/questionApi';
import type { QuestionCreateInput } from '../lib/types';

// Import all CAT questions
// Note: You'll need to update the import path if the data file location changes
import catQuestionBank from '../data/catQuestions';

/**
 * Seed all CAT questions into the database
 */
export const seedCATQuestions = async (userId: string): Promise<void> => {
  console.log('Starting to seed CAT questions...');
  console.log(`Total questions to seed: ${catQuestionBank.length}`);

  try {
    // Convert CAT questions to QuestionCreateInput format
    const questionsToSeed: QuestionCreateInput[] = catQuestionBank.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      rationales: q.rationales,
      category: q.category,
      subcategory: undefined, // CAT questions don't have subcategories
      difficulty: q.difficulty,
      discrimination: q.discrimination,
      tags: ['CAT', 'NCLEX', q.category],
      questionType: 'multiple_choice',
      isPublic: true
    }));

    // Seed in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questionsToSeed.length; i += batchSize) {
      const batch = questionsToSeed.slice(i, i + batchSize);
      console.log(`Seeding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questionsToSeed.length / batchSize)}...`);

      try {
        const result = await questionApi.createQuestionsBulk(batch, userId);
        successCount += result.length;
        console.log(`  ✓ Successfully seeded ${result.length} questions`);
      } catch (error) {
        errorCount += batch.length;
        console.error(`  ✗ Error seeding batch:`, error);
      }

      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n=== Seeding Complete ===');
    console.log(`✓ Successfully seeded: ${successCount} questions`);
    console.log(`✗ Failed to seed: ${errorCount} questions`);
    console.log(`Total: ${successCount + errorCount} questions`);

  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
};

/**
 * Seed questions by category
 */
export const seedQuestionsByCategory = async (
  category: string,
  userId: string
): Promise<void> => {
  console.log(`Seeding questions for category: ${category}`);

  const categoryQuestions = catQuestionBank.filter(q => q.category === category);

  if (categoryQuestions.length === 0) {
    console.log(`No questions found for category: ${category}`);
    return;
  }

  console.log(`Found ${categoryQuestions.length} questions`);

  try {
    const questionsToSeed: QuestionCreateInput[] = categoryQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      rationales: q.rationales,
      category: q.category,
      difficulty: q.difficulty,
      discrimination: q.discrimination,
      tags: ['CAT', 'NCLEX', q.category],
      questionType: 'multiple_choice',
      isPublic: true
    }));

    const result = await questionApi.createQuestionsBulk(questionsToSeed, userId);
    console.log(`✓ Successfully seeded ${result.length} questions for ${category}`);
  } catch (error) {
    console.error(`Error seeding questions for ${category}:`, error);
    throw error;
  }
};

/**
 * Get seeding statistics
 */
export const getSeedingStats = () => {
  const stats = {
    totalQuestions: catQuestionBank.length,
    byCategory: {} as Record<string, number>,
    byDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0
    }
  };

  catQuestionBank.forEach(q => {
    // Count by category
    if (!stats.byCategory[q.category]) {
      stats.byCategory[q.category] = 0;
    }
    stats.byCategory[q.category]++;

    // Count by difficulty
    stats.byDifficulty[q.difficulty]++;
  });

  return stats;
};

/**
 * Print seeding statistics
 */
export const printSeedingStats = () => {
  const stats = getSeedingStats();

  console.log('\n=== CAT Questions Statistics ===');
  console.log(`Total Questions: ${stats.totalQuestions}\n`);

  console.log('By Category:');
  Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

  console.log('\nBy Difficulty:');
  console.log(`  Easy: ${stats.byDifficulty.easy}`);
  console.log(`  Medium: ${stats.byDifficulty.medium}`);
  console.log(`  Hard: ${stats.byDifficulty.hard}`);
  console.log('');
};

/**
 * Clear all CAT questions from database
 * WARNING: This will delete all questions tagged with 'CAT'
 */
export const clearCATQuestions = async (): Promise<void> => {
  console.warn('⚠️  WARNING: This will delete all CAT questions from the database');

  try {
    const { questions } = await questionApi.getQuestions({ tags: ['CAT'] }, 1000);
    console.log(`Found ${questions.length} CAT questions to delete`);

    let deletedCount = 0;
    for (const question of questions) {
      const success = await questionApi.deleteQuestion(question.id);
      if (success) deletedCount++;
    }

    console.log(`✓ Deleted ${deletedCount} CAT questions`);
  } catch (error) {
    console.error('Error clearing CAT questions:', error);
    throw error;
  }
};

// ============================================================================
// CLI INTERFACE (if running as standalone script)
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const userId = process.argv[3] || 'system'; // Default to 'system' user

  switch (command) {
    case 'seed':
      printSeedingStats();
      seedCATQuestions(userId)
        .then(() => {
          console.log('✓ Seeding completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('✗ Seeding failed:', error);
          process.exit(1);
        });
      break;

    case 'seed-category':
      const category = process.argv[4];
      if (!category) {
        console.error('Please provide a category name');
        process.exit(1);
      }
      seedQuestionsByCategory(category, userId)
        .then(() => {
          console.log('✓ Category seeding completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('✗ Category seeding failed:', error);
          process.exit(1);
        });
      break;

    case 'stats':
      printSeedingStats();
      process.exit(0);
      break;

    case 'clear':
      clearCATQuestions()
        .then(() => {
          console.log('✓ Clearing completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('✗ Clearing failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log(`
Usage: ts-node seedQuestions.ts <command> [userId]

Commands:
  seed              - Seed all CAT questions
  seed-category     - Seed questions for a specific category
  stats             - Show statistics about CAT questions
  clear             - Clear all CAT questions from database (WARNING: destructive)

Examples:
  ts-node seedQuestions.ts seed <userId>
  ts-node seedQuestions.ts seed-category <userId> "Infection Control"
  ts-node seedQuestions.ts stats
      `);
      process.exit(1);
  }
}

export default {
  seedCATQuestions,
  seedQuestionsByCategory,
  getSeedingStats,
  printSeedingStats,
  clearCATQuestions
};

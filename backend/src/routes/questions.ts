import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// CREATE QUESTION (Admin only)
// ============================================================================

router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const {
    question,
    options,
    correctAnswer,
    explanation,
    rationales,
    category,
    difficulty,
    discrimination,
    tags,
    imageUrl,
    videoUrl,
    references,
  } = req.body;

  // Validation
  if (!question || !options || correctAnswer === undefined || !explanation || !category || !difficulty) {
    throw new APIError('Missing required fields', 400);
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new APIError('Options must be an array with at least 2 items', 400);
  }

  if (correctAnswer < 0 || correctAnswer >= options.length) {
    throw new APIError('Invalid correct answer index', 400);
  }

  const questionRecord = await prisma.question.create({
    data: {
      question,
      options,
      correctAnswer,
      explanation,
      rationales: rationales || [],
      category,
      difficulty,
      discrimination: discrimination || null,
      tags: tags || [],
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      references: references || [],
      createdById: userId,
      isActive: true,
    },
  });

  res.status(201).json({
    message: 'Question created successfully',
    question: questionRecord,
  });
}));

// ============================================================================
// BULK CREATE QUESTIONS (Admin only)
// ============================================================================

router.post('/bulk', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new APIError('Questions must be a non-empty array', 400);
  }

  // Validate all questions
  questions.forEach((q, index) => {
    if (!q.question || !q.options || q.correctAnswer === undefined || !q.explanation) {
      throw new APIError(`Question at index ${index} is missing required fields`, 400);
    }
  });

  // Create all questions
  const created = await prisma.question.createMany({
    data: questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      rationales: q.rationales || [],
      category: q.category || 'General',
      difficulty: q.difficulty || 'MEDIUM',
      discrimination: q.discrimination || null,
      tags: q.tags || [],
      imageUrl: q.imageUrl || null,
      videoUrl: q.videoUrl || null,
      references: q.references || [],
      createdById: userId,
      isActive: true,
    })),
  });

  res.status(201).json({
    message: `${created.count} questions created successfully`,
    count: created.count,
  });
}));

// ============================================================================
// GET QUESTIONS (with filters and pagination)
// ============================================================================

router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const {
    category,
    difficulty,
    tags,
    isActive,
    limit = '50',
    offset = '0',
    search,
  } = req.query;

  const where: any = {};

  if (category) where.category = category as string;
  if (difficulty) where.difficulty = difficulty as string;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.question = {
      contains: search as string,
      mode: 'insensitive',
    };
  }
  if (tags) {
    const tagArray = typeof tags === 'string' ? [tags] : tags;
    where.tags = {
      hasSome: tagArray,
    };
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.question.count({ where }),
  ]);

  res.json({
    questions,
    total,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
}));

// ============================================================================
// GET RANDOM QUESTIONS
// ============================================================================

router.get('/random', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { count = '10', category, difficulty } = req.query;

  const where: any = { isActive: true };
  if (category) where.category = category as string;
  if (difficulty) where.difficulty = difficulty as string;

  // Get total count
  const total = await prisma.question.count({ where });

  if (total === 0) {
    return res.json({ questions: [] });
  }

  // Get random questions using PostgreSQL/MySQL RAND()
  const requestedCount = parseInt(count as string);
  const questions = await prisma.$queryRaw`
    SELECT * FROM questions
    WHERE ${category ? `category = ${category}` : '1=1'}
    AND ${difficulty ? `difficulty = ${difficulty}` : '1=1'}
    AND is_active = true
    ORDER BY RAND()
    LIMIT ${requestedCount}
  `;

  res.json({ questions });
}));

// ============================================================================
// GET CAT QUESTIONS (Computer Adaptive Testing)
// ============================================================================

router.get('/cat', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { abilityEstimate = '0', count = '10', category } = req.query;

  const ability = parseFloat(abilityEstimate as string);

  // Determine target difficulty based on ability
  let targetDifficulty: string;
  if (ability < -0.5) {
    targetDifficulty = 'EASY';
  } else if (ability > 0.5) {
    targetDifficulty = 'HARD';
  } else {
    targetDifficulty = 'MEDIUM';
  }

  const where: any = {
    isActive: true,
    difficulty: targetDifficulty,
  };

  if (category) where.category = category as string;

  // Get questions with appropriate difficulty
  const questions = await prisma.question.findMany({
    where,
    take: parseInt(count as string),
    orderBy: { discrimination: 'desc' }, // Prioritize high discrimination items
  });

  // If not enough questions at target difficulty, get from adjacent levels
  if (questions.length < parseInt(count as string)) {
    const remaining = parseInt(count as string) - questions.length;
    const adjacentDifficulty = targetDifficulty === 'EASY' ? 'MEDIUM' :
                               targetDifficulty === 'HARD' ? 'MEDIUM' : 'EASY';

    const additionalQuestions = await prisma.question.findMany({
      where: {
        ...where,
        difficulty: adjacentDifficulty,
        id: { notIn: questions.map(q => q.id) },
      },
      take: remaining,
    });

    questions.push(...additionalQuestions);
  }

  res.json({ questions });
}));

// ============================================================================
// GET QUESTION BY ID
// ============================================================================

router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new APIError('Question not found', 404);
  }

  res.json({ question });
}));

// ============================================================================
// UPDATE QUESTION (Admin only)
// ============================================================================

router.patch('/:id', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.createdById;

  const question = await prisma.question.update({
    where: { id },
    data: updateData,
  });

  res.json({
    message: 'Question updated successfully',
    question,
  });
}));

// ============================================================================
// DELETE QUESTION (Admin only)
// ============================================================================

router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  await prisma.question.delete({
    where: { id },
  });

  res.json({ message: 'Question deleted successfully' });
}));

// ============================================================================
// DEACTIVATE QUESTION (Admin only - soft delete)
// ============================================================================

router.post('/:id/deactivate', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const question = await prisma.question.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    message: 'Question deactivated successfully',
    question,
  });
}));

// ============================================================================
// GET CATEGORIES
// ============================================================================

router.get('/meta/categories', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const categories = await prisma.question.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });

  const categoryList = categories.map(c => c.category);

  res.json({ categories: categoryList });
}));

// ============================================================================
// GET QUESTION STATS
// ============================================================================

router.get('/:id/stats', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const usage = await prisma.questionUsage.findMany({
    where: { questionId: id },
  });

  const totalAttempts = usage.length;
  const correctAttempts = usage.filter(u => u.isCorrect).length;
  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  const averageTimeSpent = totalAttempts > 0
    ? usage.reduce((sum, u) => sum + u.timeSpent, 0) / totalAttempts
    : 0;

  res.json({
    questionId: id,
    totalAttempts,
    correctAttempts,
    accuracy,
    averageTimeSpent,
  });
}));

export default router;

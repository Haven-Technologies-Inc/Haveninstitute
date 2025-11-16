import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// SM2 SPACED REPETITION ALGORITHM
// ============================================================================

interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
}

function calculateSM2(
  quality: number, // 0-5 scale
  repetitions: number,
  easeFactor: number,
  previousInterval: number
): SM2Result {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newRepetitions = repetitions;
  let newInterval = previousInterval;

  if (quality < 3) {
    // Failed recall - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful recall
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReview,
  };
}

// ============================================================================
// RECORD FLASHCARD REVIEW
// ============================================================================

router.post('/progress', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { flashcardId, quality, timeSpent } = req.body;

  // Validation
  if (!flashcardId || quality === undefined) {
    throw new APIError('Flashcard ID and quality are required', 400);
  }

  if (quality < 0 || quality > 5) {
    throw new APIError('Quality must be between 0 and 5', 400);
  }

  // Get or create progress record
  let progress = await prisma.flashcardProgress.findUnique({
    where: {
      userId_flashcardId: {
        userId,
        flashcardId,
      },
    },
  });

  if (!progress) {
    // Initialize new card
    progress = await prisma.flashcardProgress.create({
      data: {
        userId,
        flashcardId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
        status: 'NEW',
      },
    });
  }

  // Calculate next review using SM2
  const sm2Result = calculateSM2(
    quality,
    progress.repetitions,
    progress.easeFactor,
    progress.interval
  );

  // Determine status
  let status: string;
  if (sm2Result.repetitions >= 5 && sm2Result.easeFactor >= 2.5) {
    status = 'MASTERED';
  } else if (sm2Result.repetitions > 0) {
    status = 'LEARNING';
  } else {
    status = 'NEW';
  }

  // Update progress
  const updatedProgress = await prisma.flashcardProgress.update({
    where: {
      userId_flashcardId: {
        userId,
        flashcardId,
      },
    },
    data: {
      easeFactor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      lastReviewed: new Date(),
      nextReview: sm2Result.nextReview,
      status,
      totalAttempts: progress.totalAttempts + 1,
      correctAttempts: quality >= 3 ? progress.correctAttempts + 1 : progress.correctAttempts,
      confidence: quality,
    },
  });

  res.json({
    message: 'Review recorded successfully',
    progress: updatedProgress,
  });
}));

// ============================================================================
// GET DUE FLASHCARDS
// ============================================================================

router.get('/due', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { limit = '20', category } = req.query;

  const where: any = {
    userId,
    nextReview: {
      lte: new Date(),
    },
  };

  if (category) {
    where.flashcard = {
      category: category as string,
    };
  }

  const dueCards = await prisma.flashcardProgress.findMany({
    where,
    take: parseInt(limit as string),
    orderBy: { nextReview: 'asc' },
    include: {
      flashcard: true,
    },
  });

  res.json({ flashcards: dueCards });
}));

// ============================================================================
// GET NEW FLASHCARDS (not yet studied)
// ============================================================================

router.get('/new', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { limit = '20', category } = req.query;

  // Get all flashcards user hasn't studied yet
  const studiedIds = await prisma.flashcardProgress.findMany({
    where: { userId },
    select: { flashcardId: true },
  });

  const studiedFlashcardIds = studiedIds.map(p => p.flashcardId);

  const where: any = {
    id: { notIn: studiedFlashcardIds },
    isActive: true,
  };

  if (category) where.category = category as string;

  const newCards = await prisma.flashcard.findMany({
    where,
    take: parseInt(limit as string),
  });

  res.json({ flashcards: newCards });
}));

// ============================================================================
// GET FLASHCARDS BY CATEGORY
// ============================================================================

router.get('/category/:category', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { category } = req.params;

  const flashcards = await prisma.flashcardProgress.findMany({
    where: {
      userId,
      flashcard: {
        category,
      },
    },
    include: {
      flashcard: true,
    },
    orderBy: { nextReview: 'asc' },
  });

  res.json({ flashcards });
}));

// ============================================================================
// GET STUDY STATISTICS
// ============================================================================

router.get('/stats', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const allProgress = await prisma.flashcardProgress.findMany({
    where: { userId },
  });

  const totalCards = allProgress.length;
  const newCards = allProgress.filter(p => p.status === 'NEW').length;
  const learningCards = allProgress.filter(p => p.status === 'LEARNING').length;
  const masteredCards = allProgress.filter(p => p.status === 'MASTERED').length;

  const now = new Date();
  const dueCards = allProgress.filter(p => p.nextReview <= now).length;

  const totalAttempts = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctAttempts, 0);
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  const averageConfidence = totalCards > 0
    ? allProgress.reduce((sum, p) => sum + (p.confidence || 0), 0) / totalCards
    : 0;

  const masteryRate = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;

  res.json({
    totalCards,
    newCards,
    learningCards,
    masteredCards,
    dueCards,
    totalAttempts,
    accuracy,
    averageConfidence,
    masteryRate,
  });
}));

// ============================================================================
// GET REVIEW FORECAST
// ============================================================================

router.get('/forecast', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { days = '7' } = req.query;

  const allProgress = await prisma.flashcardProgress.findMany({
    where: { userId },
  });

  const forecast = [];
  const numDays = parseInt(days as string);

  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = allProgress.filter(p => {
      const reviewDate = new Date(p.nextReview);
      return reviewDate >= date && reviewDate < nextDate;
    }).length;

    forecast.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  res.json({ forecast });
}));

// ============================================================================
// RESET FLASHCARD PROGRESS
// ============================================================================

router.delete('/progress/:flashcardId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { flashcardId } = req.params;

  await prisma.flashcardProgress.delete({
    where: {
      userId_flashcardId: {
        userId,
        flashcardId,
      },
    },
  });

  res.json({ message: 'Flashcard progress reset successfully' });
}));

// ============================================================================
// MARK AS MASTERED
// ============================================================================

router.post('/progress/:flashcardId/master', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { flashcardId } = req.params;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 365); // 1 year

  const progress = await prisma.flashcardProgress.update({
    where: {
      userId_flashcardId: {
        userId,
        flashcardId,
      },
    },
    data: {
      status: 'MASTERED',
      repetitions: 10,
      easeFactor: 3.0,
      interval: 365,
      nextReview,
      confidence: 5,
    },
  });

  res.json({
    message: 'Flashcard marked as mastered',
    progress,
  });
}));

// ============================================================================
// INITIALIZE MULTIPLE FLASHCARDS
// ============================================================================

router.post('/progress/bulk', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { flashcardIds } = req.body;

  if (!Array.isArray(flashcardIds)) {
    throw new APIError('flashcardIds must be an array', 400);
  }

  // Check which cards don't have progress yet
  const existing = await prisma.flashcardProgress.findMany({
    where: {
      userId,
      flashcardId: { in: flashcardIds },
    },
    select: { flashcardId: true },
  });

  const existingIds = existing.map(p => p.flashcardId);
  const newIds = flashcardIds.filter(id => !existingIds.includes(id));

  if (newIds.length === 0) {
    return res.json({ message: 'All flashcards already initialized', count: 0 });
  }

  // Create progress records
  await prisma.flashcardProgress.createMany({
    data: newIds.map(flashcardId => ({
      userId,
      flashcardId,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      lastReviewed: new Date(),
      nextReview: new Date(),
      status: 'NEW',
    })),
  });

  res.status(201).json({
    message: `${newIds.length} flashcards initialized`,
    count: newIds.length,
  });
}));

export default router;

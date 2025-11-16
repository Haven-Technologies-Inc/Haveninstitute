import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================

router.get('/dashboard', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Fetch all data in parallel
  const [
    quizSessions,
    questionUsage,
    flashcardProgress,
    bookProgress,
  ] = await Promise.all([
    prisma.quizSession.findMany({ where: { userId } }),
    prisma.questionUsage.findMany({ where: { userId } }),
    prisma.flashcardProgress.findMany({ where: { userId } }),
    prisma.bookProgress.findMany({ where: { userId } }),
  ]);

  // Quiz statistics
  const completedSessions = quizSessions.filter(s => s.status === 'COMPLETED');
  const totalQuizAttempts = quizSessions.length;
  const averageScore = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + (s.finalPercentage || 0), 0) / completedSessions.length
    : 0;
  const passRate = completedSessions.length > 0
    ? (completedSessions.filter(s => s.passed).length / completedSessions.length) * 100
    : 0;
  const recentScores = completedSessions
    .slice(-10)
    .map(s => s.finalPercentage || 0)
    .reverse();

  // Question statistics
  const questionsAnswered = questionUsage.length;
  const correctAnswers = questionUsage.filter(q => q.isCorrect).length;
  const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

  // Study time
  const quizTime = quizSessions.reduce((sum, s) => sum + s.timeElapsed, 0);
  const readingTime = bookProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalStudyTime = Math.round((quizTime + readingTime) / 60); // Convert to minutes

  // Study streak (simplified)
  const studyStreak = await calculateStudyStreak(userId);

  // Flashcard statistics
  const totalFlashcards = flashcardProgress.length;
  const masteredCards = flashcardProgress.filter(p => p.status === 'MASTERED').length;
  const now = new Date();
  const dueCards = flashcardProgress.filter(p => new Date(p.nextReview) <= now).length;
  const flashcardAttempts = flashcardProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
  const flashcardCorrect = flashcardProgress.reduce((sum, p) => sum + p.correctAttempts, 0);
  const flashcardAccuracy = flashcardAttempts > 0 ? (flashcardCorrect / flashcardAttempts) * 100 : 0;

  // Reading statistics
  const booksStarted = bookProgress.length;
  const booksCompleted = bookProgress.filter(p => p.status === 'COMPLETED').length;
  const readingStreak = await calculateReadingStreak(userId);

  // Category performance
  const categoryPerformance = await getCategoryPerformance(userId);

  // Recent activity
  const recentActivity = await getRecentActivity(userId, 10);

  // User goals (from preferences)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const preferences = (user?.preferences as any) || {};

  const dashboardStats = {
    overview: {
      totalStudyTime,
      studyStreak,
      questionsAnswered,
      accuracy,
      rank: null, // TODO: Implement ranking
    },
    quizzes: {
      totalAttempts: totalQuizAttempts,
      averageScore,
      passRate,
      recentScores,
    },
    flashcards: {
      totalCards: totalFlashcards,
      masteredCards,
      dueCards,
      accuracy: flashcardAccuracy,
    },
    reading: {
      booksStarted,
      booksCompleted,
      totalTimeSpent: readingTime,
      currentStreak: readingStreak,
    },
    categoryPerformance,
    recentActivity,
    goals: {
      targetExamDate: preferences.targetExamDate || null,
      dailyGoal: preferences.dailyGoal || 50,
      progress: 0, // TODO: Calculate based on questions answered today
    },
  };

  res.json(dashboardStats);
}));

// ============================================================================
// GET CATEGORY ANALYTICS
// ============================================================================

router.get('/categories/:category', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { category } = req.params;

  const questionUsage = await prisma.questionUsage.findMany({
    where: {
      userId,
      question: {
        category,
      },
    },
    include: {
      question: {
        select: {
          difficulty: true,
        },
      },
    },
  });

  const totalQuestions = questionUsage.length;
  const correctAnswers = questionUsage.filter(u => u.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const totalTime = questionUsage.reduce((sum, u) => sum + u.timeSpent, 0);
  const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

  // Difficulty breakdown
  const difficultyBreakdown = {
    EASY: { total: 0, correct: 0, accuracy: 0 },
    MEDIUM: { total: 0, correct: 0, accuracy: 0 },
    HARD: { total: 0, correct: 0, accuracy: 0 },
  };

  questionUsage.forEach(usage => {
    const difficulty = usage.question?.difficulty || 'MEDIUM';
    if (difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown]) {
      difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown].total++;
      if (usage.isCorrect) {
        difficultyBreakdown[difficulty as keyof typeof difficultyBreakdown].correct++;
      }
    }
  });

  // Calculate accuracy for each difficulty
  Object.keys(difficultyBreakdown).forEach(key => {
    const diff = difficultyBreakdown[key as keyof typeof difficultyBreakdown];
    diff.accuracy = diff.total > 0 ? (diff.correct / diff.total) * 100 : 0;
  });

  // Calculate trend
  const trend = calculateTrend(questionUsage);

  res.json({
    category,
    totalQuestions,
    correctAnswers,
    accuracy,
    averageTimePerQuestion,
    difficultyBreakdown,
    trend,
    weakTopics: [], // TODO: Implement subcategory analysis
    strongTopics: [],
  });
}));

// ============================================================================
// GET CATEGORY PERFORMANCE
// ============================================================================

router.get('/categories', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const performance = await getCategoryPerformance(userId);

  res.json({ categories: performance });
}));

// ============================================================================
// GET PERFORMANCE TREND
// ============================================================================

router.get('/trends', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { days = '30' } = req.query;

  const numDays = parseInt(days as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numDays);

  const sessions = await prisma.quizSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: {
        gte: startDate,
      },
    },
    orderBy: { completedAt: 'asc' },
  });

  // Group by date
  const trendMap = new Map<string, {
    questionsAnswered: number;
    correctAnswers: number;
    totalScore: number;
    sessionCount: number;
    studyTime: number;
  }>();

  sessions.forEach(session => {
    const date = session.completedAt?.toISOString().split('T')[0] || '';

    const existing = trendMap.get(date) || {
      questionsAnswered: 0,
      correctAnswers: 0,
      totalScore: 0,
      sessionCount: 0,
      studyTime: 0,
    };

    existing.questionsAnswered += session.totalQuestions;
    existing.correctAnswers += session.correctAnswers;
    existing.totalScore += session.finalPercentage || 0;
    existing.sessionCount++;
    existing.studyTime += session.timeElapsed;

    trendMap.set(date, existing);
  });

  // Convert to array and fill missing dates
  const trends = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const stats = trendMap.get(dateStr);

    trends.push({
      date: dateStr,
      questionsAnswered: stats?.questionsAnswered || 0,
      accuracy: stats ? (stats.correctAnswers / stats.questionsAnswered) * 100 : 0,
      averageScore: stats ? stats.totalScore / stats.sessionCount : 0,
      studyTime: stats ? Math.round(stats.studyTime / 60) : 0, // Convert to minutes
    });
  }

  res.json({ trends });
}));

// ============================================================================
// GET RECENT ACTIVITY
// ============================================================================

router.get('/activity', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { limit = '20' } = req.query;

  const activity = await getRecentActivity(userId, parseInt(limit as string));

  res.json({ activity });
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCategoryPerformance(userId: string) {
  const questionUsage = await prisma.questionUsage.findMany({
    where: { userId },
    include: {
      question: {
        select: {
          category: true,
        },
      },
    },
  });

  const categoryMap = new Map<string, {
    total: number;
    correct: number;
    timeSpent: number;
  }>();

  questionUsage.forEach(usage => {
    const category = usage.question?.category || 'Unknown';
    const existing = categoryMap.get(category) || { total: 0, correct: 0, timeSpent: 0 };

    existing.total++;
    if (usage.isCorrect) existing.correct++;
    existing.timeSpent += usage.timeSpent;

    categoryMap.set(category, existing);
  });

  return Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      questionsAnswered: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      timeSpent: stats.timeSpent,
    }))
    .sort((a, b) => b.questionsAnswered - a.questionsAnswered);
}

async function getRecentActivity(userId: string, limit: number) {
  const activity: any[] = [];

  // Get recent quiz sessions
  const quizSessions = await prisma.quizSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });

  quizSessions.forEach(session => {
    activity.push({
      date: session.completedAt?.toISOString() || session.createdAt.toISOString(),
      type: session.sessionType === 'CAT' ? 'practice' : 'quiz',
      description: `Completed ${session.sessionType} with ${session.totalQuestions} questions`,
      score: session.finalPercentage,
    });
  });

  // Get recent reading progress
  const readingProgress = await prisma.bookProgress.findMany({
    where: { userId },
    orderBy: { lastRead: 'desc' },
    take: limit,
  });

  readingProgress.forEach(progress => {
    activity.push({
      date: progress.lastRead.toISOString(),
      type: 'reading',
      description: `Reading progress: ${progress.progress}% complete`,
      score: progress.progress,
    });
  });

  // Sort by date and limit
  activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return activity.slice(0, limit);
}

async function calculateStudyStreak(userId: string): Promise<number> {
  const sessions = await prisma.quizSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: { completedAt: 'desc' },
  });

  if (sessions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sessions) {
    const sessionDate = new Date(session.completedAt || session.createdAt);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
      if (daysDiff > streak) streak = daysDiff;
      currentDate = sessionDate;
      streak++;
    } else if (daysDiff > streak + 1) {
      break;
    }
  }

  return streak;
}

async function calculateReadingStreak(userId: string): Promise<number> {
  const progress = await prisma.bookProgress.findMany({
    where: { userId },
    orderBy: { lastRead: 'desc' },
  });

  if (progress.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const p of progress) {
    const lastReadDate = new Date(p.lastRead);
    lastReadDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
      if (daysDiff > streak) streak = daysDiff;
      currentDate = lastReadDate;
      streak++;
    } else if (daysDiff > streak + 1) {
      break;
    }
  }

  return streak;
}

function calculateTrend(usageData: any[]): 'improving' | 'stable' | 'declining' {
  if (usageData.length < 10) return 'stable';

  const midpoint = Math.floor(usageData.length / 2);
  const firstHalf = usageData.slice(0, midpoint);
  const secondHalf = usageData.slice(midpoint);

  const firstAccuracy = firstHalf.filter(u => u.isCorrect).length / firstHalf.length;
  const secondAccuracy = secondHalf.filter(u => u.isCorrect).length / secondHalf.length;

  const difference = secondAccuracy - firstAccuracy;

  if (difference > 0.05) return 'improving';
  if (difference < -0.05) return 'declining';
  return 'stable';
}

export default router;

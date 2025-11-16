import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// CREATE QUIZ SESSION
// ============================================================================

router.post('/sessions', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const {
    quizId,
    sessionType,
    questionIds,
    totalQuestions,
    timeLimit,
    passingScore,
    settings,
  } = req.body;

  // Validation
  if (!sessionType || !questionIds || !Array.isArray(questionIds)) {
    throw new APIError('Session type and question IDs are required', 400);
  }

  const session = await prisma.quizSession.create({
    data: {
      userId,
      quizId: quizId || null,
      sessionType,
      questionIds,
      totalQuestions: totalQuestions || questionIds.length,
      timeLimit: timeLimit || null,
      passingScore: passingScore || 70,
      settings: settings || {},
      status: 'ACTIVE',
      currentQuestionIndex: 0,
      correctAnswers: 0,
      timeElapsed: 0,
    },
  });

  res.status(201).json({
    message: 'Quiz session created successfully',
    session,
  });
}));

// ============================================================================
// CREATE CAT SESSION
// ============================================================================

router.post('/sessions/cat', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { questionIds, settings } = req.body;

  if (!questionIds || !Array.isArray(questionIds)) {
    throw new APIError('Question IDs are required', 400);
  }

  const session = await prisma.quizSession.create({
    data: {
      userId,
      sessionType: 'CAT',
      questionIds,
      totalQuestions: questionIds.length,
      settings: settings || { adaptiveDifficulty: true },
      status: 'ACTIVE',
      currentQuestionIndex: 0,
      correctAnswers: 0,
      timeElapsed: 0,
      abilityEstimate: 0, // Start at neutral
      confidenceLevel: 0,
    },
  });

  res.status(201).json({
    message: 'CAT session created successfully',
    session,
  });
}));

// ============================================================================
// GET SESSION BY ID
// ============================================================================

router.get('/sessions/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.quizSession.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  res.json({ session });
}));

// ============================================================================
// GET ACTIVE SESSION
// ============================================================================

router.get('/sessions/active/current', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const session = await prisma.quizSession.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ session });
}));

// ============================================================================
// GET USER SESSIONS
// ============================================================================

router.get('/sessions', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { status, sessionType, limit = '20', offset = '0' } = req.query;

  const where: any = { userId };

  if (status) where.status = status as string;
  if (sessionType) where.sessionType = sessionType as string;

  const sessions = await prisma.quizSession.findMany({
    where,
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
    orderBy: { createdAt: 'desc' },
  });

  res.json({ sessions });
}));

// ============================================================================
// SUBMIT ANSWER
// ============================================================================

router.post('/sessions/:id/answer', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { questionId, selectedAnswer, timeSpent } = req.body;

  // Get session
  const session = await prisma.quizSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  if (session.status !== 'ACTIVE') {
    throw new APIError('Session is not active', 400);
  }

  // Get question
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new APIError('Question not found', 404);
  }

  const isCorrect = selectedAnswer === question.correctAnswer;

  // Record answer
  await prisma.questionUsage.create({
    data: {
      userId,
      questionId,
      sessionId: id,
      selectedAnswer,
      isCorrect,
      timeSpent: timeSpent || 0,
    },
  });

  // Update session
  const updatedSession = await prisma.quizSession.update({
    where: { id },
    data: {
      currentQuestionIndex: session.currentQuestionIndex + 1,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      timeElapsed: session.timeElapsed + (timeSpent || 0),
    },
  });

  res.json({
    message: 'Answer submitted successfully',
    isCorrect,
    session: updatedSession,
  });
}));

// ============================================================================
// UPDATE CAT ABILITY
// ============================================================================

router.patch('/sessions/:id/cat-ability', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { abilityEstimate, confidenceLevel } = req.body;

  const session = await prisma.quizSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  if (session.sessionType !== 'CAT') {
    throw new APIError('Session is not a CAT session', 400);
  }

  const updatedSession = await prisma.quizSession.update({
    where: { id },
    data: {
      abilityEstimate: abilityEstimate ?? session.abilityEstimate,
      confidenceLevel: confidenceLevel ?? session.confidenceLevel,
    },
  });

  res.json({
    message: 'CAT ability updated successfully',
    session: updatedSession,
  });
}));

// ============================================================================
// PAUSE SESSION
// ============================================================================

router.post('/sessions/:id/pause', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.quizSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  if (session.status !== 'ACTIVE') {
    throw new APIError('Session is not active', 400);
  }

  const updatedSession = await prisma.quizSession.update({
    where: { id },
    data: { status: 'PAUSED' },
  });

  res.json({
    message: 'Session paused successfully',
    session: updatedSession,
  });
}));

// ============================================================================
// RESUME SESSION
// ============================================================================

router.post('/sessions/:id/resume', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.quizSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  if (session.status !== 'PAUSED') {
    throw new APIError('Session is not paused', 400);
  }

  const updatedSession = await prisma.quizSession.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });

  res.json({
    message: 'Session resumed successfully',
    session: updatedSession,
  });
}));

// ============================================================================
// COMPLETE SESSION
// ============================================================================

router.post('/sessions/:id/complete', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = await prisma.quizSession.findFirst({
    where: { id, userId },
  });

  if (!session) {
    throw new APIError('Session not found', 404);
  }

  if (session.status === 'COMPLETED') {
    throw new APIError('Session already completed', 400);
  }

  // Calculate final score
  const finalPercentage = session.totalQuestions > 0
    ? (session.correctAnswers / session.totalQuestions) * 100
    : 0;

  const passed = finalPercentage >= (session.passingScore || 70);

  const updatedSession = await prisma.quizSession.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      finalPercentage,
      passed,
    },
  });

  res.json({
    message: 'Session completed successfully',
    session: updatedSession,
  });
}));

// ============================================================================
// GET SESSION STATS
// ============================================================================

router.get('/sessions/stats/user', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const sessions = await prisma.quizSession.findMany({
    where: { userId },
  });

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

  const totalSessions = sessions.length;
  const totalCompleted = completedSessions.length;
  const totalPassed = completedSessions.filter(s => s.passed).length;

  const averageScore = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + (s.finalPercentage || 0), 0) / completedSessions.length
    : 0;

  const passRate = totalCompleted > 0 ? (totalPassed / totalCompleted) * 100 : 0;

  const totalTimeSpent = sessions.reduce((sum, s) => sum + s.timeElapsed, 0);

  const totalQuestions = completedSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCorrect = completedSessions.reduce((sum, s) => sum + s.correctAnswers, 0);

  // Group by session type
  const sessionsByType = sessions.reduce((acc, s) => {
    acc[s.sessionType] = (acc[s.sessionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    totalSessions,
    totalCompleted,
    averageScore,
    passRate,
    totalTimeSpent,
    totalQuestions,
    totalCorrect,
    sessionsByType,
  });
}));

export default router;

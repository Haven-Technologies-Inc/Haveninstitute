import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { checkAndIncrementUsage } from '@/lib/usage-limits';

// Create a new quiz session
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const tier = (session.user as any).subscriptionTier || 'Free';

    // Check usage limits before processing
    const usageCheck = await checkAndIncrementUsage(session.user.id, 'questionsAttempted', tier);
    if (!usageCheck.allowed) {
      return errorResponse(
        `You've reached your monthly question limit (${usageCheck.limit} questions). Upgrade to Pro for unlimited access.`,
        429
      );
    }

    const body = await request.json();

    const { categoryIds, difficulty, questionCount, timeLimitMinutes } = body;

    // Build question query
    const where: any = { isActive: true };
    if (categoryIds?.length) where.categoryId = { in: categoryIds };
    if (difficulty && difficulty !== 'mixed') where.difficulty = difficulty;

    // Get random questions
    const questions = await prisma.question.findMany({
      where,
      take: questionCount ?? 20,
      orderBy: { timesUsed: 'asc' }, // Prefer less-used questions
      select: { id: true },
    });

    if (questions.length === 0) {
      return errorResponse('No questions found matching criteria', 404);
    }

    // Create quiz session
    const quizSession = await prisma.quizSession.create({
      data: {
        userId: session.user.id,
        sessionType: 'practice',
        categoryIds: categoryIds ?? [],
        difficulty: difficulty ?? 'mixed',
        questionCount: questions.length,
        timeLimitMinutes: timeLimitMinutes ?? null,
        totalQuestions: questions.length,
        status: 'in_progress',
      },
    });

    return successResponse({
      sessionId: quizSession.id,
      questionIds: questions.map((q) => q.id),
      totalQuestions: questions.length,
      timeLimitMinutes,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Get user's quiz sessions
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');

    const sessions = await prisma.quizSession.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sessionType: true,
        status: true,
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        startedAt: true,
        completedAt: true,
        totalTimeSeconds: true,
        difficulty: true,
      },
    });

    return successResponse(sessions);
  } catch (error) {
    return handleApiError(error);
  }
}

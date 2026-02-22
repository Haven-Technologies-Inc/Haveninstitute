import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { checkAndIncrementUsage } from '@/lib/usage-limits';

// Start a new CAT session
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const tier = (session.user as any).subscriptionTier || 'Free';

    // Check usage limits before processing
    const usageCheck = await checkAndIncrementUsage(session.user.id, 'catSessions', tier);
    if (!usageCheck.allowed) {
      return errorResponse(
        `You've reached your CAT simulation limit (${usageCheck.limit} sessions). Upgrade to Pro for unlimited access.`,
        429
      );
    }

    const body = await request.json();

    const catSession = await prisma.cATSession.create({
      data: {
        userId: session.user.id,
        nclexType: body.nclexType ?? 'RN',
        minQuestions: body.minQuestions ?? 60,
        maxQuestions: body.maxQuestions ?? 145,
        timeLimitSeconds: body.timeLimitSeconds ?? 18000,
        status: 'in_progress',
      },
    });

    // Get first question (medium difficulty to start)
    const firstQuestion = await prisma.question.findFirst({
      where: { isActive: true, difficulty: 'medium' },
      orderBy: { timesUsed: 'asc' },
      select: {
        id: true,
        questionText: true,
        questionType: true,
        options: true,
        difficulty: true,
        category: { select: { name: true, code: true } },
      },
    });

    return successResponse({
      sessionId: catSession.id,
      currentAbility: 0,
      standardError: 1,
      questionsAnswered: 0,
      minQuestions: catSession.minQuestions,
      maxQuestions: catSession.maxQuestions,
      timeLimitSeconds: catSession.timeLimitSeconds,
      currentQuestion: firstQuestion,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Get user's CAT sessions
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');

    const sessions = await prisma.cATSession.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        result: true,
        currentAbility: true,
        standardError: true,
        passingProbability: true,
        questionsAnswered: true,
        questionsCorrect: true,
        nclexType: true,
        startedAt: true,
        completedAt: true,
        timeSpentSeconds: true,
      },
    });

    return successResponse(sessions);
  } catch (error) {
    return handleApiError(error);
  }
}

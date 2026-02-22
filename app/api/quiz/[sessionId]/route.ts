import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { gradeAnswer } from '@/lib/grading';

// GET quiz session with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;

    const quizSession = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
      include: {
        responses: {
          orderBy: { questionIndex: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
                difficulty: true,
                scenario: true,
                hotSpotData: true,
                category: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    if (!quizSession) {
      return errorResponse('Quiz session not found', 404);
    }

    // If session is completed, include answers for review
    if (quizSession.status === 'completed') {
      const fullResponses = await prisma.quizResponse.findMany({
        where: { sessionId },
        orderBy: { questionIndex: 'asc' },
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              questionType: true,
              options: true,
              correctAnswers: true,
              correctOrder: true,
              hotSpotData: true,
              explanation: true,
              rationale: true,
              difficulty: true,
              scenario: true,
              category: { select: { name: true, code: true } },
            },
          },
        },
      });

      return successResponse({
        ...quizSession,
        responses: fullResponses,
      });
    }

    return successResponse(quizSession);
  } catch (error) {
    return handleApiError(error);
  }
}

// Submit answer for a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;
    const body = await request.json();
    const { questionId, userAnswer, questionIndex, timeSpentSeconds } = body;

    // Verify session
    const quizSession = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: session.user.id, status: 'in_progress' },
    });

    if (!quizSession) {
      return errorResponse('Quiz session not found or already completed', 404);
    }

    // Get question to grade
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionType: true,
        correctAnswers: true,
        correctOrder: true,
        hotSpotData: true,
      },
    });

    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // Grade the answer
    const result = gradeAnswer(
      question.questionType as any,
      userAnswer,
      question.correctAnswers,
      question.correctOrder,
      question.hotSpotData
    );

    // Upsert response
    const existing = await prisma.quizResponse.findFirst({
      where: { sessionId, questionId, userId: session.user.id },
    });

    if (existing) {
      await prisma.quizResponse.update({
        where: { id: existing.id },
        data: {
          userAnswer,
          isCorrect: result.isCorrect,
          timeSpentSeconds,
        },
      });
    } else {
      await prisma.quizResponse.create({
        data: {
          sessionId,
          questionId,
          userId: session.user.id,
          userAnswer,
          isCorrect: result.isCorrect,
          timeSpentSeconds,
          questionIndex: questionIndex ?? 0,
        },
      });
    }

    // Update question stats
    await prisma.question.update({
      where: { id: questionId },
      data: {
        timesUsed: { increment: existing ? 0 : 1 },
        timesCorrect: { increment: result.isCorrect && !existing ? 1 : 0 },
      },
    });

    return successResponse({
      isCorrect: result.isCorrect,
      score: result.score,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Complete/submit the quiz
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;
    const body = await request.json();

    const quizSession = await prisma.quizSession.findFirst({
      where: { id: sessionId, userId: session.user.id, status: 'in_progress' },
    });

    if (!quizSession) {
      return errorResponse('Quiz session not found or already completed', 404);
    }

    // Calculate final results
    const responses = await prisma.quizResponse.findMany({
      where: { sessionId },
      include: {
        question: {
          select: { categoryId: true, category: { select: { name: true, code: true } } },
        },
      },
    });

    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, { correct: number; total: number; name: string }> = {};
    for (const r of responses) {
      const catCode = r.question.category.code;
      if (!categoryBreakdown[catCode]) {
        categoryBreakdown[catCode] = { correct: 0, total: 0, name: r.question.category.name };
      }
      categoryBreakdown[catCode].total++;
      if (r.isCorrect) categoryBreakdown[catCode].correct++;
    }

    const totalTimeSeconds = body.totalTimeSeconds ?? Math.round(
      responses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0)
    );

    // Update session
    const updated = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        score,
        correctAnswers,
        totalQuestions,
        completedAt: new Date(),
        totalTimeSeconds,
      },
    });

    // Record study activity
    await prisma.studyActivity.create({
      data: {
        userId: session.user.id,
        activityType: 'quiz_completed',
        title: `Quiz - ${score}%`,
        sessionId,
        durationMinutes: Math.round(totalTimeSeconds / 60),
        questionsAttempted: totalQuestions,
        questionsCorrect: correctAnswers,
        score,
      },
    });

    return successResponse({
      sessionId,
      score,
      totalQuestions,
      correctAnswers,
      totalTimeSeconds,
      categoryBreakdown,
      passed: score >= 70,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

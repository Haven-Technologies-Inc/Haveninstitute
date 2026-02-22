import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { gradeAnswer } from '@/lib/grading';
import {
  estimateAbilityEAP,
  standardError,
  selectNextQuestion,
  checkStoppingRules,
  passingProbability,
} from '@/lib/irt';

// GET current CAT session state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;

    const catSession = await prisma.cATSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
      include: {
        responses: {
          orderBy: { questionNumber: 'asc' },
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
                explanation: true,
                rationale: true,
                correctAnswers: true,
                correctOrder: true,
                category: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    if (!catSession) {
      return errorResponse('CAT session not found', 404);
    }

    return successResponse(catSession);
  } catch (error) {
    return handleApiError(error);
  }
}

// Submit answer and get next question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;
    const body = await request.json();
    const { questionId, userAnswer, timeSpentSeconds } = body;

    // Get session
    const catSession = await prisma.cATSession.findFirst({
      where: { id: sessionId, userId: session.user.id, status: 'in_progress' },
    });

    if (!catSession) {
      return errorResponse('CAT session not found or already completed', 404);
    }

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionType: true,
        correctAnswers: true,
        correctOrder: true,
        hotSpotData: true,
        discrimination: true,
        difficultyIrt: true,
        guessing: true,
        categoryId: true,
      },
    });

    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // Grade answer
    const result = gradeAnswer(
      question.questionType as any,
      userAnswer,
      question.correctAnswers,
      question.correctOrder,
      question.hotSpotData
    );

    // Get all previous responses for ability estimation
    const previousResponses = await prisma.cATResponse.findMany({
      where: { sessionId },
      include: {
        question: {
          select: { discrimination: true, difficultyIrt: true, guessing: true },
        },
      },
      orderBy: { questionNumber: 'asc' },
    });

    // Build response history for IRT
    const irtResponses = [
      ...previousResponses.map(r => ({
        a: Number(r.question.discrimination),
        b: Number(r.question.difficultyIrt),
        c: Number(r.question.guessing),
        correct: r.isCorrect ?? false,
      })),
      {
        a: Number(question.discrimination),
        b: Number(question.difficultyIrt),
        c: Number(question.guessing),
        correct: result.isCorrect,
      },
    ];

    // Estimate new ability using EAP
    const abilityBefore = Number(catSession.currentAbility);
    const newAbility = estimateAbilityEAP(irtResponses);
    const allParams = irtResponses.map(r => ({ a: r.a, b: r.b, c: r.c }));
    const newSE = standardError(newAbility, allParams);
    const newPassingProb = passingProbability(newAbility, newSE);
    const questionsAnswered = catSession.questionsAnswered + 1;
    const questionsCorrect = catSession.questionsCorrect + (result.isCorrect ? 1 : 0);

    // Update category performance
    const catPerf: Record<string, { correct: number; total: number }> =
      (catSession.categoryPerformance as any) || {};
    const catKey = String(question.categoryId);
    if (!catPerf[catKey]) catPerf[catKey] = { correct: 0, total: 0 };
    catPerf[catKey].total++;
    if (result.isCorrect) catPerf[catKey].correct++;

    // Difficulty distribution tracking
    const diffDist: Record<string, number> =
      (catSession.difficultyDistribution as any) || { easy: 0, medium: 0, hard: 0 };
    const irtDiff = Number(question.difficultyIrt);
    if (irtDiff < -0.5) diffDist.easy = (diffDist.easy || 0) + 1;
    else if (irtDiff > 0.5) diffDist.hard = (diffDist.hard || 0) + 1;
    else diffDist.medium = (diffDist.medium || 0) + 1;

    // Record response
    await prisma.cATResponse.create({
      data: {
        sessionId,
        questionId,
        userAnswer,
        isCorrect: result.isCorrect,
        timeSpentSeconds,
        abilityBefore: abilityBefore,
        abilityAfter: newAbility,
        seBefore: Number(catSession.standardError),
        seAfter: newSE,
        irtDiscrimination: Number(question.discrimination),
        irtDifficulty: Number(question.difficultyIrt),
        irtGuessing: Number(question.guessing),
        questionNumber: questionsAnswered,
      },
    });

    // Update question stats
    await prisma.question.update({
      where: { id: questionId },
      data: {
        timesUsed: { increment: 1 },
        timesCorrect: { increment: result.isCorrect ? 1 : 0 },
      },
    });

    // Check stopping rules
    const totalTime = catSession.timeSpentSeconds + (timeSpentSeconds || 0);
    const stopResult = checkStoppingRules(
      newAbility,
      newSE,
      questionsAnswered,
      catSession.minQuestions,
      catSession.maxQuestions,
      catSession.timeLimitSeconds,
      totalTime
    );

    if (stopResult.shouldStop) {
      // Complete the session
      await prisma.cATSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          result: stopResult.result,
          stopReason: stopResult.reason,
          currentAbility: newAbility,
          standardError: newSE,
          confidenceIntervalLower: newAbility - 1.96 * newSE,
          confidenceIntervalUpper: newAbility + 1.96 * newSE,
          passingProbability: newPassingProb,
          questionsAnswered,
          questionsCorrect,
          timeSpentSeconds: totalTime,
          completedAt: new Date(),
          categoryPerformance: catPerf,
          difficultyDistribution: diffDist,
        },
      });

      // Record study activity
      await prisma.studyActivity.create({
        data: {
          userId: session.user.id,
          activityType: 'cat_completed',
          title: `CAT Test - ${stopResult.result === 'pass' ? 'PASS' : 'FAIL'}`,
          sessionId,
          durationMinutes: Math.round(totalTime / 60),
          questionsAttempted: questionsAnswered,
          questionsCorrect,
        },
      });

      return successResponse({
        completed: true,
        result: stopResult.result,
        stopReason: stopResult.reason,
        currentAbility: newAbility,
        standardError: newSE,
        passingProbability: newPassingProb,
        questionsAnswered,
        questionsCorrect,
        categoryPerformance: catPerf,
      });
    }

    // Select next question using IRT
    const answeredIds = new Set(
      previousResponses.map(r => r.questionId).concat(questionId)
    );

    const availableQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        id: { notIn: [...answeredIds] },
      },
      select: {
        id: true,
        discrimination: true,
        difficultyIrt: true,
        guessing: true,
        categoryId: true,
      },
    });

    const nextQuestionId = selectNextQuestion(
      newAbility,
      availableQuestions.map(q => ({
        id: q.id,
        a: Number(q.discrimination),
        b: Number(q.difficultyIrt),
        c: Number(q.guessing),
        categoryId: q.categoryId,
      })),
      answeredIds,
      catPerf,
      true
    );

    let nextQuestion = null;
    if (nextQuestionId) {
      nextQuestion = await prisma.question.findUnique({
        where: { id: nextQuestionId },
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
      });
    }

    // Update session
    await prisma.cATSession.update({
      where: { id: sessionId },
      data: {
        currentAbility: newAbility,
        standardError: newSE,
        confidenceIntervalLower: newAbility - 1.96 * newSE,
        confidenceIntervalUpper: newAbility + 1.96 * newSE,
        passingProbability: newPassingProb,
        questionsAnswered,
        questionsCorrect,
        timeSpentSeconds: totalTime,
        categoryPerformance: catPerf,
        difficultyDistribution: diffDist,
      },
    });

    return successResponse({
      completed: false,
      isCorrect: result.isCorrect,
      currentAbility: newAbility,
      standardError: newSE,
      passingProbability: newPassingProb,
      questionsAnswered,
      questionsCorrect,
      nextQuestion,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

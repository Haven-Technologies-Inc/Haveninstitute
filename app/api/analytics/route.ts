import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';
import type { DailyUsage } from '@prisma/client';

// ---------------------------------------------------------------------------
// GET /api/analytics
// Return the authenticated user's comprehensive performance data:
// - Overall stats (total questions, accuracy, time spent)
// - Category breakdown per NCLEX category
// - Trend data (daily/weekly over last 30 days from DailyUsage)
// - Recent sessions (last 10 quiz/CAT sessions with scores)
// - Weak areas identification
// - Study streak data
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all data in parallel
    const [
      user,
      totalQuizResponses,
      correctQuizResponses,
      totalCATResponses,
      correctCATResponses,
      recentQuizSessions,
      recentCATSessions,
      dailyUsage,
      categoryPerformance,
      studyActivities,
      totalStudyTime,
    ] = await Promise.all([
      // User streaks and XP
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xpTotal: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
          lastActiveDate: true,
          createdAt: true,
        },
      }),

      // Total quiz responses
      prisma.quizResponse.count({ where: { userId } }),

      // Correct quiz responses
      prisma.quizResponse.count({ where: { userId, isCorrect: true } }),

      // Total CAT responses
      prisma.cATResponse.count({
        where: { session: { userId } },
      }),

      // Correct CAT responses
      prisma.cATResponse.count({
        where: { session: { userId }, isCorrect: true },
      }),

      // Recent quiz sessions (last 10 completed)
      prisma.quizSession.findMany({
        where: { userId, status: 'completed' },
        take: 10,
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          sessionType: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          completedAt: true,
          difficulty: true,
          totalTimeSeconds: true,
          categoryIds: true,
        },
      }),

      // Recent CAT sessions (last 10 completed)
      prisma.cATSession.findMany({
        where: { userId, status: 'completed' },
        take: 10,
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          result: true,
          currentAbility: true,
          passingProbability: true,
          questionsAnswered: true,
          questionsCorrect: true,
          timeSpentSeconds: true,
          completedAt: true,
          categoryPerformance: true,
          nclexType: true,
        },
      }),

      // Daily usage for last 30 days
      prisma.dailyUsage.findMany({
        where: {
          userId,
          usageDate: { gte: thirtyDaysAgo },
        },
        orderBy: { usageDate: 'asc' },
      }),

      // Category performance from quiz responses
      prisma.quizResponse.findMany({
        where: { userId },
        select: {
          isCorrect: true,
          timeSpentSeconds: true,
          question: {
            select: {
              categoryId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),

      // Study activities for time tracking
      prisma.studyActivity.findMany({
        where: {
          userId,
          activityDate: { gte: thirtyDaysAgo },
        },
        select: {
          durationMinutes: true,
          questionsAttempted: true,
          questionsCorrect: true,
          activityType: true,
          activityDate: true,
        },
      }),

      // Total study time across all activities
      prisma.studyActivity.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
      }),
    ]);

    // --- Overall Stats ---
    const totalQuestionsAnswered = totalQuizResponses + totalCATResponses;
    const totalCorrect = correctQuizResponses + correctCATResponses;
    const overallAccuracy =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

    const totalStudyMinutes = totalStudyTime._sum.durationMinutes ?? 0;
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

    // --- Category Breakdown ---
    const categoryMap = new Map<
      number,
      {
        id: number;
        name: string;
        code: string;
        total: number;
        correct: number;
        totalTime: number;
      }
    >();

    for (const response of categoryPerformance) {
      const cat = response.question.category;
      const existing = categoryMap.get(cat.id) ?? {
        id: cat.id,
        name: cat.name,
        code: cat.code,
        total: 0,
        correct: 0,
        totalTime: 0,
      };

      existing.total += 1;
      if (response.isCorrect) existing.correct += 1;
      existing.totalTime += response.timeSpentSeconds ?? 0;

      categoryMap.set(cat.id, existing);
    }

    const categoryBreakdown = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        accuracy: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0,
        averageTimeSeconds:
          cat.total > 0 ? Math.round(cat.totalTime / cat.total) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // --- Weak Areas (categories with lowest accuracy, min 5 questions) ---
    const weakAreas = categoryBreakdown
      .filter((cat) => cat.total >= 5)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryCode: cat.code,
        accuracy: cat.accuracy,
        questionsAnswered: cat.total,
        recommendation:
          cat.accuracy < 50
            ? 'Needs significant improvement'
            : cat.accuracy < 70
              ? 'Needs practice'
              : 'Room for improvement',
      }));

    // --- Trend Data (daily aggregation over last 30 days) ---
    const trendData = dailyUsage.map((day: DailyUsage) => ({
      date: day.usageDate,
      questionsAttempted: day.questionsAttempted,
      flashcardsReviewed: day.flashcardsReviewed,
      catSessions: day.catSessions,
      studyTimeMinutes: day.studyTimeMinutes,
      aiChatMessages: day.aiChatMessages,
    }));

    // Weekly aggregation
    const weeklyData: Array<{
      weekStart: Date;
      questions: number;
      studyMinutes: number;
      flashcards: number;
      catSessions: number;
    }> = [];

    const weeks = new Map<string, typeof weeklyData[0]>();
    for (const day of dailyUsage) {
      const date = new Date(day.usageDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];

      const existing = weeks.get(key) ?? {
        weekStart,
        questions: 0,
        studyMinutes: 0,
        flashcards: 0,
        catSessions: 0,
      };

      existing.questions += day.questionsAttempted;
      existing.studyMinutes += day.studyTimeMinutes;
      existing.flashcards += day.flashcardsReviewed;
      existing.catSessions += day.catSessions;
      weeks.set(key, existing);
    }
    weeklyData.push(...Array.from(weeks.values()));

    // --- Recent Sessions ---
    const recentSessions = [
      ...recentQuizSessions.map((q: (typeof recentQuizSessions)[number]) => ({
        id: q.id,
        type: 'quiz' as const,
        sessionType: q.sessionType,
        score:
          q.totalQuestions && q.totalQuestions > 0
            ? Math.round(
                ((q.correctAnswers ?? 0) / q.totalQuestions) * 100
              )
            : q.score,
        totalQuestions: q.totalQuestions,
        correctAnswers: q.correctAnswers,
        difficulty: q.difficulty,
        timeSeconds: q.totalTimeSeconds,
        completedAt: q.completedAt,
      })),
      ...recentCATSessions.map((c) => ({
        id: c.id,
        type: 'cat' as const,
        sessionType: 'cat_test',
        result: c.result,
        passingProbability: c.passingProbability
          ? Number(c.passingProbability)
          : null,
        ability: Number(c.currentAbility),
        totalQuestions: c.questionsAnswered,
        correctAnswers: c.questionsCorrect,
        timeSeconds: c.timeSpentSeconds,
        completedAt: c.completedAt,
        nclexType: c.nclexType,
      })),
    ]
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    return successResponse({
      overview: {
        totalQuestionsAnswered,
        totalCorrect,
        overallAccuracy,
        totalStudyHours,
        totalStudyMinutes,
        totalQuizSessions: recentQuizSessions.length,
        totalCATSessions: recentCATSessions.length,
        memberSince: user?.createdAt,
      },
      categoryBreakdown,
      weakAreas,
      trends: {
        daily: trendData,
        weekly: weeklyData,
      },
      recentSessions,
      streak: {
        current: user?.currentStreak ?? 0,
        longest: user?.longestStreak ?? 0,
        lastActiveDate: user?.lastActiveDate,
        daysActive: dailyUsage.filter(
          (d) => d.questionsAttempted > 0 || d.studyTimeMinutes > 0
        ).length,
      },
      gamification: {
        xpTotal: user?.xpTotal ?? 0,
        level: user?.level ?? 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

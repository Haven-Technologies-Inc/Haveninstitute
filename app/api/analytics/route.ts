import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const [
      totalQuizzes,
      totalCATs,
      recentQuizzes,
      recentCATs,
      studyActivities,
      streak,
    ] = await Promise.all([
      prisma.quizSession.count({ where: { userId, status: 'completed' } }),
      prisma.cATSession.count({ where: { userId, status: 'completed' } }),
      prisma.quizSession.findMany({
        where: { userId, status: 'completed' },
        take: 10,
        orderBy: { completedAt: 'desc' },
        select: {
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          completedAt: true,
          difficulty: true,
        },
      }),
      prisma.cATSession.findMany({
        where: { userId, status: 'completed' },
        take: 5,
        orderBy: { completedAt: 'desc' },
        select: {
          result: true,
          currentAbility: true,
          passingProbability: true,
          questionsAnswered: true,
          completedAt: true,
        },
      }),
      prisma.studyActivity.findMany({
        where: { userId },
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dailyUsage.findMany({
        where: { userId },
        take: 30,
        orderBy: { usageDate: 'desc' },
      }),
    ]);

    const avgScore = recentQuizzes.length > 0
      ? Math.round(
          recentQuizzes.reduce((acc, q) => acc + ((q.correctAnswers ?? 0) / (q.totalQuestions ?? 1)) * 100, 0) /
            recentQuizzes.length
        )
      : 0;

    const totalStudyMinutes = studyActivities.reduce((acc, a) => acc + (a.durationMinutes ?? 0), 0);

    return successResponse({
      overview: {
        totalQuizzes,
        totalCATs,
        averageScore: avgScore,
        totalStudyHours: Math.round(totalStudyMinutes / 60),
        questionsAnswered: recentQuizzes.reduce((acc, q) => acc + (q.totalQuestions ?? 0), 0),
      },
      recentQuizzes,
      recentCATs,
      studyActivities: studyActivities.slice(0, 10),
      dailyUsage: streak,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

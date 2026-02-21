import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const [goals, plans, achievements, recentActivities] = await Promise.all([
      prisma.studyGoal.findMany({
        where: { userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyPlan.findMany({
        where: { userId },
        include: {
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.userAchievement.findMany({
        where: { userId, isUnlocked: true },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 10,
      }),
      prisma.studyActivity.findMany({
        where: { userId },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return successResponse({
      goals,
      plans,
      achievements,
      recentActivities,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

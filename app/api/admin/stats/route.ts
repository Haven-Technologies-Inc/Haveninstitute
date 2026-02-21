import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersWeek,
      activeSubscriptions,
      totalQuestions,
      totalQuizSessions,
      totalCATSessions,
      recentPayments,
      subscriptionBreakdown,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.quizSession.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.cATSession.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.paymentTransaction.findMany({
        where: { status: 'succeeded', createdAt: { gte: monthAgo } },
        select: { amount: true },
      }),
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true,
      }),
    ]);

    const monthlyRevenue = recentPayments.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    return successResponse({
      users: {
        total: totalUsers,
        newThisWeek: newUsersWeek,
      },
      subscriptions: {
        active: activeSubscriptions,
        breakdown: subscriptionBreakdown.map((s) => ({
          tier: s.subscriptionTier,
          count: s._count,
        })),
      },
      content: {
        totalQuestions,
        quizSessionsThisMonth: totalQuizSessions,
        catSessionsThisMonth: totalCATSessions,
      },
      revenue: {
        monthly: monthlyRevenue,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

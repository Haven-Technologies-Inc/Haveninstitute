import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Core stats
    const [
      totalUsers,
      newUsersWeek,
      activeSubscriptions,
      totalQuestions,
      recentPayments,
      subscriptionBreakdown,
      flaggedPosts,
      flaggedComments,
      recentUsers,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.paymentTransaction.findMany({
        where: { status: 'succeeded', createdAt: { gte: monthAgo } },
        select: { amount: true },
      }),
      prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true,
      }),
      prisma.discussionPost.count({ where: { isFlagged: true, status: 'published' } }),
      prisma.discussionComment.count({ where: { isFlagged: true, isDeleted: false } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, subscriptionTier: true, createdAt: true },
      }),
      prisma.paymentTransaction.findMany({
        take: 10,
        where: { status: 'succeeded' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: { select: { fullName: true, email: true } },
        },
      }),
    ]);

    const monthlyRevenue = recentPayments.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    // Monthly revenue data (last 12 months)
    const monthlyRevenueData: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const payments = await prisma.paymentTransaction.findMany({
        where: {
          status: 'succeeded',
          createdAt: { gte: start, lt: end },
        },
        select: { amount: true },
      });
      const total = payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const monthLabel = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyRevenueData.push({ month: monthLabel, revenue: Math.round(total * 100) / 100 });
    }

    // User growth data (last 12 months)
    const userGrowthData: { month: string; users: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.user.count({
        where: { createdAt: { lt: end } },
      });
      const monthLabel = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      userGrowthData.push({ month: monthLabel, users: count });
    }

    // Recent activity feed (mixed)
    const activityFeed: { type: string; text: string; time: string }[] = [];

    for (const user of recentUsers) {
      activityFeed.push({
        type: 'user',
        text: `New user registered: ${user.fullName}`,
        time: user.createdAt.toISOString(),
      });
    }

    for (const txn of recentTransactions) {
      activityFeed.push({
        type: 'payment',
        text: `Payment received: ${txn.user.fullName} ($${Number(txn.amount).toFixed(2)})`,
        time: txn.createdAt.toISOString(),
      });
    }

    // Sort activity by time descending and take 20
    activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const recentActivity = activityFeed.slice(0, 20);

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
      },
      revenue: {
        monthly: monthlyRevenue,
      },
      alerts: {
        flaggedPosts,
        flaggedComments,
        totalFlagged: flaggedPosts + flaggedComments,
      },
      recentActivity,
      monthlyRevenueData,
      userGrowthData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

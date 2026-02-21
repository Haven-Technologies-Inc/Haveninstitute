import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Platform overview
    const [
      totalUsers,
      activeUsersToday,
      activeUsersMonth,
      totalQuestions,
      totalQuizSessions,
      totalCATSessions,
      activeSubscriptions,
      canceledSubscriptions30d,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLogin: { gte: today } } }),
      prisma.user.count({ where: { lastLogin: { gte: thirtyDaysAgo } } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.quizSession.count(),
      prisma.cATSession.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({
        where: { status: 'canceled', canceledAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Revenue metrics
    const allActiveSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { amount: true, billingPeriod: true },
    });

    let mrr = 0;
    for (const sub of allActiveSubscriptions) {
      const amount = Number(sub.amount || 0);
      if (sub.billingPeriod === 'year') {
        mrr += amount / 12;
      } else {
        mrr += amount;
      }
    }
    const arr = mrr * 12;
    const arpu = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;
    const churnRate = activeSubscriptions > 0
      ? (canceledSubscriptions30d / (activeSubscriptions + canceledSubscriptions30d)) * 100
      : 0;

    // User engagement (last 7 days average)
    const recentUsage = await prisma.dailyUsage.findMany({
      where: { usageDate: { gte: sevenDaysAgo } },
      select: {
        questionsAttempted: true,
        aiChatMessages: true,
        flashcardsReviewed: true,
        studyTimeMinutes: true,
      },
    });

    const totalDays = 7;
    const avgQuestionsPerDay = recentUsage.reduce((sum: number, u: any) => sum + u.questionsAttempted, 0) / totalDays;
    const avgAiChatsPerDay = recentUsage.reduce((sum: number, u: any) => sum + u.aiChatMessages, 0) / totalDays;
    const avgFlashcardsPerDay = recentUsage.reduce((sum: number, u: any) => sum + u.flashcardsReviewed, 0) / totalDays;
    const avgStudyMinutes = recentUsage.reduce((sum: number, u: any) => sum + u.studyTimeMinutes, 0) / totalDays;

    // User growth data (last 12 months)
    const userGrowthData: { month: string; users: number; newUsers: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const [cumulative, newInMonth] = await Promise.all([
        prisma.user.count({ where: { createdAt: { lt: monthEnd } } }),
        prisma.user.count({ where: { createdAt: { gte: monthStart, lt: monthEnd } } }),
      ]);
      userGrowthData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        users: cumulative,
        newUsers: newInMonth,
      });
    }

    // Revenue trend (last 12 months)
    const revenueTrend: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const payments = await prisma.paymentTransaction.findMany({
        where: { status: 'succeeded', createdAt: { gte: monthStart, lt: monthEnd } },
        select: { amount: true },
      });
      const total = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      revenueTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: Math.round(total * 100) / 100,
      });
    }

    // Category performance
    const categories = await prisma.nCLEXCategory.findMany({
      where: { isActive: true, parentId: null },
      select: {
        id: true,
        name: true,
        code: true,
        questions: {
          where: { isActive: true },
          select: { timesUsed: true, timesCorrect: true },
        },
      },
    });

    const categoryPerformance = categories.map((cat: any) => {
      const totalAttempts = cat.questions.reduce((sum: number, q: any) => sum + q.timesUsed, 0);
      const totalCorrect = cat.questions.reduce((sum: number, q: any) => sum + q.timesCorrect, 0);
      const passRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
      return {
        name: cat.name,
        code: cat.code,
        questionCount: cat.questions.length,
        totalAttempts,
        passRate: Math.round(passRate * 10) / 10,
      };
    }).sort((a: any, b: any) => b.totalAttempts - a.totalAttempts);

    // CAT exam readiness distribution
    const completedCATSessions = await prisma.cATSession.findMany({
      where: { status: 'completed', completedAt: { gte: thirtyDaysAgo } },
      select: { passingProbability: true, result: true },
    });

    const passDistribution = {
      high: completedCATSessions.filter((s: any) => Number(s.passingProbability || 0) >= 0.7).length,
      medium: completedCATSessions.filter((s: any) => {
        const p = Number(s.passingProbability || 0);
        return p >= 0.4 && p < 0.7;
      }).length,
      low: completedCATSessions.filter((s: any) => Number(s.passingProbability || 0) < 0.4).length,
    };

    // Feature usage (last 30 days)
    const featureUsage = await prisma.dailyUsage.aggregate({
      where: { usageDate: { gte: thirtyDaysAgo } },
      _sum: {
        questionsAttempted: true,
        aiChatMessages: true,
        flashcardsReviewed: true,
        catSessions: true,
        studyTimeMinutes: true,
      },
    });

    const featureUsageData = [
      { feature: 'Questions', usage: featureUsage._sum?.questionsAttempted ?? 0 },
      { feature: 'AI Chat', usage: featureUsage._sum?.aiChatMessages ?? 0 },
      { feature: 'Flashcards', usage: featureUsage._sum?.flashcardsReviewed ?? 0 },
      { feature: 'CAT Sessions', usage: featureUsage._sum?.catSessions ?? 0 },
    ];

    // Subscription distribution
    const subscriptionDistribution = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true,
    });

    return successResponse({
      overview: {
        totalUsers,
        dau: activeUsersToday,
        mau: activeUsersMonth,
        totalQuestions,
        totalQuizSessions,
        totalCATSessions,
      },
      engagement: {
        avgQuestionsPerDay: Math.round(avgQuestionsPerDay),
        avgAiChatsPerDay: Math.round(avgAiChatsPerDay),
        avgFlashcardsPerDay: Math.round(avgFlashcardsPerDay),
        avgStudyMinutesPerDay: Math.round(avgStudyMinutes),
      },
      revenue: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        arpu: Math.round(arpu * 100) / 100,
        churnRate: Math.round(churnRate * 10) / 10,
        activeSubscriptions,
      },
      userGrowthData,
      revenueTrend,
      categoryPerformance,
      passDistribution,
      featureUsageData,
      subscriptionDistribution: subscriptionDistribution.map((s: any) => ({
        tier: s.subscriptionTier,
        count: s._count,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

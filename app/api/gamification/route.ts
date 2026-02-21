import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// Level thresholds: cumulative XP required for each level
// ---------------------------------------------------------------------------

export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6000,
  10: 10000,
};

// ---------------------------------------------------------------------------
// GET /api/gamification
// Return the authenticated user's gamification data:
// - XP, level, streaks
// - Achievements (unlocked + available)
// - Leaderboard (top 20 by XP)
// - Level thresholds
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Fetch user gamification stats, achievements, and leaderboard in parallel
    const [user, userAchievements, allAchievements, leaderboard] =
      await Promise.all([
        // User stats
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            xpTotal: true,
            level: true,
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
          },
        }),

        // User's achievements (unlocked and in-progress)
        prisma.userAchievement.findMany({
          where: { userId },
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
        }),

        // All available achievements
        prisma.achievement.findMany({
          where: { isActive: true },
          orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
        }),

        // Leaderboard: top 20 users by XP
        prisma.user.findMany({
          where: { isActive: true },
          orderBy: { xpTotal: 'desc' },
          take: 20,
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            xpTotal: true,
            level: true,
            currentStreak: true,
          },
        }),
      ]);

    if (!user) {
      return successResponse({
        xp: { total: 0, level: 1, currentStreak: 0, longestStreak: 0 },
        achievements: { unlocked: [], available: [] },
        leaderboard: [],
        levelThresholds: LEVEL_THRESHOLDS,
      });
    }

    // Compute XP progress towards next level
    const currentLevel = user.level;
    const nextLevel = currentLevel < 10 ? currentLevel + 1 : null;
    const currentLevelXp = LEVEL_THRESHOLDS[currentLevel] ?? 0;
    const nextLevelXp = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null;
    const xpInCurrentLevel = user.xpTotal - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp
      ? nextLevelXp - currentLevelXp
      : null;

    // Separate unlocked vs available achievements
    type UAItem = (typeof userAchievements)[number];
    type AchItem = (typeof allAchievements)[number];
    type LBItem = (typeof leaderboard)[number];

    const unlockedIds = new Set(
      userAchievements
        .filter((ua: UAItem) => ua.isUnlocked)
        .map((ua: UAItem) => ua.achievementId)
    );

    const unlockedAchievements = userAchievements
      .filter((ua: UAItem) => ua.isUnlocked)
      .map((ua: UAItem) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt,
        progress: ua.progress,
      }));

    const availableAchievements = allAchievements
      .filter((a: AchItem) => !a.isHidden || unlockedIds.has(a.id))
      .map((a: AchItem) => {
        const userProgress = userAchievements.find(
          (ua: UAItem) => ua.achievementId === a.id
        );
        return {
          ...a,
          isUnlocked: unlockedIds.has(a.id),
          progress: userProgress?.progress ?? 0,
        };
      });

    // Find current user's rank in leaderboard
    const userRank =
      leaderboard.findIndex((u: LBItem) => u.id === userId) + 1;

    return successResponse({
      xp: {
        total: user.xpTotal,
        level: user.level,
        currentLevelXp: currentLevelXp,
        nextLevelXp: nextLevelXp,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        progressPercent:
          xpNeededForNextLevel && xpNeededForNextLevel > 0
            ? Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
            : 100,
      },
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak,
        lastActiveDate: user.lastActiveDate,
      },
      achievements: {
        unlocked: unlockedAchievements,
        available: availableAchievements,
        totalUnlocked: unlockedAchievements.length,
        totalAvailable: allAchievements.length,
      },
      leaderboard: leaderboard.map((u: LBItem, index: number) => ({
        rank: index + 1,
        id: u.id,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        xpTotal: u.xpTotal,
        level: u.level,
        currentStreak: u.currentStreak,
        isCurrentUser: u.id === userId,
      })),
      userRank: userRank > 0 ? userRank : null,
      levelThresholds: LEVEL_THRESHOLDS,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

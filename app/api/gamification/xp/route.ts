import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';
import { sendNotification } from '@/lib/notifications';

// ---------------------------------------------------------------------------
// Level thresholds (duplicated from parent for self-contained usage)
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: Record<number, number> = {
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
// XP values per action
// ---------------------------------------------------------------------------

const XP_ACTIONS: Record<string, number> = {
  quiz_complete: 25,
  cat_complete: 50,
  flashcard_review: 5,
  discussion_post: 15,
  discussion_reply: 10,
  daily_login: 10,
  streak_bonus: 0, // computed dynamically as streak_count * 5
};

// Streak milestone thresholds for special notifications
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 200, 365];

// ---------------------------------------------------------------------------
// POST /api/gamification/xp
// Award XP for a specific action.
// Body: { action: string, metadata?: any }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await request.json();

    const { action, metadata } = body;

    if (!action || !(action in XP_ACTIONS)) {
      return errorResponse(
        `Invalid action. Valid actions: ${Object.keys(XP_ACTIONS).join(', ')}`
      );
    }

    // Fetch current user state
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xpTotal: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        fullName: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // --- Calculate XP to award ---
    let xpToAward = XP_ACTIONS[action];
    let streakUpdated = false;
    let newStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    // Handle streak for daily_login
    if (action === 'daily_login') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate)
        : null;
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
      }

      // Already logged in today - skip
      if (lastActive && lastActive.getTime() === today.getTime()) {
        return successResponse({
          xpAwarded: 0,
          xpTotal: user.xpTotal,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          newAchievements: [],
          message: 'Daily login already recorded today',
        });
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        // Consecutive day
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken, start fresh
        newStreak = 1;
      }

      newLongestStreak = Math.max(newLongestStreak, newStreak);
      streakUpdated = true;
    }

    // Handle streak_bonus action
    if (action === 'streak_bonus') {
      xpToAward = user.currentStreak * 5;
      if (xpToAward === 0) xpToAward = 5; // minimum 5 XP
    }

    const newXpTotal = user.xpTotal + xpToAward;

    // --- Calculate new level ---
    let newLevel = user.level;
    const sortedLevels = Object.entries(LEVEL_THRESHOLDS)
      .map(([l, xp]) => ({ level: parseInt(l), xp }))
      .sort((a, b) => b.xp - a.xp);

    for (const { level, xp } of sortedLevels) {
      if (newXpTotal >= xp) {
        newLevel = level;
        break;
      }
    }

    const leveledUp = newLevel > user.level;

    // --- Update user ---
    const updateData: Record<string, unknown> = {
      xpTotal: newXpTotal,
      level: newLevel,
    };

    if (streakUpdated) {
      updateData.currentStreak = newStreak;
      updateData.longestStreak = newLongestStreak;
      updateData.lastActiveDate = new Date();
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // --- Check achievement unlock conditions ---
    const newAchievements = await checkAndUnlockAchievements(
      userId,
      action,
      newXpTotal,
      newLevel,
      newStreak,
      metadata
    );

    // --- Send notifications for special events ---

    // Level up notification
    if (leveledUp) {
      await sendNotification({
        userId,
        type: 'gamification',
        title: `Level Up! You're now Level ${newLevel}`,
        message: `Congratulations! You've reached Level ${newLevel} with ${newXpTotal} XP.`,
        actionUrl: '/achievements',
      });
    }

    // Streak milestone notification
    if (streakUpdated && STREAK_MILESTONES.includes(newStreak)) {
      await sendNotification({
        userId,
        type: 'gamification',
        title: `${newStreak}-Day Streak Milestone!`,
        message: `Amazing dedication! You've studied for ${newStreak} consecutive days.`,
        actionUrl: '/achievements',
        sendEmail: true,
      });
    }

    return successResponse({
      xpAwarded: xpToAward,
      xpTotal: newXpTotal,
      level: newLevel,
      leveledUp,
      previousLevel: user.level,
      currentStreak: streakUpdated ? newStreak : user.currentStreak,
      longestStreak: streakUpdated ? newLongestStreak : user.longestStreak,
      newAchievements,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// Achievement checking logic
// ---------------------------------------------------------------------------

async function checkAndUnlockAchievements(
  userId: string,
  action: string,
  xpTotal: number,
  level: number,
  streak: number,
  _metadata?: unknown
): Promise<Array<{ id: string; name: string; xpReward: number }>> {
  const newlyUnlocked: Array<{ id: string; name: string; xpReward: number }> =
    [];

  // Get all active achievements that user hasn't unlocked yet
  const achievements = await prisma.achievement.findMany({
    where: {
      isActive: true,
      users: {
        none: {
          userId,
          isUnlocked: true,
        },
      },
    },
  });

  for (const achievement of achievements) {
    let shouldUnlock = false;
    const criteria = achievement.criteria as Record<string, unknown> | null;

    // Check various achievement types
    switch (achievement.achievementType) {
      case 'xp_total':
        if (
          achievement.thresholdValue &&
          xpTotal >= achievement.thresholdValue
        ) {
          shouldUnlock = true;
        }
        break;

      case 'level_reached':
        if (achievement.thresholdValue && level >= achievement.thresholdValue) {
          shouldUnlock = true;
        }
        break;

      case 'streak_days':
        if (achievement.thresholdValue && streak >= achievement.thresholdValue) {
          shouldUnlock = true;
        }
        break;

      case 'quizzes_completed': {
        if (achievement.thresholdValue) {
          const count = await prisma.quizSession.count({
            where: { userId, status: 'completed' },
          });
          if (count >= achievement.thresholdValue) shouldUnlock = true;
        }
        break;
      }

      case 'cat_completed': {
        if (achievement.thresholdValue) {
          const count = await prisma.cATSession.count({
            where: { userId, status: 'completed' },
          });
          if (count >= achievement.thresholdValue) shouldUnlock = true;
        }
        break;
      }

      case 'cat_passed': {
        if (achievement.thresholdValue) {
          const count = await prisma.cATSession.count({
            where: { userId, status: 'completed', result: 'pass' },
          });
          if (count >= achievement.thresholdValue) shouldUnlock = true;
        }
        break;
      }

      case 'flashcards_reviewed': {
        if (achievement.thresholdValue) {
          const totalReviews = await prisma.userFlashcardProgress.aggregate({
            where: { userId },
            _sum: { totalReviews: true },
          });
          if (
            (totalReviews._sum.totalReviews ?? 0) >=
            achievement.thresholdValue
          ) {
            shouldUnlock = true;
          }
        }
        break;
      }

      case 'discussion_posts': {
        if (achievement.thresholdValue) {
          const count = await prisma.discussionPost.count({
            where: { authorId: userId },
          });
          if (count >= achievement.thresholdValue) shouldUnlock = true;
        }
        break;
      }

      case 'action_based': {
        // Criteria-based: { action: "quiz_complete", count: 10 }
        if (criteria && criteria.action === action && criteria.count) {
          // Count user's occurrences of this action in study activities
          const count = await prisma.studyActivity.count({
            where: { userId, activityType: action },
          });
          if (count >= (criteria.count as number)) shouldUnlock = true;
        }
        break;
      }
    }

    if (shouldUnlock) {
      // Upsert achievement record
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
        create: {
          userId,
          achievementId: achievement.id,
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: achievement.thresholdValue ?? 100,
        },
        update: {
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: achievement.thresholdValue ?? 100,
        },
      });

      // Award bonus XP for the achievement
      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { xpTotal: { increment: achievement.xpReward } },
        });
      }

      // Send notification
      await sendNotification({
        userId,
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.name}`,
        message:
          achievement.description ??
          `You've earned the "${achievement.name}" achievement!`,
        actionUrl: '/achievements',
        sendEmail: true,
      });

      newlyUnlocked.push({
        id: achievement.id,
        name: achievement.name,
        xpReward: achievement.xpReward,
      });
    }
  }

  return newlyUnlocked;
}

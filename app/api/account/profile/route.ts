import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/account/profile
// Fetch the authenticated user's profile with settings, gamification, and
// achievement summary.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        avatarUrl: true,
        phoneNumber: true,
        bio: true,
        preferredStudyTime: true,
        goals: true,
        nclexType: true,
        examDate: true,
        targetScore: true,
        weakAreas: true,
        hasCompletedOnboarding: true,
        authProvider: true,
        mfaEnabled: true,
        xpTotal: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        userSettings: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Fetch achievements summary
    const [totalAchievements, unlockedAchievements, recentAchievements] =
      await Promise.all([
        prisma.achievement.count({ where: { isActive: true } }),
        prisma.userAchievement.count({
          where: { userId, isUnlocked: true },
        }),
        prisma.userAchievement.findMany({
          where: { userId, isUnlocked: true },
          orderBy: { unlockedAt: 'desc' },
          take: 5,
          include: {
            achievement: {
              select: {
                name: true,
                description: true,
                icon: true,
                badgeUrl: true,
                xpReward: true,
                rarity: true,
              },
            },
          },
        }),
      ]);

    // Streak info
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const streakActive =
      user.lastActiveDate !== null &&
      new Date(user.lastActiveDate).getTime() >=
        today.getTime() - 24 * 60 * 60 * 1000;

    return successResponse({
      ...user,
      achievements: {
        total: totalAchievements,
        unlocked: unlockedAchievements,
        recent: recentAchievements,
        completionPercent:
          totalAchievements > 0
            ? Math.round((unlockedAchievements / totalAchievements) * 100)
            : 0,
      },
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak,
        isActive: streakActive,
        lastActiveDate: user.lastActiveDate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/account/profile
// Update profile fields (fullName, bio, phoneNumber, nclexType, examDate,
// targetScore, preferredStudyTime, goals, weakAreas, avatarUrl).
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await request.json();

    // Allowlisted fields that can be updated
    const allowedFields: Record<string, (v: unknown) => unknown> = {
      fullName: (v) => (typeof v === 'string' ? v.trim() : undefined),
      bio: (v) => (typeof v === 'string' ? v.trim() : undefined),
      phoneNumber: (v) => (typeof v === 'string' ? v.trim() : undefined),
      avatarUrl: (v) => (typeof v === 'string' ? v.trim() : undefined),
      nclexType: (v) =>
        v === 'RN' || v === 'PN' ? v : undefined,
      examDate: (v) => (v ? new Date(v as string) : null),
      targetScore: (v) =>
        typeof v === 'number' && v >= 0 && v <= 100 ? v : undefined,
      preferredStudyTime: (v) =>
        typeof v === 'string' ? v.trim() : undefined,
      goals: (v) => v ?? undefined,
      weakAreas: (v) => v ?? undefined,
      hasCompletedOnboarding: (v) =>
        typeof v === 'boolean' ? v : undefined,
      onboardingData: (v) => v ?? undefined,
    };

    const data: Record<string, unknown> = {};
    for (const [key, sanitize] of Object.entries(allowedFields)) {
      if (key in body) {
        const value = sanitize(body[key]);
        if (value !== undefined) {
          data[key] = value;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return errorResponse('No valid fields to update');
    }

    // Validate fullName if provided
    if (data.fullName !== undefined && (data.fullName as string).length < 1) {
      return errorResponse('Full name cannot be empty');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        avatarUrl: true,
        phoneNumber: true,
        bio: true,
        preferredStudyTime: true,
        goals: true,
        nclexType: true,
        examDate: true,
        targetScore: true,
        weakAreas: true,
        hasCompletedOnboarding: true,
        xpTotal: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        updatedAt: true,
        userSettings: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

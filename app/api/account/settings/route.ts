import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/account/settings
// Fetch the authenticated user's settings. Creates default settings if none
// exist yet.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/account/settings
// Update user settings (theme, notifications, privacy, accessibility, etc.)
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await request.json();

    // Ensure settings record exists
    const existing = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existing) {
      await prisma.userSettings.create({ data: { userId } });
    }

    // Allowlisted fields with validation
    const allowedFields: Record<string, (v: unknown) => unknown> = {
      // Theme & locale
      theme: (v) =>
        typeof v === 'string' && ['light', 'dark', 'system'].includes(v)
          ? v
          : undefined,
      language: (v) => (typeof v === 'string' ? v.trim() : undefined),
      timezone: (v) => (typeof v === 'string' ? v.trim() : undefined),

      // Notification preferences
      emailNotifications: toBool,
      smsNotifications: toBool,
      pushNotifications: toBool,
      studyReminders: toBool,
      marketingEmails: toBool,
      weeklyDigest: toBool,
      achievementAlerts: toBool,
      communityUpdates: toBool,

      // Study preferences
      dailyGoalQuestions: (v) =>
        typeof v === 'number' && v >= 1 && v <= 200 ? v : undefined,
      preferredDifficulty: (v) =>
        typeof v === 'string' &&
        ['easy', 'medium', 'hard', 'adaptive'].includes(v)
          ? v
          : undefined,
      showExplanations: toBool,
      enableTimer: toBool,

      // Privacy
      profileVisibility: (v) =>
        typeof v === 'string' && ['public', 'friends', 'private'].includes(v)
          ? v
          : undefined,
      showActivity: toBool,
      showProgress: toBool,

      // Accessibility
      fontSize: (v) =>
        typeof v === 'string' && ['small', 'medium', 'large', 'xlarge'].includes(v)
          ? v
          : undefined,
      highContrast: toBool,
      reduceMotion: toBool,
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
      return errorResponse('No valid settings to update');
    }

    const updatedSettings = await prisma.userSettings.update({
      where: { userId },
      data,
    });

    return successResponse(updatedSettings);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}

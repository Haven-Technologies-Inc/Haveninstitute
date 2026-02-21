import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await requireAuth();

    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: session.user.id },
      });
    }

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const allowedFields = [
      'theme', 'language', 'timezone',
      'emailNotifications', 'pushNotifications', 'studyReminders', 'marketingEmails',
      'dailyGoalQuestions', 'preferredDifficulty', 'showExplanations', 'enableTimer',
      'profileVisibility', 'showActivity', 'showProgress',
      'fontSize', 'highContrast', 'reduceMotion',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

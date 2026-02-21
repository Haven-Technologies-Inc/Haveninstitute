import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

// Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const allowedFields = [
      'fullName', 'bio', 'phoneNumber', 'avatarUrl',
      'nclexType', 'examDate', 'targetScore', 'goals', 'weakAreas',
      'preferredStudyTime', 'hasCompletedOnboarding', 'onboardingData',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'examDate' && body[field]) {
          data[field] = new Date(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        avatarUrl: true,
        bio: true,
        nclexType: true,
        examDate: true,
        hasCompletedOnboarding: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

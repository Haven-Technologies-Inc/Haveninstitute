import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        nclexType: true,
        examDate: true,
        goals: true,
        hasCompletedOnboarding: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return successResponse(null, 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

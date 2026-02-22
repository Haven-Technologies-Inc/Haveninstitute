import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, stripeCustomerId: true, subscriptionTier: true },
    });

    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    const allowedFields = ['role', 'subscriptionTier', 'isActive'];
    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    // If changing subscription tier, also update active subscription record
    if (body.subscriptionTier && body.subscriptionTier !== existingUser.subscriptionTier) {
      // Update the user's active subscription if one exists
      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
      });

      if (activeSubscription) {
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: { planType: body.subscriptionTier },
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        isActive: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        stripeCustomerId: true,
        authProvider: true,
        xpTotal: true,
        level: true,
        currentStreak: true,
        _count: {
          select: {
            quizSessions: true,
            catSessions: true,
            flashcardDecks: true,
            discussionPosts: true,
          },
        },
        subscriptions: {
          where: { status: 'active' },
          select: {
            id: true,
            planType: true,
            status: true,
            billingPeriod: true,
            amount: true,
            currentPeriodEnd: true,
            stripeSubscriptionId: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

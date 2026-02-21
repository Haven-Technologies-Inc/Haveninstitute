import { prisma } from '@/lib/db';
import { getStripe } from '@/lib/stripe-client';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function POST() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return errorResponse('No billing account found');
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/account/subscription`,
    });

    return successResponse({ url: portalSession.url });
  } catch (error) {
    return handleApiError(error);
  }
}

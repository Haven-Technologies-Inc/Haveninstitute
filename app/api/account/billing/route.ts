import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const [payments, total, subscription] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          receiptUrl: true,
          invoicePdf: true,
          stripeInvoiceId: true,
          stripeChargeId: true,
          paymentMethod: true,
          createdAt: true,
          subscription: {
            select: {
              id: true,
              planType: true,
              billingPeriod: true,
              status: true,
            },
          },
        },
      }),
      prisma.paymentTransaction.count({ where: { userId } }),
      prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          planType: true,
          status: true,
          billingPeriod: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      }),
    ]);

    return successResponse({
      payments,
      total,
      limit,
      offset,
      subscription,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

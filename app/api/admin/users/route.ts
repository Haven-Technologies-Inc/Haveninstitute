import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') where.role = role;
    if (tier && tier !== 'all') where.subscriptionTier = tier;
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          stripeCustomerId: true,
          _count: { select: { quizSessions: true, catSessions: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

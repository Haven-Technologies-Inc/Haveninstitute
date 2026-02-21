import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const tier = searchParams.get('tier');
    const limit = parseInt(searchParams.get('limit') ?? '25');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (tier) where.subscriptionTier = tier;

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
          _count: { select: { quizSessions: true, catSessions: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({ users, total, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { userId, ...updates } = body;

    const allowedFields = ['role', 'subscriptionTier', 'isActive'];
    const data: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) data[field] = updates[field];
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, fullName: true, role: true, subscriptionTier: true, isActive: true },
    });

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const myGroups = searchParams.get('my') === 'true';
    const search = searchParams.get('search');

    let where: any = { isActive: true };

    if (myGroups) {
      where.members = { some: { userId: session.user.id } };
    } else {
      where.isPublic = true;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        owner: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { members: true } },
      },
      orderBy: { memberCount: 'desc' },
      take: 20,
    });

    return successResponse(groups);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (!body.name) {
      return errorResponse('Group name is required');
    }

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await prisma.studyGroup.create({
      data: {
        name: body.name,
        description: body.description,
        ownerId: session.user.id,
        isPublic: body.isPublic ?? true,
        maxMembers: body.maxMembers ?? 50,
        joinCode,
        members: {
          create: {
            userId: session.user.id,
            role: 'owner',
          },
        },
      },
    });

    return successResponse(group, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

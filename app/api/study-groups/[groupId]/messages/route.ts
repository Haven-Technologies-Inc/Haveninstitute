import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get group messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const before = searchParams.get('before');

    // Verify membership
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id },
      },
    });

    if (!member) return errorResponse('Not a member of this group', 403);

    const where: any = { groupId, isDeleted: false };
    if (before) where.createdAt = { lt: new Date(before) };

    const messages = await prisma.groupMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            user: { select: { fullName: true } },
          },
        },
      },
    });

    // Update last active
    await prisma.groupMember.update({
      where: { id: member.id },
      data: { lastActiveAt: new Date() },
    });

    return successResponse(messages.reverse());
  } catch (error) {
    return handleApiError(error);
  }
}

// Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;
    const body = await request.json();
    const { content, replyToId } = body;

    if (!content?.trim()) return errorResponse('Content is required');

    // Verify membership
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id },
      },
    });

    if (!member) return errorResponse('Not a member of this group', 403);

    const message = await prisma.groupMessage.create({
      data: {
        groupId,
        userId: session.user.id,
        content: content.trim(),
        replyToId: replyToId || null,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    return successResponse(message, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

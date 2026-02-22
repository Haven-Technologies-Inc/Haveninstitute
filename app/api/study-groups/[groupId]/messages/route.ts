import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get group messages with cursor-based pagination and polling support
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const cursor = searchParams.get('cursor');
    const after = searchParams.get('after');

    // Verify membership
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id },
      },
    });

    if (!member) return errorResponse('Not a member of this group', 403);

    const includeRelations = {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          isDeleted: true,
          user: { select: { id: true, fullName: true } },
        },
      },
    };

    // Polling mode: fetch messages created after a given timestamp
    if (after) {
      const messages = await prisma.groupMessage.findMany({
        where: {
          groupId,
          isDeleted: false,
          createdAt: { gt: new Date(after) },
        },
        orderBy: { createdAt: 'asc' },
        include: includeRelations,
      });

      return successResponse(messages);
    }

    // Cursor-based pagination: fetch older messages before the cursor
    const where: Record<string, unknown> = { groupId, isDeleted: false };

    if (cursor) {
      const cursorMessage = await prisma.groupMessage.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });

      if (cursorMessage) {
        where.createdAt = { lt: cursorMessage.createdAt };
      }
    }

    const messages = await prisma.groupMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: includeRelations,
    });

    // Update last active timestamp
    await prisma.groupMember.update({
      where: { id: member.id },
      data: { lastActiveAt: new Date() },
    });

    const hasMore = messages.length === limit;
    const oldestId = messages.length > 0 ? messages[messages.length - 1].id : null;

    return successResponse({
      messages: messages.reverse(),
      nextCursor: hasMore ? oldestId : null,
      hasMore,
    });
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
    if (content.trim().length > 2000) return errorResponse('Message too long (max 2000 characters)');

    // Verify membership
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id },
      },
    });

    if (!member) return errorResponse('Not a member of this group', 403);

    // Validate replyToId if provided
    if (replyToId) {
      const replyTarget = await prisma.groupMessage.findUnique({
        where: { id: replyToId },
        select: { id: true, groupId: true },
      });
      if (!replyTarget || replyTarget.groupId !== groupId) {
        return errorResponse('Invalid reply target');
      }
    }

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
        replyTo: {
          select: {
            id: true,
            content: true,
            isDeleted: true,
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    return successResponse(message, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Edit or delete a message
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;
    const body = await request.json();
    const { messageId, content, action } = body;

    if (!messageId) return errorResponse('Message ID is required');

    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
      select: { id: true, groupId: true, userId: true },
    });

    if (!message || message.groupId !== groupId) {
      return errorResponse('Message not found', 404);
    }

    if (message.userId !== session.user.id) {
      return errorResponse('You can only modify your own messages', 403);
    }

    if (action === 'delete') {
      const updated = await prisma.groupMessage.update({
        where: { id: messageId },
        data: { isDeleted: true },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });
      return successResponse(updated);
    }

    if (action === 'edit') {
      if (!content?.trim()) return errorResponse('Content is required for edit');
      if (content.trim().length > 2000) return errorResponse('Message too long (max 2000 characters)');

      const updated = await prisma.groupMessage.update({
        where: { id: messageId },
        data: { content: content.trim(), isEdited: true },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              isDeleted: true,
              user: { select: { id: true, fullName: true } },
            },
          },
        },
      });
      return successResponse(updated);
    }

    return errorResponse('Invalid action. Use "edit" or "delete".');
  } catch (error) {
    return handleApiError(error);
  }
}

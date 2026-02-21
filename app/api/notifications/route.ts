import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/notifications
// List user's notifications (paginated) with unread count.
//
// Query params:
//   page (default: 1)
//   limit (default: 20, max: 100)
//   unread (true/false - filter to unread only)
//   type (filter by notification type)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') ?? '20'))
    );
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.notificationType = type;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + notifications.length < totalCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/notifications
// Mark notifications as read.
//
// Body: { ids: string[] } - mark specific notifications as read
//   OR  { all: true }     - mark all unread notifications as read
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const body = await request.json();

    const now = new Date();

    if (body.all === true) {
      // Mark all unread notifications as read
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: now },
      });

      return successResponse({
        markedAsRead: result.count,
        message: `${result.count} notification(s) marked as read`,
      });
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      // Validate that IDs are strings
      const ids = body.ids.filter(
        (id: unknown) => typeof id === 'string'
      ) as string[];

      if (ids.length === 0) {
        return errorResponse('No valid notification IDs provided');
      }

      // Only update notifications belonging to this user
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId,
          isRead: false,
        },
        data: { isRead: true, readAt: now },
      });

      return successResponse({
        markedAsRead: result.count,
        message: `${result.count} notification(s) marked as read`,
      });
    }

    return errorResponse(
      'Provide either { ids: string[] } or { all: true }'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/notifications
// Delete a notification by ID.
//
// Query param: id (notification ID)
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return errorResponse('Notification ID is required (pass as ?id=...)');
    }

    // Verify the notification belongs to this user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return successResponse({
      deleted: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

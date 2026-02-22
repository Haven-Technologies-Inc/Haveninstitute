import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Toggle a reaction (like/bookmark) on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await requireAuth();
    const { postId } = await params;
    const body = await request.json();
    const { reactionType, commentId } = body;

    const type = reactionType || 'like';

    if (type === 'bookmark') {
      // Handle bookmark separately
      const existing = await prisma.discussionBookmark.findUnique({
        where: {
          userId_postId: { userId: session.user.id, postId },
        },
      });

      if (existing) {
        await prisma.discussionBookmark.delete({ where: { id: existing.id } });
        return successResponse({ bookmarked: false });
      } else {
        await prisma.discussionBookmark.create({
          data: { userId: session.user.id, postId },
        });
        return successResponse({ bookmarked: true });
      }
    }

    // Handle like/other reactions
    const existing = await prisma.discussionReaction.findFirst({
      where: {
        userId: session.user.id,
        postId: commentId ? null : postId,
        commentId: commentId || null,
        reactionType: type,
      },
    });

    if (existing) {
      await prisma.discussionReaction.delete({ where: { id: existing.id } });

      // Decrement count
      if (commentId) {
        await prisma.discussionComment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await prisma.discussionPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
      }

      return successResponse({ liked: false });
    } else {
      await prisma.discussionReaction.create({
        data: {
          userId: session.user.id,
          postId: commentId ? null : postId,
          commentId: commentId || null,
          reactionType: type,
        },
      });

      if (commentId) {
        await prisma.discussionComment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        });
      } else {
        await prisma.discussionPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      }

      return successResponse({ liked: true });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

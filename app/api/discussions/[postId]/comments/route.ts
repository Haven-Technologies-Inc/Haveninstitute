import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get comments for a discussion post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await requireAuth();
    const { postId } = await params;

    const comments = await prisma.discussionComment.findMany({
      where: { postId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        reactions: {
          select: { id: true, userId: true, reactionType: true },
        },
      },
    });

    return successResponse(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await requireAuth();
    const { postId } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content?.trim()) {
      return errorResponse('Content is required');
    }

    // Verify post exists
    const post = await prisma.discussionPost.findUnique({
      where: { id: postId },
    });

    if (!post) return errorResponse('Post not found', 404);
    if (post.isLocked) return errorResponse('This discussion is locked');

    // Calculate depth for threaded replies
    let depth = 0;
    if (parentId) {
      const parent = await prisma.discussionComment.findUnique({
        where: { id: parentId },
      });
      if (parent) depth = parent.depth + 1;
    }

    const comment = await prisma.discussionComment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: content.trim(),
        parentId: parentId || null,
        depth: Math.min(depth, 3), // Max nesting depth
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    // Update comment count
    await prisma.discussionPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return successResponse(comment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

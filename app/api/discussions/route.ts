import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const sort = searchParams.get('sort') ?? 'newest';
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    // Single post lookup by slug
    const slug = searchParams.get('slug');
    if (slug) {
      const post = await prisma.discussionPost.findFirst({
        where: { slug: { contains: slug, mode: 'insensitive' } },
        include: {
          author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
          comments: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
              reactions: { select: { id: true, userId: true, reactionType: true } },
            },
          },
          reactions: { select: { id: true, userId: true, reactionType: true } },
          bookmarks: { select: { userId: true } },
        },
      });
      if (!post) return errorResponse('Post not found', 404);
      // Increment view count
      await prisma.discussionPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
      return successResponse(post);
    }

    const where: any = { status: 'published' };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any =
      sort === 'popular' ? { likeCount: 'desc' as const } :
      sort === 'unanswered' ? { commentCount: 'asc' as const } :
      { createdAt: 'desc' as const };

    const [posts, total, categories] = await Promise.all([
      prisma.discussionPost.findMany({
        where,
        include: {
          author: { select: { id: true, fullName: true, avatarUrl: true } },
          category: { select: { name: true, slug: true, color: true, icon: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        take: limit,
        skip: offset,
        orderBy,
      }),
      prisma.discussionPost.count({ where }),
      prisma.discussionCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    return successResponse({ posts, total, categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    if (!body.title || !body.content || !body.categoryId) {
      return errorResponse('Title, content, and category are required');
    }

    const post = await prisma.discussionPost.create({
      data: {
        authorId: session.user.id,
        categoryId: body.categoryId,
        title: body.title,
        content: body.content,
        slug: generateSlug(body.title) + '-' + Date.now().toString(36),
        postType: body.postType ?? 'discussion',
      },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        category: { select: { name: true, slug: true } },
      },
    });

    // Update category post count
    await prisma.discussionCategory.update({
      where: { id: body.categoryId },
      data: { postCount: { increment: 1 } },
    });

    return successResponse(post, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

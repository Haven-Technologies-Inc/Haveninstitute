import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAuth,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// POST /api/books/[bookId]/progress - Update reading progress / bookmark / rate
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id;
    const { bookId } = params;

    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return errorResponse('Book not found', 404);
    }

    const body = await request.json();
    const { action } = body;

    // -----------------------------------------------------------------------
    // Bookmark / Unbookmark
    // -----------------------------------------------------------------------
    if (action === 'bookmark' || action === 'unbookmark') {
      const userBook = await prisma.userBook.upsert({
        where: { userId_bookId: { userId, bookId } },
        create: {
          userId,
          bookId,
          bookmarks: action === 'bookmark' ? JSON.stringify({ bookmarked: true }) : undefined,
        },
        update: {
          bookmarks: action === 'bookmark' ? JSON.stringify({ bookmarked: true }) : null as any,
        },
      });

      return successResponse({
        isBookmarked: action === 'bookmark',
        userBook,
      });
    }

    // -----------------------------------------------------------------------
    // Rate / Review
    // -----------------------------------------------------------------------
    if (body.rating !== undefined) {
      const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10)));
      const review = body.review || null;

      // Get existing userBook to check if they already rated
      const existingUserBook = await prisma.userBook.findUnique({
        where: { userId_bookId: { userId, bookId } },
      });

      const hadPreviousRating = existingUserBook?.rating !== null && existingUserBook?.rating !== undefined;

      const userBook = await prisma.userBook.upsert({
        where: { userId_bookId: { userId, bookId } },
        create: {
          userId,
          bookId,
          rating,
          review,
        },
        update: {
          rating,
          review,
        },
      });

      // Recalculate book's average rating
      const ratingAgg = await prisma.userBook.aggregate({
        where: {
          bookId,
          rating: { not: null },
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.book.update({
        where: { id: bookId },
        data: {
          ratingAvg: ratingAgg._avg.rating || 0,
          ratingCount: ratingAgg._count.rating || 0,
        },
      });

      return successResponse({
        rating: userBook.rating,
        review: userBook.review,
        bookRatingAvg: ratingAgg._avg.rating || 0,
        bookRatingCount: ratingAgg._count.rating || 0,
      });
    }

    // -----------------------------------------------------------------------
    // Update Reading Progress (default action)
    // -----------------------------------------------------------------------
    const { currentPage, progressPercent, timeSpentMinutes } = body;

    const updateData: any = {};

    if (currentPage !== undefined) {
      updateData.currentPage = Math.max(0, parseInt(currentPage, 10));
    }

    if (progressPercent !== undefined) {
      updateData.progressPercent = Math.min(100, Math.max(0, parseFloat(progressPercent)));
    }

    if (timeSpentMinutes !== undefined) {
      // We increment reading time rather than set it
      updateData.totalReadingTimeMinutes = {
        increment: Math.max(0, parseInt(timeSpentMinutes, 10)),
      };
    }

    updateData.lastReadAt = new Date();

    const userBook = await prisma.userBook.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: {
        userId,
        bookId,
        currentPage: updateData.currentPage || 0,
        progressPercent: typeof updateData.progressPercent === 'number' ? updateData.progressPercent : 0,
        totalReadingTimeMinutes: timeSpentMinutes ? Math.max(0, parseInt(timeSpentMinutes, 10)) : 0,
        lastReadAt: new Date(),
      },
      update: updateData,
    });

    return successResponse({
      currentPage: userBook.currentPage,
      progressPercent: Number(userBook.progressPercent),
      totalReadingTimeMinutes: userBook.totalReadingTimeMinutes,
      lastReadAt: userBook.lastReadAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

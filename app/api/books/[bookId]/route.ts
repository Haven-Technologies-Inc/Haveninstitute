import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getAuthSession,
  requireAdmin,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/books/[bookId] - Get single book with user progress
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return errorResponse('Book not found', 404);
    }

    // Check if published (or admin viewing)
    const session = await getAuthSession();
    const isAdmin = session?.user?.role === 'admin';

    if (!book.isPublished && !isAdmin) {
      return errorResponse('Book not found', 404);
    }

    // Fetch user's book progress if authenticated
    let userBook = null;
    if (session?.user?.id) {
      const ub = await prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId: book.id,
          },
        },
      });

      if (ub) {
        userBook = {
          currentPage: ub.currentPage,
          progressPercent: Number(ub.progressPercent),
          totalReadingTimeMinutes: ub.totalReadingTimeMinutes,
          lastReadAt: ub.lastReadAt,
          isBookmarked: ub.bookmarks !== null,
          isPurchased: ub.isPurchased,
          purchasedAt: ub.purchasedAt,
          rating: ub.rating,
          review: ub.review,
          highlights: ub.highlights,
          notes: ub.notes,
        };
      }
    }

    return successResponse({
      ...book,
      ratingAvg: Number(book.ratingAvg),
      price: Number(book.price),
      userBook,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/books/[bookId] - Update book (admin only)
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin();
    const { bookId } = await params;

    const existing = await prisma.book.findUnique({ where: { id: bookId } });
    if (!existing) {
      return errorResponse('Book not found', 404);
    }

    const body = await request.json();

    // Only include fields that were provided
    const data: any = {};
    const allowedFields = [
      'title',
      'author',
      'description',
      'isbn',
      'coverUrl',
      'fileUrl',
      'fileType',
      'pageCount',
      'durationMinutes',
      'category',
      'tags',
      'price',
      'isFree',
      'requiredSubscription',
      'isPublished',
      'isFeatured',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'pageCount' || field === 'durationMinutes') {
          data[field] = body[field] !== null ? parseInt(body[field], 10) : null;
        } else if (field === 'price') {
          data[field] = parseFloat(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data,
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/books/[bookId] - Delete book (admin only)
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireAdmin();
    const { bookId } = await params;

    const existing = await prisma.book.findUnique({ where: { id: bookId } });
    if (!existing) {
      return errorResponse('Book not found', 404);
    }

    // Delete all user book records first, then the book
    await prisma.userBook.deleteMany({ where: { bookId } });
    await prisma.book.delete({ where: { id: bookId } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

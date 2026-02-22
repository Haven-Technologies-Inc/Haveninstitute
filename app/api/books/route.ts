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
// GET /api/books - List books with filtering, sorting, pagination
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const requiredSubscription = searchParams.get('requiredSubscription');
    const featured = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isPublished: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (requiredSubscription) {
      where.requiredSubscription = requiredSubscription;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any;
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }];
        break;
      case 'az':
        orderBy = { title: 'asc' };
        break;
      case 'popular':
      default:
        orderBy = [{ downloadCount: 'desc' }, { ratingAvg: 'desc' }];
        break;
    }

    // Run count + find in parallel
    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // If user is authenticated, fetch their UserBook records for these books
    let userBooksMap: Record<string, any> = {};
    const session = await getAuthSession();

    if ((session?.user as any)?.id && books.length > 0) {
      const bookIds = books.map((b: any) => b.id);
      const userBooks = await prisma.userBook.findMany({
        where: {
          userId: (session!.user as any).id,
          bookId: { in: bookIds },
        },
      });
      userBooksMap = Object.fromEntries(userBooks.map((ub: any) => [ub.bookId, ub]));
    }

    // Attach user progress to each book
    const booksWithProgress = books.map((book: any) => ({
      ...book,
      ratingAvg: Number(book.ratingAvg),
      price: Number(book.price),
      userBook: userBooksMap[book.id]
        ? {
            currentPage: userBooksMap[book.id].currentPage,
            progressPercent: Number(userBooksMap[book.id].progressPercent),
            totalReadingTimeMinutes: userBooksMap[book.id].totalReadingTimeMinutes,
            lastReadAt: userBooksMap[book.id].lastReadAt,
            isBookmarked: userBooksMap[book.id].bookmarks !== null,
            isPurchased: userBooksMap[book.id].isPurchased,
            rating: userBooksMap[book.id].rating,
            review: userBooksMap[book.id].review,
          }
        : null,
    }));

    return successResponse({
      books: booksWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/books - Create a new book (admin only)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      title,
      author,
      description,
      isbn,
      coverUrl,
      fileUrl,
      fileType,
      pageCount,
      durationMinutes,
      category,
      tags,
      price,
      isFree,
      requiredSubscription,
      isPublished,
      isFeatured,
    } = body;

    if (!title) {
      return errorResponse('Title is required', 400);
    }

    const book = await prisma.book.create({
      data: {
        title,
        author: author || null,
        description: description || null,
        isbn: isbn || null,
        coverUrl: coverUrl || null,
        fileUrl: fileUrl || null,
        fileType: fileType || 'pdf',
        pageCount: pageCount ? parseInt(pageCount, 10) : null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        category: category || 'nclex_prep',
        tags: tags || null,
        price: price ? parseFloat(price) : 0.0,
        isFree: isFree !== undefined ? isFree : true,
        requiredSubscription: requiredSubscription || 'Free',
        isPublished: isPublished !== undefined ? isPublished : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
    });

    return successResponse(book, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

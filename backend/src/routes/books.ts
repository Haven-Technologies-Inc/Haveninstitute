import { Router } from 'express';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// CREATE BOOK (Admin only)
// ============================================================================

router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req: AuthRequest, res) => {
  const {
    title,
    author,
    description,
    coverUrl,
    fileUrl,
    category,
    totalPages,
    totalChapters,
    price,
  } = req.body;

  if (!title || !author) {
    throw new APIError('Title and author are required', 400);
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description: description || null,
      coverUrl: coverUrl || null,
      fileUrl: fileUrl || null,
      category: category || 'General',
      totalPages: totalPages || 0,
      totalChapters: totalChapters || 0,
      price: price || 0,
      isActive: true,
    },
  });

  res.status(201).json({
    message: 'Book created successfully',
    book,
  });
}));

// ============================================================================
// GET ALL BOOKS
// ============================================================================

router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { category, limit = '50', offset = '0' } = req.query;

  const where: any = { isActive: true };
  if (category) where.category = category as string;

  const books = await prisma.book.findMany({
    where,
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
    orderBy: { createdAt: 'desc' },
  });

  res.json({ books });
}));

// ============================================================================
// GET BOOK BY ID
// ============================================================================

router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    throw new APIError('Book not found', 404);
  }

  res.json({ book });
}));

// ============================================================================
// UPDATE READING PROGRESS
// ============================================================================

router.post('/:id/progress', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;
  const {
    currentChapter,
    currentPage,
    progress,
    timeSpent,
  } = req.body;

  // Get or create progress
  let bookProgress = await prisma.bookProgress.findUnique({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
  });

  const now = new Date();

  if (!bookProgress) {
    bookProgress = await prisma.bookProgress.create({
      data: {
        userId,
        bookId,
        currentChapter: currentChapter || 1,
        currentPage: currentPage || 1,
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        status: 'IN_PROGRESS',
        lastRead: now,
      },
    });
  } else {
    bookProgress = await prisma.bookProgress.update({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      data: {
        currentChapter: currentChapter ?? bookProgress.currentChapter,
        currentPage: currentPage ?? bookProgress.currentPage,
        progress: progress ?? bookProgress.progress,
        timeSpent: bookProgress.timeSpent + (timeSpent || 0),
        lastRead: now,
      },
    });
  }

  res.json({
    message: 'Reading progress updated',
    progress: bookProgress,
  });
}));

// ============================================================================
// GET READING PROGRESS
// ============================================================================

router.get('/:id/progress', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;

  const progress = await prisma.bookProgress.findUnique({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    include: {
      book: true,
    },
  });

  res.json({ progress });
}));

// ============================================================================
// MARK BOOK AS COMPLETED
// ============================================================================

router.post('/:id/complete', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;

  const progress = await prisma.bookProgress.update({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    data: {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
    },
  });

  res.json({
    message: 'Book marked as completed',
    progress,
  });
}));

// ============================================================================
// CREATE HIGHLIGHT
// ============================================================================

router.post('/:id/highlights', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;
  const { chapter, text, color, note } = req.body;

  if (!text) {
    throw new APIError('Highlighted text is required', 400);
  }

  const highlight = await prisma.highlight.create({
    data: {
      userId,
      bookId,
      chapter: chapter || null,
      text,
      color: color || 'yellow',
      note: note || null,
    },
  });

  res.status(201).json({
    message: 'Highlight created successfully',
    highlight,
  });
}));

// ============================================================================
// GET HIGHLIGHTS
// ============================================================================

router.get('/:id/highlights', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;
  const { chapter } = req.query;

  const where: any = {
    userId,
    bookId,
  };

  if (chapter) where.chapter = parseInt(chapter as string);

  const highlights = await prisma.highlight.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  res.json({ highlights });
}));

// ============================================================================
// UPDATE HIGHLIGHT
// ============================================================================

router.patch('/highlights/:highlightId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { highlightId } = req.params;
  const { color, note } = req.body;

  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId },
  });

  if (!highlight) {
    throw new APIError('Highlight not found', 404);
  }

  if (highlight.userId !== userId) {
    throw new APIError('Not authorized to update this highlight', 403);
  }

  const updatedHighlight = await prisma.highlight.update({
    where: { id: highlightId },
    data: {
      ...(color && { color }),
      ...(note !== undefined && { note }),
    },
  });

  res.json({
    message: 'Highlight updated successfully',
    highlight: updatedHighlight,
  });
}));

// ============================================================================
// DELETE HIGHLIGHT
// ============================================================================

router.delete('/highlights/:highlightId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { highlightId } = req.params;

  const highlight = await prisma.highlight.findUnique({
    where: { id: highlightId },
  });

  if (!highlight) {
    throw new APIError('Highlight not found', 404);
  }

  if (highlight.userId !== userId) {
    throw new APIError('Not authorized to delete this highlight', 403);
  }

  await prisma.highlight.delete({
    where: { id: highlightId },
  });

  res.json({ message: 'Highlight deleted successfully' });
}));

// ============================================================================
// CREATE BOOKMARK
// ============================================================================

router.post('/:id/bookmarks', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;
  const { chapter, page, note } = req.body;

  const bookmark = await prisma.bookmark.create({
    data: {
      userId,
      bookId,
      chapter: chapter || null,
      page: page || null,
      note: note || null,
    },
  });

  res.status(201).json({
    message: 'Bookmark created successfully',
    bookmark,
  });
}));

// ============================================================================
// GET BOOKMARKS
// ============================================================================

router.get('/:id/bookmarks', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id: bookId } = req.params;

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      bookId,
    },
    orderBy: [
      { chapter: 'asc' },
      { page: 'asc' },
    ],
  });

  res.json({ bookmarks });
}));

// ============================================================================
// DELETE BOOKMARK
// ============================================================================

router.delete('/bookmarks/:bookmarkId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { bookmarkId } = req.params;

  const bookmark = await prisma.bookmark.findUnique({
    where: { id: bookmarkId },
  });

  if (!bookmark) {
    throw new APIError('Bookmark not found', 404);
  }

  if (bookmark.userId !== userId) {
    throw new APIError('Not authorized to delete this bookmark', 403);
  }

  await prisma.bookmark.delete({
    where: { id: bookmarkId },
  });

  res.json({ message: 'Bookmark deleted successfully' });
}));

// ============================================================================
// GET USER READING STATS
// ============================================================================

router.get('/stats/reading', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const allProgress = await prisma.bookProgress.findMany({
    where: { userId },
  });

  const totalBooks = allProgress.length;
  const completedBooks = allProgress.filter(p => p.status === 'COMPLETED').length;
  const inProgressBooks = allProgress.filter(p => p.status === 'IN_PROGRESS').length;

  const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

  const averageProgress = totalBooks > 0
    ? allProgress.reduce((sum, p) => sum + p.progress, 0) / totalBooks
    : 0;

  const completionRate = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0;

  const averageTimePerBook = completedBooks > 0
    ? allProgress
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.timeSpent, 0) / completedBooks
    : 0;

  res.json({
    totalBooks,
    completedBooks,
    inProgressBooks,
    totalTimeSpent,
    averageProgress,
    completionRate,
    averageTimePerBook,
  });
}));

// ============================================================================
// GET READING STREAK
// ============================================================================

router.get('/stats/streak', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const progress = await prisma.bookProgress.findMany({
    where: { userId },
    orderBy: { lastRead: 'desc' },
  });

  if (progress.length === 0) {
    return res.json({ streak: 0 });
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const p of progress) {
    const lastReadDate = new Date(p.lastRead);
    lastReadDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
      if (daysDiff > streak) streak = daysDiff;
      currentDate = lastReadDate;
      streak++;
    } else if (daysDiff > streak + 1) {
      break;
    }
  }

  res.json({ streak });
}));

export default router;

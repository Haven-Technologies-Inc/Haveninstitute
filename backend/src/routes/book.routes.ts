/**
 * Book Routes
 * 
 * API routes for book management and reading progress
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/authenticate';
import { bookService } from '../services/book.service';
import { bookPurchaseService } from '../services/bookPurchase.service';
import { ResponseHandler } from '../utils/response';
import { BookCategory, BookFormat } from '../models/Book';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/books
 * @desc    Get all books with filtering
 * @access  Public
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, format, isFree, isPremiumOnly, search, page = '1', limit = '20', sortBy, sortOrder } = req.query;

    const result = await bookService.getBooks(
      {
        category: category as BookCategory,
        format: format as BookFormat,
        isFree: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
        isPremiumOnly: isPremiumOnly === 'true' ? true : isPremiumOnly === 'false' ? false : undefined,
        search: search as string,
      },
      {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'ASC' | 'DESC') || 'DESC',
      }
    );

    ResponseHandler.success(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/books/:id
 * @desc    Get single book by ID
 * @access  Public
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not found', 404);
    }
    ResponseHandler.success(res, book);
  } catch (error) {
    next(error);
  }
});

// ==================== AUTHENTICATED ROUTES ====================
router.use(authenticate);

/**
 * @route   GET /api/v1/books/user/library
 * @desc    Get user's library
 * @access  Private
 */
router.get('/user/library', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const library = await bookService.getUserLibrary(req.userId!);
    ResponseHandler.success(res, library);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/add-to-library
 * @desc    Add book to user's library
 * @access  Private
 */
router.post('/:id/add-to-library', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { purchased } = req.body;
    const userBook = await bookService.addToLibrary(req.userId!, req.params.id, purchased === true);
    ResponseHandler.success(res, userBook, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/progress
 * @desc    Update reading progress
 * @access  Private
 */
router.post('/:id/progress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPage, readingTimeMinutes } = req.body;

    if (currentPage === undefined || readingTimeMinutes === undefined) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'currentPage and readingTimeMinutes required', 400);
    }

    const userBook = await bookService.updateProgress(
      req.userId!,
      req.params.id,
      currentPage,
      readingTimeMinutes
    );

    if (!userBook) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not in library', 404);
    }

    ResponseHandler.success(res, userBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/highlights
 * @desc    Add highlight to book
 * @access  Private
 */
router.post('/:id/highlights', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, text, color } = req.body;

    if (!page || !text) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'page and text required', 400);
    }

    const userBook = await bookService.addHighlight(
      req.userId!,
      req.params.id,
      page,
      text,
      color || 'yellow'
    );

    if (!userBook) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not in library', 404);
    }

    ResponseHandler.success(res, userBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/books/:id/highlights/:index
 * @desc    Remove highlight from book
 * @access  Private
 */
router.delete('/:id/highlights/:index', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const success = await bookService.removeHighlight(
      req.userId!,
      req.params.id,
      parseInt(req.params.index)
    );

    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Highlight not found', 404);
    }

    ResponseHandler.success(res, { message: 'Highlight removed' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/bookmarks
 * @desc    Add bookmark to book
 * @access  Private
 */
router.post('/:id/bookmarks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, title } = req.body;

    if (!page) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'page required', 400);
    }

    const userBook = await bookService.addBookmark(
      req.userId!,
      req.params.id,
      page,
      title || `Page ${page}`
    );

    if (!userBook) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not in library', 404);
    }

    ResponseHandler.success(res, userBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/books/:id/bookmarks/:index
 * @desc    Remove bookmark from book
 * @access  Private
 */
router.delete('/:id/bookmarks/:index', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const success = await bookService.removeBookmark(
      req.userId!,
      req.params.id,
      parseInt(req.params.index)
    );

    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Bookmark not found', 404);
    }

    ResponseHandler.success(res, { message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/notes
 * @desc    Add note to book
 * @access  Private
 */
router.post('/:id/notes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, content } = req.body;

    if (!page || !content) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'page and content required', 400);
    }

    const userBook = await bookService.addNote(req.userId!, req.params.id, page, content);

    if (!userBook) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not in library', 404);
    }

    ResponseHandler.success(res, userBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/:id/rate
 * @desc    Rate and review book
 * @access  Private
 */
router.post('/:id/rate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Rating must be between 1 and 5', 400);
    }

    const success = await bookService.rateBook(req.userId!, req.params.id, rating, review);

    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not in library', 404);
    }

    ResponseHandler.success(res, { message: 'Rating submitted' });
  } catch (error) {
    next(error);
  }
});

// ==================== PURCHASE ROUTES ====================

/**
 * @route   POST /api/v1/books/:id/purchase
 * @desc    Create checkout session for book purchase
 * @access  Private
 */
router.post('/:id/purchase', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const bookId = req.params.id;
    const { successUrl, cancelUrl } = req.body;

    if (!successUrl || !cancelUrl) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'successUrl and cancelUrl are required', 400);
    }

    const result = await bookPurchaseService.createCheckoutSession(
      userId,
      bookId,
      successUrl,
      cancelUrl
    );

    if (!result.success) {
      return ResponseHandler.error(res, 'PAYMENT_ERROR', result.error || 'Failed to create checkout', 400);
    }

    ResponseHandler.success(res, {
      sessionId: result.sessionId,
      url: result.url
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/books/purchase/complete
 * @desc    Complete book purchase after checkout
 * @access  Private
 */
router.post('/purchase/complete', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'sessionId is required', 400);
    }

    const result = await bookPurchaseService.handlePurchaseComplete(sessionId);

    if (!result.success) {
      return ResponseHandler.error(res, 'PAYMENT_ERROR', result.error || 'Failed to complete purchase', 400);
    }

    ResponseHandler.success(res, { bookId: result.bookId, message: 'Purchase completed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/books/:id/access
 * @desc    Check if user has access to a book
 * @access  Private
 */
router.get('/:id/access', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hasAccess = await bookPurchaseService.hasAccess(req.userId!, req.params.id);
    ResponseHandler.success(res, { hasAccess });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/books/user/purchases
 * @desc    Get user's purchased books
 * @access  Private
 */
router.get('/user/purchases', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const purchases = await bookPurchaseService.getUserPurchases(req.userId!);
    ResponseHandler.success(res, purchases);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/books/user/purchase-history
 * @desc    Get user's book purchase history with receipts
 * @access  Private
 */
router.get('/user/purchase-history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await bookPurchaseService.getPurchaseHistory(req.userId!);
    ResponseHandler.success(res, history);
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/v1/books
 * @desc    Create new book (admin)
 * @access  Admin
 */
router.post('/', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const book = await bookService.createBook(req.body);
    ResponseHandler.success(res, book, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/books/:id
 * @desc    Update book (admin)
 * @access  Admin
 */
router.put('/:id', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    if (!book) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not found', 404);
    }
    ResponseHandler.success(res, book);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/books/:id
 * @desc    Delete book (admin)
 * @access  Admin
 */
router.delete('/:id', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { hard } = req.query;
    const success = await bookService.deleteBook(req.params.id, hard === 'true');
    if (!success) {
      return ResponseHandler.error(res, 'NOT_FOUND', 'Book not found', 404);
    }
    ResponseHandler.success(res, { message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/books/admin/stats
 * @desc    Get book statistics (admin)
 * @access  Admin
 */
router.get('/admin/stats', authorizeRole(['admin']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await bookService.getBookStats();
    ResponseHandler.success(res, stats);
  } catch (error) {
    next(error);
  }
});

export default router;

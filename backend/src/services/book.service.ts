/**
 * Book Service
 * 
 * Handles book management, reading progress, highlights, and bookmarks
 */

import { Op } from 'sequelize';
import { Book, UserBook, BookCategory, BookFormat } from '../models/Book';
import { User } from '../models/User';

export interface BookFilters {
  category?: BookCategory;
  format?: BookFormat;
  isFree?: boolean;
  isPremiumOnly?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class BookService {
  /**
   * Get all books with filtering and pagination
   */
  async getBooks(filters: BookFilters, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true };

    if (filters.category) where.category = filters.category;
    if (filters.format) where.format = filters.format;
    if (filters.isFree !== undefined) where.isFree = filters.isFree;
    if (filters.isPremiumOnly !== undefined) where.isPremiumOnly = filters.isPremiumOnly;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { author: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      books: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get a single book by ID
   */
  async getBookById(bookId: string): Promise<Book | null> {
    return Book.findByPk(bookId);
  }

  /**
   * Create a new book (admin)
   */
  async createBook(data: Partial<Book>): Promise<Book> {
    return Book.create(data as any);
  }

  /**
   * Update a book (admin)
   */
  async updateBook(bookId: string, data: Partial<Book>): Promise<Book | null> {
    const book = await Book.findByPk(bookId);
    if (!book) return null;
    await book.update(data);
    return book;
  }

  /**
   * Delete a book (admin)
   */
  async deleteBook(bookId: string, hard = false): Promise<boolean> {
    const book = await Book.findByPk(bookId);
    if (!book) return false;

    if (hard) {
      await book.destroy();
    } else {
      await book.update({ isActive: false });
    }
    return true;
  }

  /**
   * Get user's library (purchased/accessed books)
   */
  async getUserLibrary(userId: string): Promise<UserBook[]> {
    return UserBook.findAll({
      where: { userId },
      include: [{ model: Book }],
      order: [['lastReadAt', 'DESC']],
    });
  }

  /**
   * Add book to user's library
   */
  async addToLibrary(userId: string, bookId: string, purchased = false): Promise<UserBook> {
    const [userBook] = await UserBook.findOrCreate({
      where: { userId, bookId },
      defaults: { userId, bookId, isPurchased: purchased },
    });
    return userBook;
  }

  /**
   * Update reading progress
   */
  async updateProgress(
    userId: string,
    bookId: string,
    currentPage: number,
    readingTimeMinutes: number
  ): Promise<UserBook | null> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook) return null;

    const book = await Book.findByPk(bookId);
    const totalPages = book?.totalPages || 1;
    const progressPercent = Math.min((currentPage / totalPages) * 100, 100);

    await userBook.update({
      currentPage,
      progressPercent,
      totalReadingTimeMinutes: userBook.totalReadingTimeMinutes + readingTimeMinutes,
      lastReadAt: new Date(),
      completedAt: progressPercent >= 100 ? new Date() : null,
    });

    return userBook;
  }

  /**
   * Add highlight
   */
  async addHighlight(
    userId: string,
    bookId: string,
    page: number,
    text: string,
    color: string
  ): Promise<UserBook | null> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook) return null;

    const highlights = userBook.highlights || [];
    highlights.push({ page, text, color, createdAt: new Date() });

    await userBook.update({ highlights });
    return userBook;
  }

  /**
   * Remove highlight
   */
  async removeHighlight(userId: string, bookId: string, highlightIndex: number): Promise<boolean> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook || !userBook.highlights) return false;

    const highlights = [...userBook.highlights];
    if (highlightIndex >= 0 && highlightIndex < highlights.length) {
      highlights.splice(highlightIndex, 1);
      await userBook.update({ highlights });
      return true;
    }
    return false;
  }

  /**
   * Add bookmark
   */
  async addBookmark(
    userId: string,
    bookId: string,
    page: number,
    title: string
  ): Promise<UserBook | null> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook) return null;

    const bookmarks = userBook.bookmarks || [];
    bookmarks.push({ page, title, createdAt: new Date() });

    await userBook.update({ bookmarks });
    return userBook;
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, bookId: string, bookmarkIndex: number): Promise<boolean> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook || !userBook.bookmarks) return false;

    const bookmarks = [...userBook.bookmarks];
    if (bookmarkIndex >= 0 && bookmarkIndex < bookmarks.length) {
      bookmarks.splice(bookmarkIndex, 1);
      await userBook.update({ bookmarks });
      return true;
    }
    return false;
  }

  /**
   * Add note
   */
  async addNote(
    userId: string,
    bookId: string,
    page: number,
    content: string
  ): Promise<UserBook | null> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook) return null;

    const notes = userBook.notes || [];
    notes.push({ page, content, createdAt: new Date() });

    await userBook.update({ notes });
    return userBook;
  }

  /**
   * Rate book
   */
  async rateBook(userId: string, bookId: string, rating: number, review?: string): Promise<boolean> {
    const userBook = await UserBook.findOne({ where: { userId, bookId } });
    if (!userBook) return false;

    const hadRating = userBook.rating !== null;
    await userBook.update({ rating, review });

    // Update book's average rating
    const book = await Book.findByPk(bookId);
    if (book) {
      if (hadRating) {
        // Recalculate average
        const allRatings = await UserBook.findAll({
          where: { bookId, rating: { [Op.ne]: null } },
          attributes: ['rating'],
        });
        const sum = allRatings.reduce((acc, ub) => acc + (ub.rating || 0), 0);
        const avg = sum / allRatings.length;
        await book.update({ averageRating: avg });
      } else {
        // Add new rating
        const newCount = book.ratingCount + 1;
        const newAvg = ((book.averageRating * book.ratingCount) + rating) / newCount;
        await book.update({ averageRating: newAvg, ratingCount: newCount });
      }
    }

    return true;
  }

  /**
   * Get book statistics (admin)
   */
  async getBookStats() {
    const totalBooks = await Book.count({ where: { isActive: true } });
    const totalDownloads = await Book.sum('downloadCount');
    const byCategory = await Book.findAll({
      attributes: ['category', [Book.sequelize!.fn('COUNT', '*'), 'count']],
      where: { isActive: true },
      group: ['category'],
      raw: true,
    });
    const topRated = await Book.findAll({
      where: { isActive: true, ratingCount: { [Op.gte]: 5 } },
      order: [['averageRating', 'DESC']],
      limit: 10,
    });

    return {
      totalBooks,
      totalDownloads: totalDownloads || 0,
      byCategory,
      topRated,
    };
  }
}

export const bookService = new BookService();
export default bookService;

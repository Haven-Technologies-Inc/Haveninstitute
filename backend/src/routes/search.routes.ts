import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { sequelize } from '../config/database';

const router = Router();

interface SearchResult {
  id: string;
  type: 'user' | 'question' | 'book' | 'flashcard' | 'post' | 'study-group';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, any>;
}

/**
 * Global search endpoint
 * GET /api/v1/search?q=query&types=user,question&limit=10
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { q: query, types, limit = '10' } = req.query;
    const user = (req as any).user;
    const searchLimit = Math.min(parseInt(limit as string) || 10, 50);

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.json({
        success: true,
        data: { results: [], total: 0, query: query || '' }
      });
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;
    const allowedTypes = types ? (types as string).split(',') : null;
    const isAdmin = user?.role === 'admin';

    const results: SearchResult[] = [];

    // Search Users (admin only)
    if (isAdmin && (!allowedTypes || allowedTypes.includes('user'))) {
      const userResults = await pool.query(
        `SELECT id, name, email, role, subscription 
         FROM users 
         WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      userResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'user',
          title: row.name,
          subtitle: row.email,
          url: `/admin/users?id=${row.id}`,
          metadata: { role: row.role, subscription: row.subscription }
        });
      });
    }

    // Search Questions
    if (!allowedTypes || allowedTypes.includes('question')) {
      const questionResults = await pool.query(
        `SELECT id, question_text, category, difficulty 
         FROM questions 
         WHERE LOWER(question_text) LIKE $1 OR LOWER(category) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      questionResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'question',
          title: row.question_text.substring(0, 100) + (row.question_text.length > 100 ? '...' : ''),
          subtitle: `${row.category} • ${row.difficulty}`,
          url: isAdmin ? `/admin/questions/${row.id}` : `/app/practice/question/${row.id}`,
          metadata: { category: row.category, difficulty: row.difficulty }
        });
      });
    }

    // Search Books
    if (!allowedTypes || allowedTypes.includes('book')) {
      const bookResults = await pool.query(
        `SELECT id, title, author, category 
         FROM books 
         WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1 OR LOWER(category) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      bookResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'book',
          title: row.title,
          subtitle: `by ${row.author}`,
          url: `/app/books/${row.id}`,
          metadata: { author: row.author, category: row.category }
        });
      });
    }

    // Search Flashcard Decks
    if (!allowedTypes || allowedTypes.includes('flashcard')) {
      const flashcardResults = await pool.query(
        `SELECT id, name, description, category 
         FROM flashcard_decks 
         WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      flashcardResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'flashcard',
          title: row.name,
          subtitle: row.description?.substring(0, 60) || row.category,
          url: `/app/flashcards/${row.id}`,
          metadata: { category: row.category }
        });
      });
    }

    // Search Forum Posts (user only)
    if (!isAdmin && (!allowedTypes || allowedTypes.includes('post'))) {
      const postResults = await pool.query(
        `SELECT id, title, category 
         FROM forum_posts 
         WHERE LOWER(title) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      postResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'post',
          title: row.title,
          subtitle: row.category,
          url: `/app/forum/post/${row.id}`,
          metadata: { category: row.category }
        });
      });
    }

    // Search Study Groups (user only)
    if (!isAdmin && (!allowedTypes || allowedTypes.includes('study-group'))) {
      const groupResults = await pool.query(
        `SELECT id, name, description 
         FROM study_groups 
         WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
         LIMIT $2`,
        [searchTerm, Math.ceil(searchLimit / 4)]
      );

      groupResults.rows.forEach((row: any) => {
        results.push({
          id: row.id,
          type: 'study-group',
          title: row.name,
          subtitle: row.description?.substring(0, 60),
          url: `/app/groups/${row.id}`,
          metadata: {}
        });
      });
    }

    // Sort results by relevance (exact matches first)
    const lowerQuery = query.toLowerCase();
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      const bExact = b.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      return aExact - bExact;
    });

    // Limit total results
    const limitedResults = results.slice(0, searchLimit);

    res.json({
      success: true,
      data: {
        results: limitedResults,
        total: results.length,
        query
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

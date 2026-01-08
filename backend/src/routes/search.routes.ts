/**
 * Search API Routes
 * Global search functionality across all content types
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';

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
    const { q: query, types, limit = '20' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    const allowedTypes = types ? (types as string).split(',') : null;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    const perTypeLimit = Math.ceil(limitNum / 6); // Distribute across 6 types

    const results: SearchResult[] = [];
    const searchTerm = `%${query.trim().toLowerCase()}%`;

    // Search Users (admin only)
    if ((req as any).user?.role === 'admin' && (!allowedTypes || allowedTypes.includes('user'))) {
      try {
        const userResults = await sequelize.query(
          `SELECT id, name, email, role, subscription_tier as subscription
           FROM users
           WHERE LOWER(name) LIKE :searchTerm OR LOWER(email) LIKE :searchTerm
           LIMIT :limit`,
          {
            replacements: { searchTerm, limit: perTypeLimit },
            type: QueryTypes.SELECT
          }
        );

        userResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'user',
            title: row.name,
            subtitle: row.email,
            url: `/admin/users?id=${row.id}`,
            metadata: { role: row.role, subscription: row.subscription }
          });
        });
      } catch (err) {
        logger.warn('User search failed:', err);
      }
    }

    // Search Questions
    if (!allowedTypes || allowedTypes.includes('question')) {
      try {
        const questionResults = await sequelize.query(
          `SELECT id, question_text, category, difficulty
           FROM questions
           WHERE LOWER(question_text) LIKE :searchTerm OR LOWER(category) LIKE :searchTerm
           LIMIT :limit`,
          {
            replacements: { searchTerm, limit: perTypeLimit },
            type: QueryTypes.SELECT
          }
        );

        questionResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'question',
            title: row.question_text.substring(0, 100) + (row.question_text.length > 100 ? '...' : ''),
            subtitle: `${row.category} • ${row.difficulty}`,
            url: (req as any).user?.role === 'admin' ? `/admin/questions/${row.id}` : `/app/practice/question/${row.id}`,
            metadata: { category: row.category, difficulty: row.difficulty }
          });
        });
      } catch (err) {
        logger.warn('Question search failed:', err);
      }
    }

    // Search Books
    if (!allowedTypes || allowedTypes.includes('book')) {
      try {
        const bookResults = await sequelize.query(
          `SELECT id, title, author, description, category, cover_image_url
           FROM books
           WHERE LOWER(title) LIKE :searchTerm
              OR LOWER(author) LIKE :searchTerm
              OR LOWER(description) LIKE :searchTerm
           LIMIT :limit`,
          {
            replacements: { searchTerm, limit: perTypeLimit },
            type: QueryTypes.SELECT
          }
        );

        bookResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'book',
            title: row.title,
            subtitle: `by ${row.author} • ${row.category || 'General'}`,
            url: `/app/study/books/${row.id}`,
            metadata: {
              author: row.author,
              category: row.category,
              coverImage: row.cover_image_url
            }
          });
        });
      } catch (err) {
        logger.warn('Book search failed:', err);
      }
    }

    // Search Flashcards (search by deck name or card content)
    if (!allowedTypes || allowedTypes.includes('flashcard')) {
      try {
        const flashcardResults = await sequelize.query(
          `SELECT fd.id, fd.name as deck_name, fd.description, fd.category,
                  COUNT(f.id) as card_count
           FROM flashcard_decks fd
           LEFT JOIN flashcards f ON f.deck_id = fd.id
           WHERE LOWER(fd.name) LIKE :searchTerm
              OR LOWER(fd.description) LIKE :searchTerm
              OR LOWER(fd.category) LIKE :searchTerm
           GROUP BY fd.id
           LIMIT :limit`,
          {
            replacements: { searchTerm, limit: perTypeLimit },
            type: QueryTypes.SELECT
          }
        );

        flashcardResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'flashcard',
            title: row.deck_name,
            subtitle: `${row.card_count || 0} cards • ${row.category || 'General'}`,
            url: `/app/study/flashcards/${row.id}`,
            metadata: {
              description: row.description,
              category: row.category,
              cardCount: row.card_count
            }
          });
        });
      } catch (err) {
        logger.warn('Flashcard search failed:', err);
      }
    }

    // Search Discussion Posts
    if (!allowedTypes || allowedTypes.includes('post')) {
      try {
        const postResults = await sequelize.query(
          `SELECT dp.id, dp.title, dp.slug, dp.type, dp.status,
                  u.name as author_name, dp.view_count, dp.comment_count
           FROM discussion_posts dp
           LEFT JOIN users u ON u.id = dp.author_id
           WHERE (LOWER(dp.title) LIKE :searchTerm OR LOWER(dp.content) LIKE :searchTerm)
             AND dp.status != 'deleted'
           ORDER BY dp.created_at DESC
           LIMIT :limit`,
          {
            replacements: { searchTerm, limit: perTypeLimit },
            type: QueryTypes.SELECT
          }
        );

        postResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'post',
            title: row.title,
            subtitle: `by ${row.author_name || 'Anonymous'} • ${row.view_count || 0} views • ${row.comment_count || 0} comments`,
            url: `/app/discussions/${row.slug}`,
            metadata: {
              type: row.type,
              status: row.status,
              author: row.author_name
            }
          });
        });
      } catch (err) {
        logger.warn('Post search failed:', err);
      }
    }

    // Search Study Groups
    if (!allowedTypes || allowedTypes.includes('study-group')) {
      try {
        const groupResults = await sequelize.query(
          `SELECT sg.id, sg.name, sg.description, sg.is_private,
                  COUNT(gm.id) as member_count
           FROM study_groups sg
           LEFT JOIN group_members gm ON gm.group_id = sg.id
           WHERE (LOWER(sg.name) LIKE :searchTerm OR LOWER(sg.description) LIKE :searchTerm)
             AND (sg.is_private = false OR sg.created_by = :userId)
           GROUP BY sg.id
           LIMIT :limit`,
          {
            replacements: {
              searchTerm,
              limit: perTypeLimit,
              userId: (req as any).user?.id || ''
            },
            type: QueryTypes.SELECT
          }
        );

        groupResults.forEach((row: any) => {
          results.push({
            id: row.id,
            type: 'study-group',
            title: row.name,
            subtitle: `${row.member_count || 0} members${row.is_private ? ' • Private' : ''}`,
            url: `/app/community/groups/${row.id}`,
            metadata: {
              description: row.description,
              isPrivate: row.is_private,
              memberCount: row.member_count
            }
          });
        });
      } catch (err) {
        logger.warn('Study group search failed:', err);
      }
    }

    // Sort by relevance (simple implementation)
    results.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact match first
      if (aLower === queryLower && bLower !== queryLower) return -1;
      if (bLower === queryLower && aLower !== queryLower) return 1;

      // Starts with query second
      const aStartsWith = aLower.startsWith(queryLower);
      const bStartsWith = bLower.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Shorter titles preferred (more relevant)
      return a.title.length - b.title.length;
    });

    // Limit results
    const finalResults = results.slice(0, limitNum);

    res.json({
      success: true,
      data: {
        results: finalResults,
        total: results.length,
        query,
        types: allowedTypes || ['all']
      }
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Search failed' }
    });
  }
});

/**
 * Search suggestions/autocomplete
 * GET /api/v1/search/suggest?q=query
 */
router.get('/suggest', authenticate, async (req: Request, res: Response) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = `${query.trim().toLowerCase()}%`;
    const suggestions: string[] = [];

    // Get question suggestions
    try {
      const questionSuggestions = await sequelize.query(
        `SELECT DISTINCT LEFT(question_text, 50) as suggestion
         FROM questions
         WHERE LOWER(question_text) LIKE :searchTerm
         LIMIT 5`,
        {
          replacements: { searchTerm },
          type: QueryTypes.SELECT
        }
      );
      questionSuggestions.forEach((row: any) => suggestions.push(row.suggestion));
    } catch (err) {
      // Ignore
    }

    // Get book title suggestions
    try {
      const bookSuggestions = await sequelize.query(
        `SELECT DISTINCT title as suggestion
         FROM books
         WHERE LOWER(title) LIKE :searchTerm
         LIMIT 3`,
        {
          replacements: { searchTerm },
          type: QueryTypes.SELECT
        }
      );
      bookSuggestions.forEach((row: any) => suggestions.push(row.suggestion));
    } catch (err) {
      // Ignore
    }

    // Get discussion post title suggestions
    try {
      const postSuggestions = await sequelize.query(
        `SELECT DISTINCT title as suggestion
         FROM discussion_posts
         WHERE LOWER(title) LIKE :searchTerm AND status != 'deleted'
         LIMIT 3`,
        {
          replacements: { searchTerm },
          type: QueryTypes.SELECT
        }
      );
      postSuggestions.forEach((row: any) => suggestions.push(row.suggestion));
    } catch (err) {
      // Ignore
    }

    res.json({
      success: true,
      data: {
        suggestions: [...new Set(suggestions)].slice(0, 10) // Deduplicate and limit
      }
    });
  } catch (error) {
    logger.error('Search suggest error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Search suggestions failed' }
    });
  }
});

export default router;

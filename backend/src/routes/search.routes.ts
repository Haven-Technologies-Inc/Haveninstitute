/**
 * Search API Routes
 * Global search functionality across all content types
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

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

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    const allowedTypes = types ? (types as string).split(',') : null;

    const results: SearchResult[] = [];

    // Search Users (admin only)
    if ((req as any).user?.role === 'admin' && (!allowedTypes || allowedTypes.includes('user'))) {
      const userResults = await sequelize.query(
        `SELECT id, name, email, role, subscription 
         FROM users 
         WHERE LOWER(name) LIKE :searchTerm OR LOWER(email) LIKE :searchTerm
         LIMIT :limit`,
        {
          replacements: { 
            searchTerm: `%${query.trim().toLowerCase()}%`, 
            limit: Math.ceil(parseInt(limit as string) / 4) 
          },
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
    }

    // Search Questions
    if (!allowedTypes || allowedTypes.includes('question')) {
      const questionResults = await sequelize.query(
        `SELECT id, question_text, category, difficulty 
         FROM questions 
         WHERE LOWER(question_text) LIKE :searchTerm OR LOWER(category) LIKE :searchTerm
         LIMIT :limit`,
        {
          replacements: { 
            searchTerm: `%${query.trim().toLowerCase()}%`, 
            limit: Math.ceil(parseInt(limit as string) / 4) 
          },
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
    }

    // TODO: Implement other search types (books, flashcards, posts, study-groups)
    // These are temporarily disabled to get backend running

    // Sort by relevance (simple implementation)
    results.sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const queryLower = query.toLowerCase();
      
      const aStartsWith = aLower.startsWith(queryLower);
      const bStartsWith = bLower.startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.title.length - b.title.length;
    });

    // Limit results
    const finalResults = results.slice(0, parseInt(limit as string));

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
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Search failed' }
    });
  }
});

export default router;

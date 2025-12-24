/**
 * Forum Controller - API endpoints for discussion forum
 */

import { Request, Response, NextFunction } from 'express';
import { forumService } from '../services/forum.service';

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export class ForumController {
  /**
   * Get all categories
   * GET /api/v1/forum/categories
   */
  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await forumService.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get category by slug
   * GET /api/v1/forum/categories/:slug
   */
  async getCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await forumService.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get posts with filtering
   * GET /api/v1/forum/posts
   */
  async getPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        categoryId,
        type,
        status,
        authorId,
        search,
        tags,
        sortBy,
        limit,
        offset
      } = req.query;

      const result = await forumService.getPosts({
        categoryId: categoryId as string,
        type: type as string,
        status: status as string,
        authorId: authorId as string,
        search: search as string,
        tags: tags ? (tags as string).split(',') : undefined,
        sortBy: sortBy as 'latest' | 'popular' | 'active',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get single post
   * GET /api/v1/forum/posts/:identifier
   */
  async getPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.params;
      const post = await forumService.getPost(identifier, req.userId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Create post
   * POST /api/v1/forum/posts
   */
  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const post = await forumService.createPost(userId, req.body);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update post
   * PUT /api/v1/forum/posts/:id
   */
  async updatePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const isAdmin = req.userRole === 'admin';
      const post = await forumService.updatePost(id, userId, req.body, isAdmin);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete post
   * DELETE /api/v1/forum/posts/:id
   */
  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const isAdmin = req.userRole === 'admin';
      await forumService.deletePost(id, userId, isAdmin);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Create comment
   * POST /api/v1/forum/posts/:postId/comments
   */
  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const comment = await forumService.createComment(userId, {
        postId,
        ...req.body
      });
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update comment
   * PUT /api/v1/forum/comments/:id
   */
  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const comment = await forumService.updateComment(id, userId, content);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete comment
   * DELETE /api/v1/forum/comments/:id
   */
  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const isAdmin = req.userRole === 'admin';
      await forumService.deleteComment(id, userId, isAdmin);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Accept answer
   * POST /api/v1/forum/posts/:postId/accept/:commentId
   */
  async acceptAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId, commentId } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const post = await forumService.acceptAnswer(postId, commentId, userId);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Toggle reaction
   * POST /api/v1/forum/reactions
   */
  async toggleReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, postId, commentId } = req.body;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const result = await forumService.toggleReaction(userId, type, postId, commentId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Toggle bookmark
   * POST /api/v1/forum/bookmarks/:postId
   */
  async toggleBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const isBookmarked = await forumService.toggleBookmark(userId, postId);
      res.json({ isBookmarked });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get bookmarks
   * GET /api/v1/forum/bookmarks
   */
  async getBookmarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const posts = await forumService.getBookmarks(userId);
      res.json(posts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get trending tags
   * GET /api/v1/forum/tags/trending
   */
  async getTrendingTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tags = await forumService.getTrendingTags(limit);
      res.json(tags);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Search posts
   * GET /api/v1/forum/search
   */
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q, limit, offset } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query required' });
      }

      const result = await forumService.search(q as string, {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const forumController = new ForumController();
export default forumController;

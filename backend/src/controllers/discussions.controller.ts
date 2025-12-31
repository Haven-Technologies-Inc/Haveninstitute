/**
 * Discussions Controller
 * Handles all discussion-related HTTP requests
 */

import { Request, Response } from 'express';
import { discussionsService } from '../services/discussions.service';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const discussionsController = {
  // ============= CATEGORIES =============

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await discussionsService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await discussionsService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const category = await discussionsService.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  // ============= POSTS =============

  async getPosts(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, categoryId, type, status, sort = 'latest', search, tags, authorId } = req.query;
      
      const result = await discussionsService.getPosts({
        page: Number(page),
        limit: Math.min(Number(limit), 50),
        categoryId: categoryId as string,
        type: type as string,
        status: status as string,
        sort: sort as string,
        search: search as string,
        tags: tags ? (tags as string).split(',') : undefined,
        authorId: authorId as string,
        userId: req.user?.id,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  async getPostById(req: AuthRequest, res: Response) {
    try {
      const post = await discussionsService.getPostById(req.params.id, req.user?.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  },

  async getPostBySlug(req: AuthRequest, res: Response) {
    try {
      const post = await discussionsService.getPostBySlug(req.params.slug, req.user?.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  },

  async createPost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { title, content, type, categoryId, tags, nclexTopics } = req.body;
      
      if (!title || !content || !type || !categoryId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const post = await discussionsService.createPost({
        title, content, type, categoryId, tags, nclexTopics,
        authorId: req.user.id,
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  },

  async updatePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const post = await discussionsService.updatePost(req.params.id, req.body, req.user.id, req.user.role);
      res.json(post);
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: 'Not authorized to edit this post' });
      }
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  },

  async deletePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      await discussionsService.deletePost(req.params.id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  },

  async incrementViewCount(req: Request, res: Response) {
    try {
      await discussionsService.incrementViewCount(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error incrementing view count:', error);
      res.status(500).json({ error: 'Failed to increment view count' });
    }
  },

  async togglePostReaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { type } = req.body;
      const result = await discussionsService.toggleReaction(req.params.id, 'post', type, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  },

  async togglePin(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const { isPinned } = req.body;
      const post = await discussionsService.togglePin(req.params.id, isPinned);
      res.json(post);
    } catch (error) {
      console.error('Error toggling pin:', error);
      res.status(500).json({ error: 'Failed to toggle pin' });
    }
  },

  async toggleLock(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const { isLocked } = req.body;
      const post = await discussionsService.toggleLock(req.params.id, isLocked);
      res.json(post);
    } catch (error) {
      console.error('Error toggling lock:', error);
      res.status(500).json({ error: 'Failed to toggle lock' });
    }
  },

  async markResolved(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const post = await discussionsService.markResolved(req.params.id, req.user.id);
      res.json(post);
    } catch (error) {
      console.error('Error marking resolved:', error);
      res.status(500).json({ error: 'Failed to mark resolved' });
    }
  },

  async getRelatedPosts(req: Request, res: Response) {
    try {
      const limit = Math.min(Number(req.query.limit) || 5, 10);
      const posts = await discussionsService.getRelatedPosts(req.params.id, limit);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      res.status(500).json({ error: 'Failed to fetch related posts' });
    }
  },

  // ============= COMMENTS =============

  async getCommentsByPost(req: Request, res: Response) {
    try {
      const comments = await discussionsService.getCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  },

  async createComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { postId, content, parentId } = req.body;
      
      if (!postId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const comment = await discussionsService.createComment({
        postId, content, parentId,
        authorId: req.user.id,
        isInstructor: req.user.role === 'instructor',
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  },

  async updateComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { content } = req.body;
      const comment = await discussionsService.updateComment(req.params.id, content, req.user.id);
      res.json(comment);
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: 'Not authorized to edit this comment' });
      }
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  },

  async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      await discussionsService.deleteComment(req.params.id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  },

  async toggleCommentReaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { type } = req.body;
      const result = await discussionsService.toggleReaction(req.params.id, 'comment', type, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  },

  async acceptAnswer(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const comment = await discussionsService.acceptAnswer(req.params.id, req.user.id);
      res.json(comment);
    } catch (error: any) {
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: 'Only the post author can accept answers' });
      }
      console.error('Error accepting answer:', error);
      res.status(500).json({ error: 'Failed to accept answer' });
    }
  },

  // ============= BOOKMARKS =============

  async getBookmarks(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const bookmarks = await discussionsService.getBookmarks(req.user.id);
      res.json(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  },

  async toggleBookmark(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { postId } = req.body;
      const result = await discussionsService.toggleBookmark(req.user.id, postId);
      res.json(result);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
  },

  async updateBookmarkNotes(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { notes } = req.body;
      const bookmark = await discussionsService.updateBookmarkNotes(req.user.id, req.params.postId, notes);
      res.json(bookmark);
    } catch (error) {
      console.error('Error updating bookmark notes:', error);
      res.status(500).json({ error: 'Failed to update bookmark notes' });
    }
  },

  // ============= TAGS =============

  async getTrendingTags(req: Request, res: Response) {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const tags = await discussionsService.getTrendingTags(limit);
      res.json(tags);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      res.status(500).json({ error: 'Failed to fetch trending tags' });
    }
  },

  async searchTags(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json([]);
      }
      const tags = await discussionsService.searchTags(q as string);
      res.json(tags);
    } catch (error) {
      console.error('Error searching tags:', error);
      res.status(500).json({ error: 'Failed to search tags' });
    }
  },

  async getTagsByCategory(req: Request, res: Response) {
    try {
      const tags = await discussionsService.getTagsByCategory(req.params.categoryId);
      res.json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  },

  // ============= SEARCH =============

  async search(req: AuthRequest, res: Response) {
    try {
      const { query, categoryId, type, status, tags, authorId, dateFrom, dateTo, hasAcceptedAnswer, isUnanswered, page = 1, limit = 20 } = req.body;
      
      const result = await discussionsService.search({
        query, categoryId, type, status, tags, authorId, dateFrom, dateTo, hasAcceptedAnswer, isUnanswered,
        page: Number(page),
        limit: Math.min(Number(limit), 50),
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  },

  async searchSuggest(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || (q as string).length < 2) {
        return res.json({ posts: [], tags: [] });
      }
      const suggestions = await discussionsService.searchSuggest(q as string);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  },

  // ============= ANALYTICS =============

  async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await discussionsService.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  async trackEvent(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { event, data } = req.body;
      await discussionsService.trackEvent(req.user.id, event, data);
      res.status(204).send();
    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  },

  // ============= USER ACTIVITY =============

  async getMyPosts(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { page = 1, limit = 20 } = req.query;
      const result = await discussionsService.getPostsByAuthor(req.user.id, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      console.error('Error fetching my posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  async getMyComments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { page = 1, limit = 20 } = req.query;
      const result = await discussionsService.getCommentsByAuthor(req.user.id, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      console.error('Error fetching my comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  },

  async getMyBookmarks(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const bookmarks = await discussionsService.getBookmarks(req.user.id);
      res.json(bookmarks);
    } catch (error) {
      console.error('Error fetching my bookmarks:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  },
};

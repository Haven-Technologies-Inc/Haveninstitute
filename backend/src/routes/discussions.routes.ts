/**
 * Discussions API Routes
 * RESTful endpoints for the Discussions feature
 */

import { Router } from 'express';
import { discussionsController } from '../controllers/discussions.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// ============= CATEGORIES =============

router.get('/categories', discussionsController.getCategories);
router.get('/categories/:id', discussionsController.getCategoryById);
router.get('/categories/slug/:slug', discussionsController.getCategoryBySlug);

// ============= POSTS =============

// Public routes (with optional auth for personalization)
router.get('/posts', optionalAuth, discussionsController.getPosts);
router.get('/posts/:id', optionalAuth, discussionsController.getPostById);
router.get('/posts/slug/:slug', optionalAuth, discussionsController.getPostBySlug);
router.get('/posts/:id/related', discussionsController.getRelatedPosts);

// Protected routes
router.post('/posts', authenticate, rateLimit({ max: 10, windowMs: 60000 }), discussionsController.createPost);
router.put('/posts/:id', authenticate, discussionsController.updatePost);
router.delete('/posts/:id', authenticate, discussionsController.deletePost);

// Post actions
router.post('/posts/:id/view', optionalAuth, discussionsController.incrementViewCount);
router.post('/posts/:id/reactions', authenticate, discussionsController.togglePostReaction);
router.put('/posts/:id/pin', authenticate, discussionsController.togglePin);
router.put('/posts/:id/lock', authenticate, discussionsController.toggleLock);
router.put('/posts/:id/resolve', authenticate, discussionsController.markResolved);

// ============= COMMENTS =============

router.get('/posts/:postId/comments', discussionsController.getCommentsByPost);
router.post('/comments', authenticate, rateLimit({ max: 30, windowMs: 60000 }), discussionsController.createComment);
router.put('/comments/:id', authenticate, discussionsController.updateComment);
router.delete('/comments/:id', authenticate, discussionsController.deleteComment);
router.post('/comments/:id/reactions', authenticate, discussionsController.toggleCommentReaction);
router.put('/comments/:id/accept', authenticate, discussionsController.acceptAnswer);

// ============= BOOKMARKS =============

router.get('/bookmarks', authenticate, discussionsController.getBookmarks);
router.post('/bookmarks', authenticate, discussionsController.toggleBookmark);
router.put('/bookmarks/:postId/notes', authenticate, discussionsController.updateBookmarkNotes);

// ============= TAGS =============

router.get('/tags/trending', discussionsController.getTrendingTags);
router.get('/tags/search', discussionsController.searchTags);
router.get('/tags/category/:categoryId', discussionsController.getTagsByCategory);

// ============= SEARCH =============

router.post('/search', optionalAuth, discussionsController.search);
router.get('/search/suggest', discussionsController.searchSuggest);

// ============= ANALYTICS =============

router.get('/analytics', discussionsController.getAnalytics);
router.post('/analytics/events', authenticate, discussionsController.trackEvent);

// ============= USER ACTIVITY =============

router.get('/me/posts', authenticate, discussionsController.getMyPosts);
router.get('/me/comments', authenticate, discussionsController.getMyComments);
router.get('/me/bookmarks', authenticate, discussionsController.getMyBookmarks);

export default router;

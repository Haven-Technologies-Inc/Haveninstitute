/**
 * Forum Routes - API endpoints for discussion forum
 */

import { Router } from 'express';
import { forumController } from '../controllers/forum.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public routes (read-only)
router.get('/categories', (req, res, next) => forumController.getCategories(req, res, next));
router.get('/categories/:slug', (req, res, next) => forumController.getCategory(req, res, next));
router.get('/posts', (req, res, next) => forumController.getPosts(req, res, next));
router.get('/posts/:identifier', (req, res, next) => forumController.getPost(req, res, next));
router.get('/tags/trending', (req, res, next) => forumController.getTrendingTags(req, res, next));
router.get('/search', (req, res, next) => forumController.search(req, res, next));

// Protected routes
router.use(authenticate);

// Posts
router.post('/posts', (req, res, next) => forumController.createPost(req, res, next));
router.put('/posts/:id', (req, res, next) => forumController.updatePost(req, res, next));
router.delete('/posts/:id', (req, res, next) => forumController.deletePost(req, res, next));

// Comments
router.post('/posts/:postId/comments', (req, res, next) => forumController.createComment(req, res, next));
router.put('/comments/:id', (req, res, next) => forumController.updateComment(req, res, next));
router.delete('/comments/:id', (req, res, next) => forumController.deleteComment(req, res, next));

// Accept answer
router.post('/posts/:postId/accept/:commentId', (req, res, next) => forumController.acceptAnswer(req, res, next));

// Reactions
router.post('/reactions', (req, res, next) => forumController.toggleReaction(req, res, next));

// Bookmarks
router.get('/bookmarks', (req, res, next) => forumController.getBookmarks(req, res, next));
router.post('/bookmarks/:postId', (req, res, next) => forumController.toggleBookmark(req, res, next));

export default router;

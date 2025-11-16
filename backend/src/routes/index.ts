import { Router } from 'express';
import authRoutes from './auth.routes';
// Import other routes as they are created
// import userRoutes from './user.routes';
// import quizRoutes from './quiz.routes';
// import questionRoutes from './question.routes';
// import subscriptionRoutes from './subscription.routes';
// import flashcardRoutes from './flashcard.routes';
// import bookRoutes from './book.routes';
// import forumRoutes from './forum.routes';
// import analyticsRoutes from './analytics.routes';
// import aiRoutes from './ai.routes';
// import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    }
  });
});

// API routes
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/quiz', quizRoutes);
// router.use('/questions', questionRoutes);
// router.use('/subscriptions', subscriptionRoutes);
// router.use('/flashcards', flashcardRoutes);
// router.use('/books', bookRoutes);
// router.use('/forum', forumRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/ai', aiRoutes);
// router.use('/admin', adminRoutes);

export default router;

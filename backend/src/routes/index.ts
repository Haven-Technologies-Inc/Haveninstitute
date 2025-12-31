import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import catRoutes from './cat.routes';
import quizRoutes from './quiz.routes';
import analyticsRoutes from './analytics.routes';
import aiRoutes from './ai.routes';
import studyGroupRoutes from './studyGroup.routes';
import studyPlannerRoutes from './studyPlanner.routes';
import questionRoutes from './question.routes';
import studyMaterialRoutes from './studyMaterial.routes';
import flashcardRoutes from './flashcard.routes';
import practiceRoutes from './practice.routes';
import settingsRoutes from './settings.routes';
import subscriptionRoutes from './subscription.routes';
// Additional routes
import notificationRoutes from './notification.routes';
import uploadRoutes from './upload.routes';
import gamificationRoutes from './gamification.routes';
import bookRoutes from './book.routes';
import progressRoutes from './progress.routes';
import oauthRoutes from './oauth.routes';
import mfaRoutes from './mfa.routes';
import securityRoutes from './security.routes';
import systemSettingsRoutes from './systemSettings.routes';
// import searchRoutes from './search.routes'; // Temporarily disabled - needs fixing
// import stripeRoutes from './stripe.routes'; // Temporarily disabled - needs fixing
// import discussionsRoutes from './discussions.routes'; // Temporarily disabled - needs fixing

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
router.use('/admin', adminRoutes);
router.use('/cat', catRoutes);
router.use('/quiz', quizRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/study-groups', studyGroupRoutes);
// router.use('/discussions', discussionsRoutes); // Temporarily disabled
router.use('/planner', studyPlannerRoutes);
router.use('/questions', questionRoutes);
router.use('/materials', studyMaterialRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/practice', practiceRoutes);
router.use('/settings', settingsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/books', bookRoutes);
router.use('/progress', progressRoutes);
router.use('/oauth', oauthRoutes);
router.use('/mfa', mfaRoutes);
router.use('/security', securityRoutes);
router.use('/admin/settings', systemSettingsRoutes);
// router.use('/search', searchRoutes); // Temporarily disabled
// router.use('/stripe', stripeRoutes); // Temporarily disabled

export default router;

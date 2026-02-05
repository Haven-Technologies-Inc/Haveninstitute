import { Router } from 'express';
import authRoutes from './auth.routes';
import catRoutes from './cat.routes';
import questionRoutes from './question.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';
import docsRoutes from './docs.routes.simple';
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
import backupRoutes from './backup.routes';
import searchRoutes from './search.routes';
import stripeRoutes from './stripe.routes';
import discussionsRoutes from './discussions.routes';
import aiRoutes from './ai.routes';
// Previously missing routes
import quizRoutes from './quiz.routes';
import studyGroupRoutes from './studyGroup.routes';
import studyPlannerRoutes from './studyPlanner.routes';
import studyMaterialRoutes from './studyMaterial.routes';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';

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
router.use('/docs', docsRoutes);
router.use('/admin', adminRoutes);
router.use('/cat', catRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/questions', questionRoutes);
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
router.use('/admin/backup', backupRoutes);
router.use('/search', searchRoutes);
router.use('/stripe', stripeRoutes);
router.use('/discussions', discussionsRoutes);
router.use('/ai', aiRoutes);
// Previously missing route registrations
router.use('/quiz', quizRoutes);
router.use('/study-groups', studyGroupRoutes);
router.use('/planner', studyPlannerRoutes);
router.use('/study-materials', studyMaterialRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;

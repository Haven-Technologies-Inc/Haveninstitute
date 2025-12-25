import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { ResponseHandler } from '../utils/response';
import { gamificationService } from '../services/gamification.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user stats
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const stats = await gamificationService.getUserStats(userId);
    const levelProgress = gamificationService.pointsToNextLevel(stats.totalPoints);
    
    ResponseHandler.success(res, {
      ...stats,
      levelProgress,
    });
  } catch (error) {
    next(error);
  }
});

// Get user achievements
router.get('/achievements', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const achievements = await gamificationService.getUserAchievements(userId);
    ResponseHandler.success(res, achievements);
  } catch (error) {
    next(error);
  }
});

// Check for new achievements
router.post('/check-achievements', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const newAchievements = await gamificationService.checkAchievements(userId);
    ResponseHandler.success(res, { newAchievements });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = 'all', limit = '50' } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(
      period as 'all' | 'monthly' | 'weekly',
      parseInt(limit as string)
    );
    ResponseHandler.success(res, leaderboard);
  } catch (error) {
    next(error);
  }
});

// Get user rank
router.get('/rank', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const stats = await gamificationService.getUserStats(userId);
    const rank = await gamificationService.getUserRank(userId);
    
    ResponseHandler.success(res, { 
      rank, 
      totalPoints: stats.totalPoints, 
      level: stats.level 
    });
  } catch (error) {
    next(error);
  }
});

// Get study streak
router.get('/streak', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const streak = await gamificationService.calculateStreak(userId);
    ResponseHandler.success(res, { streak });
  } catch (error) {
    next(error);
  }
});

// Award points (internal use - for other services to call)
router.post('/award-points', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { action, metadata } = req.body;
    
    if (!action) {
      return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Action is required', 400);
    }
    
    const points = await gamificationService.awardPoints(userId, action, metadata);
    ResponseHandler.success(res, { pointsAwarded: points });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  userId?: string;
}

export class AnalyticsController {
  /**
   * Get complete dashboard data
   * GET /api/v1/analytics/dashboard
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getDashboard(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user stats
   * GET /api/v1/analytics/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getStats(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get confidence trend
   * GET /api/v1/analytics/confidence-trend
   */
  async getConfidenceTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const days = parseInt(req.query.days as string) || 30;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getConfidenceTrend(userId, days);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category performance
   * GET /api/v1/analytics/category-performance
   */
  async getCategoryPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getCategoryPerformance(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get weekly activity
   * GET /api/v1/analytics/weekly-activity
   */
  async getWeeklyActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getWeeklyActivity(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activity
   * GET /api/v1/analytics/activity
   */
  async getRecentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getRecentActivity(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get study streak
   * GET /api/v1/analytics/streak
   */
  async getStreak(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getStreak(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get study goals
   * GET /api/v1/analytics/goals
   */
  async getGoals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.getGoals(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a study goal
   * POST /api/v1/analytics/goals
   */
  async createGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, type, period, target } = req.body;
      if (!title || !type || !target) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const result = await analyticsService.createGoal(userId, {
        title,
        type,
        period: period || 'daily',
        target
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a study goal
   * PUT /api/v1/analytics/goals/:goalId
   */
  async updateGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { goalId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await analyticsService.updateGoal(goalId, userId, req.body);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Goal not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Delete a study goal
   * DELETE /api/v1/analytics/goals/:goalId
   */
  async deleteGoal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { goalId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await analyticsService.deleteGoal(goalId, userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Goal not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
export default analyticsController;

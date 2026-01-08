/**
 * Study Planner Controller - API endpoints for study planning
 */

import { Request, Response, NextFunction } from 'express';
import { studyPlannerService } from '../services/studyPlanner.service';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  userId?: string;
}

export class StudyPlannerController {
  /**
   * Create a new study plan
   * POST /api/v1/planner/plans
   */
  async createPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      logger.debug('Creating study plan with data:', JSON.stringify(req.body, null, 2));

      // Convert targetDate string to Date object
      const planData = {
        ...req.body,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined
      };

      const plan = await studyPlannerService.createPlan(userId, planData);
      res.status(201).json(plan);
    } catch (error: any) {
      logger.error('Failed to create study plan:', error);
      res.status(400).json({ message: error.message || 'Failed to create study plan' });
    }
  }

  /**
   * Generate AI study plan
   * POST /api/v1/planner/plans/:id/generate
   */
  async generateAIPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const plan = await studyPlannerService.generateAIPlan(id, userId);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get user's study plans
   * GET /api/v1/planner/plans
   */
  async getPlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { status } = req.query;
      const plans = await studyPlannerService.getUserPlans(userId, status as string);
      res.json(plans);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get a specific study plan
   * GET /api/v1/planner/plans/:id
   */
  async getPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const plan = await studyPlannerService.getPlan(id, userId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update study plan
   * PUT /api/v1/planner/plans/:id
   */
  async updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const plan = await studyPlannerService.updatePlan(id, userId, req.body);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete study plan
   * DELETE /api/v1/planner/plans/:id
   */
  async deletePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await studyPlannerService.deletePlan(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Add task to plan
   * POST /api/v1/planner/plans/:id/tasks
   */
  async addTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const task = await studyPlannerService.addTask(userId, {
        planId: id,
        ...req.body
      });
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update task
   * PUT /api/v1/planner/tasks/:id
   */
  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const task = await studyPlannerService.updateTask(id, userId, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete task
   * DELETE /api/v1/planner/tasks/:id
   */
  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await studyPlannerService.deleteTask(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get today's tasks
   * GET /api/v1/planner/tasks/today
   */
  async getTodaysTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const tasks = await studyPlannerService.getTodaysTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get upcoming tasks
   * GET /api/v1/planner/tasks/upcoming
   */
  async getUpcomingTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const tasks = await studyPlannerService.getUpcomingTasks(userId, days);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get overdue tasks
   * GET /api/v1/planner/tasks/overdue
   */
  async getOverdueTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const tasks = await studyPlannerService.getOverdueTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get tasks for a specific date
   * GET /api/v1/planner/tasks/date/:date
   */
  async getTasksForDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const tasks = await studyPlannerService.getTasksForDate(userId, new Date(date));
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Reschedule task
   * POST /api/v1/planner/tasks/:id/reschedule
   */
  async rescheduleTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newDate } = req.body;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const task = await studyPlannerService.rescheduleTask(id, userId, new Date(newDate));
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Complete task
   * POST /api/v1/planner/tasks/:id/complete
   */
  async completeTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const task = await studyPlannerService.completeTask(id, userId, req.body);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get study statistics
   * GET /api/v1/planner/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const stats = await studyPlannerService.getStudyStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Add milestone to plan
   * POST /api/v1/planner/plans/:id/milestones
   */
  async addMilestone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const milestone = await studyPlannerService.addMilestone(userId, id, req.body);
      res.status(201).json(milestone);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Update milestone
   * PUT /api/v1/planner/milestones/:id
   */
  async updateMilestone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const milestone = await studyPlannerService.updateMilestone(id, userId, req.body);
      res.json(milestone);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const studyPlannerController = new StudyPlannerController();
export default studyPlannerController;

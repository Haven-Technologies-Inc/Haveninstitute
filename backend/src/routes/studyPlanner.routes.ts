/**
 * Study Planner Routes - API endpoints for study planning
 */

import { Router } from 'express';
import { studyPlannerController } from '../controllers/studyPlanner.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Study Plans
router.get('/plans', (req, res, next) => studyPlannerController.getPlans(req, res, next));
router.post('/plans', (req, res, next) => studyPlannerController.createPlan(req, res, next));
router.get('/plans/:id', (req, res, next) => studyPlannerController.getPlan(req, res, next));
router.put('/plans/:id', (req, res, next) => studyPlannerController.updatePlan(req, res, next));
router.delete('/plans/:id', (req, res, next) => studyPlannerController.deletePlan(req, res, next));

// AI Generation
router.post('/plans/:id/generate', (req, res, next) => studyPlannerController.generateAIPlan(req, res, next));

// Plan Tasks
router.post('/plans/:id/tasks', (req, res, next) => studyPlannerController.addTask(req, res, next));

// Plan Milestones
router.post('/plans/:id/milestones', (req, res, next) => studyPlannerController.addMilestone(req, res, next));

// Task Management
router.get('/tasks/today', (req, res, next) => studyPlannerController.getTodaysTasks(req, res, next));
router.get('/tasks/upcoming', (req, res, next) => studyPlannerController.getUpcomingTasks(req, res, next));
router.get('/tasks/overdue', (req, res, next) => studyPlannerController.getOverdueTasks(req, res, next));
router.get('/tasks/date/:date', (req, res, next) => studyPlannerController.getTasksForDate(req, res, next));
router.put('/tasks/:id', (req, res, next) => studyPlannerController.updateTask(req, res, next));
router.delete('/tasks/:id', (req, res, next) => studyPlannerController.deleteTask(req, res, next));
router.post('/tasks/:id/reschedule', (req, res, next) => studyPlannerController.rescheduleTask(req, res, next));
router.post('/tasks/:id/complete', (req, res, next) => studyPlannerController.completeTask(req, res, next));

// Milestones
router.put('/milestones/:id', (req, res, next) => studyPlannerController.updateMilestone(req, res, next));

// Statistics
router.get('/stats', (req, res, next) => studyPlannerController.getStats(req, res, next));

export default router;

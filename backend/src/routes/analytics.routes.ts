import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get complete dashboard data
 * @access  Private
 */
router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));

/**
 * @route   GET /api/v1/analytics/stats
 * @desc    Get user stats
 * @access  Private
 */
router.get('/stats', (req, res, next) => analyticsController.getStats(req, res, next));

/**
 * @route   GET /api/v1/analytics/confidence-trend
 * @desc    Get confidence trend over time
 * @access  Private
 */
router.get('/confidence-trend', (req, res, next) => analyticsController.getConfidenceTrend(req, res, next));

/**
 * @route   GET /api/v1/analytics/category-performance
 * @desc    Get category performance breakdown
 * @access  Private
 */
router.get('/category-performance', (req, res, next) => analyticsController.getCategoryPerformance(req, res, next));

/**
 * @route   GET /api/v1/analytics/weekly-activity
 * @desc    Get weekly activity data
 * @access  Private
 */
router.get('/weekly-activity', (req, res, next) => analyticsController.getWeeklyActivity(req, res, next));

/**
 * @route   GET /api/v1/analytics/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity', (req, res, next) => analyticsController.getRecentActivity(req, res, next));

/**
 * @route   GET /api/v1/analytics/streak
 * @desc    Get study streak
 * @access  Private
 */
router.get('/streak', (req, res, next) => analyticsController.getStreak(req, res, next));

/**
 * @route   GET /api/v1/analytics/goals
 * @desc    Get study goals
 * @access  Private
 */
router.get('/goals', (req, res, next) => analyticsController.getGoals(req, res, next));

/**
 * @route   POST /api/v1/analytics/goals
 * @desc    Create a study goal
 * @access  Private
 */
router.post('/goals', (req, res, next) => analyticsController.createGoal(req, res, next));

/**
 * @route   PUT /api/v1/analytics/goals/:goalId
 * @desc    Update a study goal
 * @access  Private
 */
router.put('/goals/:goalId', (req, res, next) => analyticsController.updateGoal(req, res, next));

/**
 * @route   DELETE /api/v1/analytics/goals/:goalId
 * @desc    Delete a study goal
 * @access  Private
 */
router.delete('/goals/:goalId', (req, res, next) => analyticsController.deleteGoal(req, res, next));

export default router;

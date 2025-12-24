/**
 * Study Planner Service - Business logic for study planning features
 */

import { Op } from 'sequelize';
import { StudyPlan, StudyPlanTask, StudyPlanMilestone } from '../models/StudyPlan';
import { User } from '../models/User';
import { aiService } from './ai';

interface CreatePlanInput {
  name: string;
  description?: string;
  targetDate: Date;
  focusAreas?: string[];
  weakAreas?: string[];
  dailyStudyHours?: number;
  preferences?: StudyPlan['preferences'];
  useAI?: boolean;
}

interface CreateTaskInput {
  planId: string;
  title: string;
  description?: string;
  type: StudyPlanTask['type'];
  category?: string;
  topic?: string;
  scheduledDate: Date;
  estimatedMinutes?: number;
  priority?: number;
  metadata?: StudyPlanTask['metadata'];
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  scheduledDate?: Date;
  estimatedMinutes?: number;
  status?: StudyPlanTask['status'];
  actualMinutes?: number;
  priority?: number;
  metadata?: StudyPlanTask['metadata'];
  completedAt?: Date;
}

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation'
];

export class StudyPlannerService {
  /**
   * Create a new study plan
   */
  async createPlan(userId: string, input: CreatePlanInput): Promise<StudyPlan> {
    const startDate = new Date();
    
    const plan = await StudyPlan.create({
      userId,
      name: input.name,
      description: input.description,
      startDate,
      targetDate: input.targetDate,
      focusAreas: input.focusAreas || NCLEX_CATEGORIES,
      weakAreas: input.weakAreas || [],
      dailyStudyHours: input.dailyStudyHours || 2,
      preferences: {
        preferredTimes: ['morning', 'evening'],
        studyDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        breakDuration: 10,
        sessionDuration: 45,
        includeWeekends: false,
        ...input.preferences
      },
      progress: {
        totalTasks: 0,
        completedTasks: 0,
        totalMinutesPlanned: 0,
        totalMinutesStudied: 0,
        currentStreak: 0,
        longestStreak: 0,
        categoryProgress: {}
      },
      isAIGenerated: input.useAI || false
    });

    // Generate AI tasks if requested
    if (input.useAI) {
      await this.generateAIPlan(plan.id, userId);
    }

    return plan;
  }

  /**
   * Generate AI-powered study plan
   */
  async generateAIPlan(planId: string, userId: string): Promise<StudyPlan> {
    const plan = await StudyPlan.findByPk(planId);
    if (!plan) throw new Error('Plan not found');
    if (plan.userId !== userId) throw new Error('Not authorized');

    try {
      const aiPlan = await aiService.generateStudyPlan({
        userId,
        targetDate: plan.targetDate,
        weakAreas: plan.weakAreas,
        currentAbility: 0, // TODO: Get from user's CAT history
        availableHoursPerDay: plan.dailyStudyHours,
        preferredStudyTimes: plan.preferences?.preferredTimes
      });

      // Create tasks from AI plan
      const tasks: any[] = [];
      for (const dailyPlan of aiPlan.dailyPlans || []) {
        for (const activity of dailyPlan.activities || []) {
          tasks.push({
            planId,
            title: `${activity.topic} - ${activity.type}`,
            type: this.mapActivityType(activity.type),
            category: dailyPlan.focusAreas?.[0],
            topic: activity.topic,
            scheduledDate: new Date(dailyPlan.date),
            estimatedMinutes: activity.duration,
            priority: 1
          });
        }
      }

      // Bulk create tasks
      if (tasks.length > 0) {
        await StudyPlanTask.bulkCreate(tasks);
      }

      // Create milestones
      if (aiPlan.milestones?.length) {
        const milestones = aiPlan.milestones.map(m => ({
          planId,
          title: m.goal,
          targetDate: new Date(m.date)
        }));
        await StudyPlanMilestone.bulkCreate(milestones);
      }

      // Update plan with AI insights
      await plan.update({
        isAIGenerated: true,
        aiInsights: {
          generatedAt: new Date().toISOString(),
          recommendations: aiPlan.recommendations || [],
          predictedReadiness: 50
        }
      });

      await this.updatePlanProgress(planId);

      return plan.reload({
        include: [
          { model: StudyPlanTask, as: 'tasks' },
          { model: StudyPlanMilestone, as: 'milestones' }
        ]
      });
    } catch (error) {
      console.error('Failed to generate AI plan:', error);
      throw new Error('Failed to generate AI study plan');
    }
  }

  private mapActivityType(type: string): StudyPlanTask['type'] {
    const mapping: Record<string, StudyPlanTask['type']> = {
      quiz: 'quiz',
      cat: 'cat',
      flashcard: 'flashcard',
      reading: 'reading',
      video: 'video',
      review: 'review',
      practice: 'practice'
    };
    return mapping[type] || 'custom';
  }

  /**
   * Get user's study plans
   */
  async getUserPlans(userId: string, status?: string): Promise<StudyPlan[]> {
    const where: any = { userId };
    if (status) where.status = status;

    return StudyPlan.findAll({
      where,
      include: [
        { model: StudyPlanTask, as: 'tasks' },
        { model: StudyPlanMilestone, as: 'milestones' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get a specific study plan
   */
  async getPlan(planId: string, userId: string): Promise<StudyPlan | null> {
    const plan = await StudyPlan.findOne({
      where: { id: planId, userId },
      include: [
        { 
          model: StudyPlanTask, 
          as: 'tasks',
          order: [['scheduledDate', 'ASC'], ['sortOrder', 'ASC']]
        },
        { model: StudyPlanMilestone, as: 'milestones' }
      ]
    });

    return plan;
  }

  /**
   * Update study plan
   */
  async updatePlan(planId: string, userId: string, input: Partial<CreatePlanInput>): Promise<StudyPlan> {
    const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
    if (!plan) throw new Error('Plan not found');

    await plan.update(input);
    return plan;
  }

  /**
   * Delete study plan
   */
  async deletePlan(planId: string, userId: string): Promise<void> {
    const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
    if (!plan) throw new Error('Plan not found');

    await StudyPlanTask.destroy({ where: { planId } });
    await StudyPlanMilestone.destroy({ where: { planId } });
    await plan.destroy();
  }

  /**
   * Add task to plan
   */
  async addTask(userId: string, input: CreateTaskInput): Promise<StudyPlanTask> {
    const plan = await StudyPlan.findOne({ where: { id: input.planId, userId } });
    if (!plan) throw new Error('Plan not found');

    const maxOrder = await StudyPlanTask.max('sortOrder', {
      where: { planId: input.planId, scheduledDate: input.scheduledDate }
    }) as number || 0;

    const task = await StudyPlanTask.create({
      ...input,
      sortOrder: maxOrder + 1
    });

    await this.updatePlanProgress(input.planId);

    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, userId: string, input: UpdateTaskInput): Promise<StudyPlanTask> {
    const task = await StudyPlanTask.findByPk(taskId, {
      include: [{ model: StudyPlan, as: 'plan' }]
    });

    if (!task || task.plan.userId !== userId) {
      throw new Error('Task not found');
    }

    // If completing task, set completedAt
    if (input.status === 'completed' && task.status !== 'completed') {
      input.completedAt = new Date() as any;
    }

    await task.update(input);
    await this.updatePlanProgress(task.planId);

    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await StudyPlanTask.findByPk(taskId, {
      include: [{ model: StudyPlan, as: 'plan' }]
    });

    if (!task || task.plan.userId !== userId) {
      throw new Error('Task not found');
    }

    const planId = task.planId;
    await task.destroy();
    await this.updatePlanProgress(planId);
  }

  /**
   * Get tasks for a specific date
   */
  async getTasksForDate(userId: string, date: Date): Promise<StudyPlanTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return StudyPlanTask.findAll({
      include: [{
        model: StudyPlan,
        as: 'plan',
        where: { userId, status: 'active' }
      }],
      where: {
        scheduledDate: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [['sortOrder', 'ASC'], ['priority', 'ASC']]
    });
  }

  /**
   * Get today's tasks
   */
  async getTodaysTasks(userId: string): Promise<StudyPlanTask[]> {
    return this.getTasksForDate(userId, new Date());
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(userId: string, days: number = 7): Promise<StudyPlanTask[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return StudyPlanTask.findAll({
      include: [{
        model: StudyPlan,
        as: 'plan',
        where: { userId, status: 'active' }
      }],
      where: {
        scheduledDate: {
          [Op.between]: [startDate, endDate]
        },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [['scheduledDate', 'ASC'], ['priority', 'ASC']]
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<StudyPlanTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return StudyPlanTask.findAll({
      include: [{
        model: StudyPlan,
        as: 'plan',
        where: { userId, status: 'active' }
      }],
      where: {
        scheduledDate: { [Op.lt]: today },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [['scheduledDate', 'ASC']]
    });
  }

  /**
   * Reschedule task
   */
  async rescheduleTask(taskId: string, userId: string, newDate: Date): Promise<StudyPlanTask> {
    const task = await StudyPlanTask.findByPk(taskId, {
      include: [{ model: StudyPlan, as: 'plan' }]
    });

    if (!task || task.plan.userId !== userId) {
      throw new Error('Task not found');
    }

    await task.update({
      scheduledDate: newDate,
      status: 'rescheduled'
    });

    return task;
  }

  /**
   * Complete task with results
   */
  async completeTask(taskId: string, userId: string, results: {
    actualMinutes: number;
    score?: number;
    notes?: string;
  }): Promise<StudyPlanTask> {
    const task = await StudyPlanTask.findByPk(taskId, {
      include: [{ model: StudyPlan, as: 'plan' }]
    });

    if (!task || task.plan.userId !== userId) {
      throw new Error('Task not found');
    }

    await task.update({
      status: 'completed',
      completedAt: new Date(),
      actualMinutes: results.actualMinutes,
      metadata: {
        ...task.metadata,
        actualScore: results.score,
        notes: results.notes
      }
    });

    await this.updatePlanProgress(task.planId);
    await this.updateStreak(userId);

    return task;
  }

  /**
   * Update plan progress statistics
   */
  private async updatePlanProgress(planId: string): Promise<void> {
    const plan = await StudyPlan.findByPk(planId);
    if (!plan) return;

    const tasks = await StudyPlanTask.findAll({ where: { planId } });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalMinutesPlanned = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const totalMinutesStudied = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0);

    // Calculate category progress
    const categoryProgress: any = {};
    for (const task of tasks) {
      if (task.category) {
        if (!categoryProgress[task.category]) {
          categoryProgress[task.category] = { planned: 0, completed: 0 };
        }
        categoryProgress[task.category].planned++;
        if (task.status === 'completed') {
          categoryProgress[task.category].completed++;
        }
      }
    }

    await plan.update({
      progress: {
        ...plan.progress,
        totalTasks,
        completedTasks,
        totalMinutesPlanned,
        totalMinutesStudied,
        categoryProgress
      }
    });
  }

  /**
   * Update study streak
   */
  private async updateStreak(userId: string): Promise<void> {
    const plans = await StudyPlan.findAll({
      where: { userId, status: 'active' }
    });

    for (const plan of plans) {
      const today = new Date().toISOString().split('T')[0];
      const lastStudyDate = plan.progress?.lastStudyDate;

      let currentStreak = plan.progress?.currentStreak || 0;
      let longestStreak = plan.progress?.longestStreak || 0;

      if (lastStudyDate === today) {
        // Already studied today
        continue;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudyDate === yesterdayStr) {
        // Continuing streak
        currentStreak++;
      } else {
        // Streak broken, start new
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);

      await plan.update({
        progress: {
          ...plan.progress,
          currentStreak,
          longestStreak,
          lastStudyDate: today
        }
      });
    }
  }

  /**
   * Get study statistics
   */
  async getStudyStats(userId: string): Promise<{
    totalPlans: number;
    activePlans: number;
    totalTasksCompleted: number;
    totalMinutesStudied: number;
    currentStreak: number;
    longestStreak: number;
    categoryBreakdown: Record<string, number>;
  }> {
    const plans = await StudyPlan.findAll({
      where: { userId },
      include: [{ model: StudyPlanTask, as: 'tasks' }]
    });

    let totalTasksCompleted = 0;
    let totalMinutesStudied = 0;
    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;
    const categoryBreakdown: Record<string, number> = {};

    for (const plan of plans) {
      totalTasksCompleted += plan.progress?.completedTasks || 0;
      totalMinutesStudied += plan.progress?.totalMinutesStudied || 0;
      maxCurrentStreak = Math.max(maxCurrentStreak, plan.progress?.currentStreak || 0);
      maxLongestStreak = Math.max(maxLongestStreak, plan.progress?.longestStreak || 0);

      for (const [category, data] of Object.entries(plan.progress?.categoryProgress || {})) {
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (data as any).completed;
      }
    }

    return {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'active').length,
      totalTasksCompleted,
      totalMinutesStudied,
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
      categoryBreakdown
    };
  }

  /**
   * Add milestone to plan
   */
  async addMilestone(userId: string, planId: string, input: {
    title: string;
    description?: string;
    targetDate: Date;
    criteria?: StudyPlanMilestone['criteria'];
  }): Promise<StudyPlanMilestone> {
    const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
    if (!plan) throw new Error('Plan not found');

    return StudyPlanMilestone.create({
      planId,
      ...input
    });
  }

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId: string, userId: string, input: {
    title?: string;
    description?: string;
    targetDate?: Date;
    status?: StudyPlanMilestone['status'];
  }): Promise<StudyPlanMilestone> {
    const milestone = await StudyPlanMilestone.findByPk(milestoneId, {
      include: [{ model: StudyPlan, as: 'plan' }]
    });

    if (!milestone || milestone.plan.userId !== userId) {
      throw new Error('Milestone not found');
    }

    if (input.status === 'achieved' && milestone.status !== 'achieved') {
      (input as any).achievedAt = new Date();
    }

    await milestone.update(input);
    return milestone;
  }
}

export const studyPlannerService = new StudyPlannerService();
export default studyPlannerService;

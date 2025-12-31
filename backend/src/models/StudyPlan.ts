/**
 * Study Plan Models - StudyPlan defined first to avoid circular references
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';

// Main Study Plan Model - MUST be defined first
@Table({ tableName: 'study_plans', timestamps: true })
export class StudyPlan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'title' })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({ type: DataType.DATE, field: 'started_at' })
  startDate?: Date;

  @Column({ type: DataType.DATE, field: 'exam_date' })
  targetDate?: Date;

  @Column({
    type: DataType.ENUM('draft', 'active', 'completed', 'abandoned'),
    defaultValue: 'active'
  })
  status!: 'draft' | 'active' | 'completed' | 'abandoned';

  @Column({ type: DataType.JSON, defaultValue: [] })
  focusAreas!: string[];

  @Column({ type: DataType.JSON, defaultValue: [] })
  weakAreas!: string[];

  @Column({ type: DataType.FLOAT, defaultValue: 2, field: 'study_hours_per_day' })
  dailyStudyHours!: number;

  @Column(DataType.JSON)
  preferences?: {
    preferredTimes: string[];
    studyDays: string[];
    breakDuration: number;
    sessionDuration: number;
    includeWeekends: boolean;
  };

  @Column(DataType.JSON)
  progress?: {
    totalTasks: number;
    completedTasks: number;
    totalMinutesPlanned: number;
    totalMinutesStudied: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate?: string;
    categoryProgress: Record<string, { completed: number; total: number }>;
  };

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'ai_generated' })
  isAIGenerated!: boolean;

  @Column(DataType.JSON)
  aiInsights?: {
    generatedAt: string;
    recommendations: string[];
    predictedReadiness: number;
    suggestedAdjustments?: string[];
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => StudyPlanTask)
  tasks!: StudyPlanTask[];

  @HasMany(() => StudyPlanMilestone)
  milestones!: StudyPlanMilestone[];
}

// Study Plan Task Model
@Table({ tableName: 'study_plan_tasks', timestamps: true })
export class StudyPlanTask extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyPlan)
  @Column(DataType.UUID)
  planId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.ENUM('quiz', 'cat', 'flashcard', 'reading', 'video', 'review', 'practice', 'custom'),
    defaultValue: 'custom'
  })
  type!: 'quiz' | 'cat' | 'flashcard' | 'reading' | 'video' | 'review' | 'practice' | 'custom';

  @Column(DataType.STRING)
  category?: string;

  @Column(DataType.STRING)
  topic?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledDate!: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 30 })
  estimatedMinutes!: number;

  @Column(DataType.INTEGER)
  actualMinutes?: number;

  @Column({
    type: DataType.ENUM('pending', 'in_progress', 'completed', 'skipped'),
    defaultValue: 'pending'
  })
  status!: 'pending' | 'in_progress' | 'completed' | 'skipped';

  @Column(DataType.DATE)
  completedAt?: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  priority!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  sortOrder!: number;

  @Column(DataType.JSON)
  metadata?: {
    resourceId?: string;
    resourceType?: string;
    questionCount?: number;
    score?: number;
    notes?: string;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => StudyPlan)
  plan!: StudyPlan;
}

// Study Plan Milestone Model
@Table({ tableName: 'study_plan_milestones', timestamps: true })
export class StudyPlanMilestone extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyPlan)
  @Column(DataType.UUID)
  planId!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  targetDate!: Date;

  @Column({
    type: DataType.ENUM('pending', 'achieved', 'missed'),
    defaultValue: 'pending'
  })
  status!: 'pending' | 'achieved' | 'missed';

  @Column(DataType.DATE)
  achievedAt?: Date;

  @Column(DataType.JSON)
  criteria?: {
    type: 'score' | 'tasks' | 'time' | 'custom';
    target: number;
    current?: number;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => StudyPlan)
  plan!: StudyPlan;
}

export default StudyPlan;

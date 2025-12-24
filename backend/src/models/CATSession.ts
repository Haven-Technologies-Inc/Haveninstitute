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

export type CATStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
export type CATResult = 'pass' | 'fail' | 'undetermined';

@Table({
  tableName: 'cat_sessions',
  timestamps: true,
  underscored: true
})
export class CATSession extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Default('in_progress')
  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  status!: CATStatus;

  // Current ability estimate (theta)
  @Default(0.0)
  @Column({
    type: DataType.FLOAT,
    field: 'current_ability'
  })
  currentAbility!: number;

  // Standard error of measurement
  @Default(1.0)
  @Column({
    type: DataType.FLOAT,
    field: 'standard_error'
  })
  standardError!: number;

  // 95% Confidence interval
  @Column({
    type: DataType.FLOAT,
    field: 'confidence_lower'
  })
  confidenceLower?: number;

  @Column({
    type: DataType.FLOAT,
    field: 'confidence_upper'
  })
  confidenceUpper?: number;

  // Probability of passing
  @Default(0.5)
  @Column({
    type: DataType.FLOAT,
    field: 'passing_probability'
  })
  passingProbability!: number;

  // Questions answered
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'questions_answered'
  })
  questionsAnswered!: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'questions_correct'
  })
  questionsCorrect!: number;

  // Time tracking
  @Column({
    type: DataType.INTEGER,
    field: 'time_spent',
    defaultValue: 0,
    comment: 'Total time spent in seconds'
  })
  timeSpent!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'time_limit',
    defaultValue: 18000,
    comment: 'Time limit in seconds (5 hours = 18000)'
  })
  timeLimit!: number;

  // Question IDs already shown (to avoid repeats)
  @Column({
    type: DataType.JSON,
    field: 'answered_question_ids',
    defaultValue: []
  })
  answeredQuestionIds!: string[];

  // Final result
  @Column({
    type: DataType.STRING(20),
    defaultValue: 'undetermined'
  })
  result!: CATResult;

  // Category performance breakdown
  @Column({
    type: DataType.JSON,
    field: 'category_performance',
    defaultValue: {}
  })
  categoryPerformance!: Record<string, { correct: number; total: number }>;

  // Difficulty distribution
  @Column({
    type: DataType.JSON,
    field: 'difficulty_distribution',
    defaultValue: { easy: 0, medium: 0, hard: 0 }
  })
  difficultyDistribution!: { easy: number; medium: number; hard: number };

  // Stop reason
  @Column({
    type: DataType.STRING(50),
    field: 'stop_reason'
  })
  stopReason?: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'completed_at'
  })
  completedAt?: Date;

  // Calculate score percentage
  get scorePercentage(): number {
    if (this.questionsAnswered === 0) return 0;
    return Math.round((this.questionsCorrect / this.questionsAnswered) * 100);
  }

  // Check if test is still valid (not timed out)
  isTimedOut(): boolean {
    return this.timeSpent >= this.timeLimit;
  }
}

export default CATSession;

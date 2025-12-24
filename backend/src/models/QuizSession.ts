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
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';

export type QuizStatus = 'in_progress' | 'completed' | 'abandoned';
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

@Table({
  tableName: 'quiz_sessions',
  timestamps: true,
  underscored: true
})
export class QuizSession extends Model {
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
  status!: QuizStatus;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  category?: string;

  @Default('mixed')
  @Column({
    type: DataType.STRING(10),
    allowNull: false
  })
  difficulty!: QuizDifficulty;

  @Default(10)
  @Column({
    type: DataType.INTEGER,
    field: 'question_count'
  })
  questionCount!: number;

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

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'time_spent',
    comment: 'Total time spent in seconds'
  })
  timeSpent!: number;

  @Column({
    type: DataType.JSON,
    field: 'question_ids',
    defaultValue: []
  })
  questionIds!: string[];

  @Column({
    type: DataType.INTEGER,
    field: 'current_question_index',
    defaultValue: 0
  })
  currentQuestionIndex!: number;

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

  get scorePercentage(): number {
    if (this.questionsAnswered === 0) return 0;
    return Math.round((this.questionsCorrect / this.questionsAnswered) * 100);
  }
}

export default QuizSession;

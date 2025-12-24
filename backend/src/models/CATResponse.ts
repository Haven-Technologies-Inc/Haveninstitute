import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { CATSession } from './CATSession';
import { Question } from './Question';

@Table({
  tableName: 'cat_responses',
  timestamps: true,
  underscored: true
})
export class CATResponse extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => CATSession)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'session_id'
  })
  sessionId!: string;

  @BelongsTo(() => CATSession)
  session!: CATSession;

  @ForeignKey(() => Question)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'question_id'
  })
  questionId!: string;

  @BelongsTo(() => Question)
  question!: Question;

  // Question order in the test
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'question_number'
  })
  questionNumber!: number;

  // User's answer(s)
  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'user_answer',
    comment: 'Array of selected option IDs'
  })
  userAnswer!: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_correct'
  })
  isCorrect!: boolean;

  // Time spent on this question (seconds)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'time_spent',
    defaultValue: 0
  })
  timeSpent!: number;

  // Ability estimate AFTER this response
  @Column({
    type: DataType.FLOAT,
    field: 'ability_after'
  })
  abilityAfter?: number;

  // Standard error AFTER this response
  @Column({
    type: DataType.FLOAT,
    field: 'se_after'
  })
  seAfter?: number;

  // IRT parameters at time of answering (for audit)
  @Column({
    type: DataType.JSON,
    field: 'irt_params'
  })
  irtParams?: { discrimination: number; difficulty: number; guessing: number };

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

export default CATResponse;

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
import { QuizSession } from './QuizSession';
import { Question } from './Question';

@Table({
  tableName: 'quiz_responses',
  timestamps: true,
  underscored: true
})
export class QuizResponse extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => QuizSession)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'session_id'
  })
  sessionId!: string;

  @BelongsTo(() => QuizSession)
  session!: QuizSession;

  @ForeignKey(() => Question)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'question_id'
  })
  questionId!: string;

  @BelongsTo(() => Question)
  question!: Question;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'question_number'
  })
  questionNumber!: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'user_answer'
  })
  userAnswer!: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_correct'
  })
  isCorrect!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'time_spent',
    defaultValue: 0
  })
  timeSpent!: number;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

export default QuizResponse;

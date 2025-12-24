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
import { User } from './User';

export type ActivityType = 
  | 'quiz_completed'
  | 'cat_completed'
  | 'flashcard_reviewed'
  | 'book_read'
  | 'goal_achieved'
  | 'streak_milestone'
  | 'login';

@Table({
  tableName: 'study_activities',
  timestamps: true,
  underscored: true
})
export class StudyActivity extends Model {
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

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'activity_type'
  })
  activityType!: ActivityType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  description!: string;

  @Column({
    type: DataType.JSON,
    comment: 'Additional activity metadata'
  })
  metadata?: {
    sessionId?: string;
    score?: number;
    total?: number;
    category?: string;
    timeSpent?: number;
  };

  @Column({
    type: DataType.INTEGER,
    field: 'points_earned',
    defaultValue: 0
  })
  pointsEarned!: number;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

export default StudyActivity;

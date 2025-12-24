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

export type GoalType = 'questions' | 'time' | 'accuracy' | 'streak' | 'custom';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

@Table({
  tableName: 'study_goals',
  timestamps: true,
  underscored: true
})
export class StudyGoal extends Model {
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
    type: DataType.STRING(100),
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  type!: GoalType;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'daily'
  })
  period!: GoalPeriod;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  target!: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  current!: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_reset'
  })
  lastReset?: Date;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;

  get progress(): number {
    if (this.target === 0) return 0;
    return Math.min(100, Math.round((this.current / this.target) * 100));
  }
}

export default StudyGoal;

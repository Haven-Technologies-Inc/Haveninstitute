import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';

export type AchievementCategory = 'study' | 'quiz' | 'cat' | 'social' | 'streak' | 'special';

@Table({
  tableName: 'achievements',
  timestamps: false,
})
export class Achievement extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.ENUM('study', 'quiz', 'cat', 'social', 'streak', 'special'),
    allowNull: false,
  })
  category!: AchievementCategory;

  @Column({
    type: DataType.STRING(500),
    field: 'icon_url',
  })
  iconUrl?: string;

  @Default(0)
  @Column(DataType.INTEGER)
  points!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'requirement_type',
  })
  requirementType!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'requirement_value',
  })
  requirementValue!: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_hidden',
  })
  isHidden!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
  })
  isActive!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;
}

@Table({
  tableName: 'user_achievements',
  timestamps: false,
})
export class UserAchievement extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Achievement)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'achievement_id',
  })
  achievementId!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  progress!: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_completed',
  })
  isCompleted!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'completed_at',
  })
  completedAt?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Achievement)
  achievement!: Achievement;
}

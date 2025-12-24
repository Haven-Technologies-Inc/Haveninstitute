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
} from 'sequelize-typescript';
import { User } from './User';

export type NotificationType = 'system' | 'achievement' | 'reminder' | 'social' | 'subscription' | 'study';

@Table({
  tableName: 'notifications',
  timestamps: false,
})
export class Notification extends Model {
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

  @Column({
    type: DataType.ENUM('system', 'achievement', 'reminder', 'social', 'subscription', 'study'),
    allowNull: false,
  })
  type!: NotificationType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.STRING(500),
    field: 'action_url',
  })
  actionUrl?: string;

  @Column({
    type: DataType.STRING(100),
    field: 'action_text',
  })
  actionText?: string;

  @Column({
    type: DataType.JSON,
    get() {
      const value = this.getDataValue('metadata');
      if (!value) return {};
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return {}; }
      }
      return value;
    },
  })
  metadata?: Record<string, any>;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_read',
  })
  isRead!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'read_at',
  })
  readAt?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @BelongsTo(() => User)
  user!: User;
}

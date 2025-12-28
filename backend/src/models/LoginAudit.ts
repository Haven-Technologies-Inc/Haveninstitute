/**
 * Login Audit Model
 * 
 * Tracks login attempts and security events for audit trail
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

export type LoginEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'password_changed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity';

@Table({
  tableName: 'login_audits',
  timestamps: true,
  underscored: true,
})
export class LoginAudit extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id',
  })
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  email?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'event_type',
  })
  eventType!: LoginEventType;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  success!: boolean;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'ip_address',
  })
  ipAddress?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'user_agent',
  })
  userAgent?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  location?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  device?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  browser?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  os?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'failure_reason',
  })
  failureReason?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: Record<string, unknown>;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

/**
 * Password History Model
 * 
 * Tracks previous passwords to prevent reuse
 */
@Table({
  tableName: 'password_history',
  timestamps: true,
  underscored: true,
})
export class PasswordHistory extends Model {
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

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash!: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

export default LoginAudit;

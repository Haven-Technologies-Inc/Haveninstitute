import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'sessions',
  timestamps: false,
  underscored: true
})
export class Session extends Model {
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
    type: DataType.STRING(512),
    allowNull: false,
    unique: true,
    field: 'token_hash'
  })
  tokenHash!: string;

  @Column({
    type: DataType.STRING(512),
    field: 'refresh_token_hash'
  })
  refreshTokenHash?: string;

  @Column({
    type: DataType.STRING(45),
    field: 'ip_address'
  })
  ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    field: 'user_agent'
  })
  userAgent?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at'
  })
  expiresAt!: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  // Check if session is expired
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

export default Session;

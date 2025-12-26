/**
 * Study Groups Models - New implementation with proper relationships
 * Tables: study_groups, group_members, group_messages, group_invitations
 */

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Unique,
  Index
} from 'sequelize-typescript';
import { User } from './User';

// ============================================
// STUDY GROUP MODEL
// ============================================
@Table({
  tableName: 'study_groups',
  timestamps: true,
  underscored: true
})
export class StudyGroup extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'created_by'
  })
  createdBy!: string;

  @Default(6)
  @Column({
    type: DataType.INTEGER,
    field: 'max_members'
  })
  maxMembers!: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_public'
  })
  isPublic!: boolean;

  @Column(DataType.STRING(50))
  category?: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @BelongsTo(() => User, 'createdBy')
  creator?: User;

  @HasMany(() => GroupMember, 'groupId')
  members?: GroupMember[];

  @HasMany(() => GroupMessage, 'groupId')
  messages?: GroupMessage[];

  @HasMany(() => GroupInvitation, 'groupId')
  invitations?: GroupInvitation[];
}

// ============================================
// GROUP MEMBER MODEL
// ============================================
@Table({
  tableName: 'group_members',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['group_id', 'user_id']
    }
  ]
})
export class GroupMember extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'group_id'
  })
  groupId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId!: string;

  @Default('member')
  @Column({
    type: DataType.ENUM('creator', 'admin', 'member'),
    allowNull: false
  })
  role!: 'creator' | 'admin' | 'member';

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    field: 'joined_at'
  })
  joinedAt!: Date;

  // Relationships
  @BelongsTo(() => StudyGroup, 'groupId')
  group?: StudyGroup;

  @BelongsTo(() => User, 'userId')
  user?: User;
}

// ============================================
// GROUP MESSAGE MODEL
// ============================================
@Table({
  tableName: 'group_messages',
  timestamps: false,
  underscored: true
})
export class GroupMessage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Index
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'group_id'
  })
  groupId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @Default('text')
  @Column({
    type: DataType.ENUM('text', 'image', 'resource_link'),
    field: 'message_type'
  })
  messageType!: 'text' | 'image' | 'resource_link';

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  // Relationships
  @BelongsTo(() => StudyGroup, 'groupId')
  group?: StudyGroup;

  @BelongsTo(() => User, 'userId')
  user?: User;
}

// ============================================
// GROUP INVITATION MODEL
// ============================================
@Table({
  tableName: 'group_invitations',
  timestamps: false,
  underscored: true
})
export class GroupInvitation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'group_id'
  })
  groupId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'inviter_id'
  })
  inviterId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  email!: string;

  @Unique
  @Column(DataType.STRING(255))
  token?: string;

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'accepted', 'declined', 'expired')
  })
  status!: 'pending' | 'accepted' | 'declined' | 'expired';

  @Column({
    type: DataType.DATE,
    field: 'expires_at'
  })
  expiresAt?: Date;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  // Relationships
  @BelongsTo(() => StudyGroup, 'groupId')
  group?: StudyGroup;

  @BelongsTo(() => User, 'inviterId')
  inviter?: User;
}

export default StudyGroup;

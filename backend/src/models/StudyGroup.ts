/**
 * Study Group Models - For collaborative study sessions
 * Note: StudyGroup is defined first to avoid circular reference issues
 */

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
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';

// Main Study Group Model - MUST be defined first
@Table({
  tableName: 'study_groups',
  timestamps: true
})
export class StudyGroup extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  @Column(DataType.STRING)
  coverImageUrl?: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  ownerId!: string;

  @Column({
    type: DataType.ENUM('public', 'private', 'invite_only'),
    defaultValue: 'public'
  })
  visibility!: 'public' | 'private' | 'invite_only';

  @Column({ type: DataType.JSON, defaultValue: [] })
  focusAreas!: string[];

  @Column({ type: DataType.JSON, defaultValue: [] })
  tags!: string[];

  @Column({ type: DataType.INTEGER, defaultValue: 50 })
  maxMembers!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  memberCount!: number;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  averageAbility!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @Column(DataType.JSON)
  settings?: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    allowPolls: boolean;
    allowResources: boolean;
    weeklyGoal?: number;
    notificationPreferences?: {
      newMessage: boolean;
      newSession: boolean;
      memberJoined: boolean;
    };
  };

  @Column(DataType.JSON)
  stats?: {
    totalMessages: number;
    totalSessions: number;
    totalStudyHours: number;
    averageSessionAttendance: number;
    weeklyActiveMembers: number;
  };

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => User)
  owner!: User;

  @HasMany(() => StudyGroupMember)
  members!: StudyGroupMember[];

  @HasMany(() => StudyGroupMessage)
  messages!: StudyGroupMessage[];

  @HasMany(() => StudySession)
  sessions!: StudySession[];
}

// Study Group Member Model
@Table({
  tableName: 'study_group_members',
  timestamps: true
})
export class StudyGroupMember extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Column(DataType.UUID)
  groupId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @Column({
    type: DataType.ENUM('owner', 'admin', 'moderator', 'member'),
    defaultValue: 'member'
  })
  role!: 'owner' | 'admin' | 'moderator' | 'member';

  @Column({
    type: DataType.ENUM('active', 'invited', 'pending', 'banned'),
    defaultValue: 'active'
  })
  status!: 'active' | 'invited' | 'pending' | 'banned';

  @Column(DataType.DATE)
  joinedAt!: Date;

  @Column(DataType.DATE)
  lastActiveAt!: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  contributionPoints!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => StudyGroup)
  group!: StudyGroup;

  @BelongsTo(() => User)
  user!: User;
}

// Study Group Message Model
@Table({
  tableName: 'study_group_messages',
  timestamps: true
})
export class StudyGroupMessage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Column(DataType.UUID)
  groupId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  senderId!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @Column({
    type: DataType.ENUM('text', 'question', 'resource', 'announcement', 'poll'),
    defaultValue: 'text'
  })
  type!: 'text' | 'question' | 'resource' | 'announcement' | 'poll';

  @Column(DataType.JSON)
  metadata?: {
    attachments?: { url: string; type: string; name: string }[];
    pollOptions?: { id: string; text: string; votes: number }[];
    questionId?: string;
    replyTo?: string;
  };

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isPinned!: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isEdited!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => StudyGroup)
  group!: StudyGroup;

  @BelongsTo(() => User)
  sender!: User;
}

// Study Session Model
@Table({
  tableName: 'study_sessions',
  timestamps: true
})
export class StudySession extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => StudyGroup)
  @Column(DataType.UUID)
  groupId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledStart!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledEnd!: Date;

  @Column(DataType.DATE)
  actualStart?: Date;

  @Column(DataType.DATE)
  actualEnd?: Date;

  @Column({
    type: DataType.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  })
  status!: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  @Column({ type: DataType.JSON, defaultValue: [] })
  topics!: string[];

  @Column(DataType.JSON)
  resources?: {
    type: 'quiz' | 'flashcard' | 'document' | 'video';
    id: string;
    title: string;
  }[];

  @Column(DataType.STRING)
  meetingLink?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  attendeeCount!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => StudyGroup)
  group!: StudyGroup;

  @BelongsTo(() => User)
  creator!: User;
}

export default StudyGroup;

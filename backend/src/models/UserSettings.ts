/**
 * User Settings Model
 * 
 * Manages user preferences, notification settings, and app configuration
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
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';

// Notification preferences
export interface NotificationPreferences {
  email: {
    studyReminders: boolean;
    weeklyProgress: boolean;
    newContent: boolean;
    promotions: boolean;
    accountAlerts: boolean;
  };
  push: {
    studyReminders: boolean;
    dailyGoals: boolean;
    streakAlerts: boolean;
    groupActivity: boolean;
    aiTutorResponses: boolean;
  };
}

// Study preferences
export interface StudyPreferences {
  dailyGoal: number; // minutes
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  questionsPerSession: number;
  showExplanationsImmediately: boolean;
  autoAdvanceQuestions: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

// Display preferences
export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  language: string;
  timezone: string;
}

// Privacy settings
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgressOnLeaderboard: boolean;
  allowStudyGroupInvites: boolean;
  shareActivityWithFriends: boolean;
  allowDirectMessages: boolean;
}

// Default settings
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    studyReminders: true,
    weeklyProgress: true,
    newContent: true,
    promotions: false,
    accountAlerts: true
  },
  push: {
    studyReminders: true,
    dailyGoals: true,
    streakAlerts: true,
    groupActivity: true,
    aiTutorResponses: true
  }
};

export const DEFAULT_STUDY_PREFERENCES: StudyPreferences = {
  dailyGoal: 60,
  preferredStudyTime: 'morning',
  questionsPerSession: 20,
  showExplanationsImmediately: true,
  autoAdvanceQuestions: false,
  soundEffects: true,
  hapticFeedback: true
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: 'system',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  compactMode: false,
  language: 'en',
  timezone: 'UTC'
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'friends',
  showProgressOnLeaderboard: true,
  allowStudyGroupInvites: true,
  shareActivityWithFriends: true,
  allowDirectMessages: true
};

@Table({
  tableName: 'user_settings',
  timestamps: true,
  underscored: true
})
export class UserSettings extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id'
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  // Notification preferences
  @Column({
    type: DataType.JSON,
    field: 'notification_preferences',
    defaultValue: DEFAULT_NOTIFICATION_PREFERENCES,
    get() {
      const value = this.getDataValue('notificationPreferences');
      return value ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...value } : DEFAULT_NOTIFICATION_PREFERENCES;
    }
  })
  notificationPreferences!: NotificationPreferences;

  // Study preferences
  @Column({
    type: DataType.JSON,
    field: 'study_preferences',
    defaultValue: DEFAULT_STUDY_PREFERENCES,
    get() {
      const value = this.getDataValue('studyPreferences');
      return value ? { ...DEFAULT_STUDY_PREFERENCES, ...value } : DEFAULT_STUDY_PREFERENCES;
    }
  })
  studyPreferences!: StudyPreferences;

  // Display preferences
  @Column({
    type: DataType.JSON,
    field: 'display_preferences',
    defaultValue: DEFAULT_DISPLAY_PREFERENCES,
    get() {
      const value = this.getDataValue('displayPreferences');
      return value ? { ...DEFAULT_DISPLAY_PREFERENCES, ...value } : DEFAULT_DISPLAY_PREFERENCES;
    }
  })
  displayPreferences!: DisplayPreferences;

  // Privacy settings
  @Column({
    type: DataType.JSON,
    field: 'privacy_settings',
    defaultValue: DEFAULT_PRIVACY_SETTINGS,
    get() {
      const value = this.getDataValue('privacySettings');
      return value ? { ...DEFAULT_PRIVACY_SETTINGS, ...value } : DEFAULT_PRIVACY_SETTINGS;
    }
  })
  privacySettings!: PrivacySettings;

  // Two-factor authentication
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'two_factor_enabled'
  })
  twoFactorEnabled!: boolean;

  @Column({
    type: DataType.STRING(255),
    field: 'two_factor_secret'
  })
  twoFactorSecret?: string;

  @Column({
    type: DataType.JSON,
    field: 'two_factor_backup_codes'
  })
  twoFactorBackupCodes?: string[];

  // Session settings
  @Default(30)
  @Column({
    type: DataType.INTEGER,
    field: 'session_timeout_minutes',
    comment: 'Auto-logout after inactivity (minutes)'
  })
  sessionTimeoutMinutes!: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'remember_me_enabled'
  })
  rememberMeEnabled!: boolean;

  // Data & export
  @Column({
    type: DataType.DATE,
    field: 'last_data_export'
  })
  lastDataExport?: Date;

  @Column({
    type: DataType.DATE,
    field: 'data_deletion_requested_at'
  })
  dataDeletionRequestedAt?: Date;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

export default UserSettings;

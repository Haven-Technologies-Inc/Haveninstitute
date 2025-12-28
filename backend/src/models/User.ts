import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash'
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'full_name'
  })
  fullName!: string;

  @Default('student')
  @Column({
    type: DataType.ENUM('student', 'instructor', 'editor', 'moderator', 'admin'),
    allowNull: false
  })
  role!: string;

  @Default('Free')
  @Column({
    type: DataType.ENUM('Free', 'Pro', 'Premium'),
    allowNull: false,
    field: 'subscription_tier'
  })
  subscriptionTier!: string;

  @Column({
    type: DataType.STRING(500),
    field: 'avatar_url'
  })
  avatarUrl?: string;

  @Column({
    type: DataType.STRING(20),
    field: 'phone_number'
  })
  phoneNumber?: string;

  @Column(DataType.TEXT)
  bio?: string;

  @Column({
    type: DataType.STRING(50),
    field: 'preferred_study_time'
  })
  preferredStudyTime?: string;

  @Column({
    type: DataType.JSON,
    get() {
      const value = this.getDataValue('goals' as any);
      if (!value) return [];
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return []; }
      }
      return value;
    }
  })
  goals?: string[];

  @Column({
    type: DataType.ENUM('RN', 'PN'),
    field: 'nclex_type'
  })
  nclexType?: string;

  @Column({
    type: DataType.DATE,
    field: 'exam_date'
  })
  examDate?: Date;

  @Column({
    type: DataType.INTEGER,
    field: 'target_score'
  })
  targetScore?: number;

  @Column({
    type: DataType.JSON,
    field: 'weak_areas',
    get() {
      const value = this.getDataValue('weakAreas' as any);
      if (!value) return [];
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return []; }
      }
      return value;
    }
  })
  weakAreas?: number[];

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'has_completed_onboarding'
  })
  hasCompletedOnboarding!: boolean;

  @Column({
    type: DataType.JSON,
    field: 'onboarding_data'
  })
  onboardingData?: any;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'email_verified'
  })
  emailVerified!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_login'
  })
  lastLogin?: Date;

  // OAuth fields
  @Column({
    type: DataType.STRING(100),
    field: 'google_id'
  })
  googleId?: string;

  @Column({
    type: DataType.STRING(100),
    field: 'apple_id'
  })
  appleId?: string;

  @Default('local')
  @Column({
    type: DataType.ENUM('local', 'google', 'apple'),
    field: 'auth_provider'
  })
  authProvider!: string;

  // MFA fields
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'mfa_enabled'
  })
  mfaEnabled!: boolean;

  @Column({
    type: DataType.STRING(100),
    field: 'mfa_secret'
  })
  mfaSecret?: string;

  @Column({
    type: DataType.JSON,
    field: 'mfa_backup_codes'
  })
  mfaBackupCodes?: string[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt!: Date;

  // Methods
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('passwordHash')) {
      const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 12);
      user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
  }

  // Hide sensitive data
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  }
}

export default User;

/**
 * Book Model
 * 
 * Represents e-books and reading materials available in the platform
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
  HasMany,
} from 'sequelize-typescript';
import { User } from './User';

export type BookCategory = 
  | 'fundamentals'
  | 'pharmacology'
  | 'medical_surgical'
  | 'pediatrics'
  | 'maternity'
  | 'mental_health'
  | 'community_health'
  | 'leadership'
  | 'nclex_prep';

export type BookFormat = 'pdf' | 'epub' | 'video' | 'audio';

@Table({
  tableName: 'books',
  timestamps: true,
  underscored: true,
})
export class Book extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  subtitle?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  author!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  isbn?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'fundamentals',
  })
  category!: BookCategory;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'pdf',
  })
  format!: BookFormat;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  coverImageUrl?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  fileUrl?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  totalPages?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  durationMinutes?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  price!: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  })
  currency!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFree!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPremiumOnly!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tags?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tableOfContents?: { chapter: string; page: number }[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  downloadCount!: number;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
  })
  averageRating!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  ratingCount!: number;

  @HasMany(() => UserBook)
  userBooks!: UserBook[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

@Table({
  tableName: 'user_books',
  timestamps: true,
  underscored: true,
})
export class UserBook extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Book)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bookId!: string;

  @BelongsTo(() => Book)
  book!: Book;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPurchased!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  currentPage!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  })
  progressPercent!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  totalReadingTimeMinutes!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastReadAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rating?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  review?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  highlights?: { page: number; text: string; color: string; createdAt: Date }[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  bookmarks?: { page: number; title: string; createdAt: Date }[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  notes?: { page: number; content: string; createdAt: Date }[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Book;

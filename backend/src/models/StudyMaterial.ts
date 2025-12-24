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

export type MaterialType = 'ebook' | 'video' | 'audio' | 'document' | 'flashcard_deck' | 'notes';
export type MaterialCategory = 
  | 'safe_effective_care'
  | 'health_promotion'
  | 'psychosocial'
  | 'physiological_basic'
  | 'physiological_complex'
  | 'pharmacology'
  | 'fundamentals'
  | 'general';

@Table({
  tableName: 'study_materials',
  timestamps: true,
  underscored: true
})
export class StudyMaterial extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.TEXT
  })
  description?: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'material_type'
  })
  materialType!: MaterialType;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'general'
  })
  category!: MaterialCategory;

  @Column({
    type: DataType.STRING(500),
    field: 'file_url',
    comment: 'URL to the file in storage'
  })
  fileUrl?: string;

  @Column({
    type: DataType.STRING(500),
    field: 'thumbnail_url'
  })
  thumbnailUrl?: string;

  @Column({
    type: DataType.STRING(50),
    field: 'file_type',
    comment: 'MIME type or file extension'
  })
  fileType?: string;

  @Column({
    type: DataType.BIGINT,
    field: 'file_size',
    comment: 'File size in bytes'
  })
  fileSize?: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'Duration in seconds for video/audio'
  })
  duration?: number;

  @Column({
    type: DataType.INTEGER,
    field: 'page_count',
    comment: 'Number of pages for documents/ebooks'
  })
  pageCount?: number;

  @Column({
    type: DataType.JSON,
    comment: 'Tags for filtering and search'
  })
  tags?: string[];

  @Column({
    type: DataType.JSON,
    comment: 'Table of contents for ebooks'
  })
  tableOfContents?: { title: string; page: number }[];

  @Column({
    type: DataType.STRING(255)
  })
  author?: string;

  @Column({
    type: DataType.STRING(100)
  })
  publisher?: string;

  @Column({
    type: DataType.STRING(20)
  })
  isbn?: string;

  @Column({
    type: DataType.DATE,
    field: 'published_date'
  })
  publishedDate?: Date;

  @Column({
    type: DataType.STRING(20),
    field: 'subscription_tier',
    defaultValue: 'Free',
    comment: 'Required subscription tier: Free, Basic, Premium'
  })
  subscriptionTier!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Price for individual purchase (null = subscription only)'
  })
  price?: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_featured'
  })
  isFeatured!: boolean;

  @Column({
    type: DataType.INTEGER,
    field: 'view_count',
    defaultValue: 0
  })
  viewCount!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'download_count',
    defaultValue: 0
  })
  downloadCount!: number;

  @Column({
    type: DataType.FLOAT,
    field: 'average_rating',
    defaultValue: 0
  })
  averageRating!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'rating_count',
    defaultValue: 0
  })
  ratingCount!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'uploaded_by'
  })
  uploadedBy?: string;

  @BelongsTo(() => User, 'uploadedBy')
  uploader?: User;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

// User progress/bookmarks for study materials
@Table({
  tableName: 'user_study_materials',
  timestamps: true,
  underscored: true
})
export class UserStudyMaterial extends Model {
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

  @ForeignKey(() => StudyMaterial)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'material_id'
  })
  materialId!: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    comment: 'Progress percentage (0-100)'
  })
  progress!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'current_page',
    defaultValue: 0
  })
  currentPage!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'current_position',
    defaultValue: 0,
    comment: 'Position in seconds for video/audio'
  })
  currentPosition!: number;

  @Column({
    type: DataType.JSON,
    comment: 'Bookmarked pages/positions'
  })
  bookmarks?: { page?: number; position?: number; note?: string; createdAt: Date }[];

  @Column({
    type: DataType.JSON,
    comment: 'Highlighted text with notes'
  })
  highlights?: { text: string; page?: number; note?: string; color?: string; createdAt: Date }[];

  @Column({
    type: DataType.TEXT,
    comment: 'User notes for this material'
  })
  notes?: string;

  @Column({
    type: DataType.INTEGER,
    comment: 'User rating (1-5)'
  })
  rating?: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_favorite'
  })
  isFavorite!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_accessed'
  })
  lastAccessed?: Date;

  @Column({
    type: DataType.INTEGER,
    field: 'time_spent',
    defaultValue: 0,
    comment: 'Total time spent in seconds'
  })
  timeSpent!: number;

  @BelongsTo(() => User)
  user?: User;

  @BelongsTo(() => StudyMaterial)
  material?: StudyMaterial;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

export default StudyMaterial;

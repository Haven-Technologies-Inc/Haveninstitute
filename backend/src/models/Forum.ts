/**
 * Forum Models - Discussion forum for NCLEX prep community
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

// Forum Category
@Table({
  tableName: 'forum_categories',
  timestamps: true
})
export class ForumCategory extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  slug!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.STRING
  })
  icon?: string;

  @Column({
    type: DataType.STRING
  })
  color?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sortOrder!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  postCount!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasMany(() => ForumPost)
  posts!: ForumPost[];
}

// Forum Post
@Table({
  tableName: 'forum_posts',
  timestamps: true
})
export class ForumPost extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => ForumCategory)
  @Column(DataType.UUID)
  categoryId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  authorId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  slug!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @Column({
    type: DataType.ENUM('question', 'discussion', 'tip', 'resource', 'announcement'),
    defaultValue: 'discussion'
  })
  type!: 'question' | 'discussion' | 'tip' | 'resource' | 'announcement';

  @Column({
    type: DataType.ENUM('open', 'closed', 'resolved', 'archived'),
    defaultValue: 'open'
  })
  status!: 'open' | 'closed' | 'resolved' | 'archived';

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: []
  })
  tags!: string[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  viewCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  commentCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  likeCount!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isPinned!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isLocked!: boolean;

  @Column({
    type: DataType.UUID
  })
  acceptedAnswerId?: string;

  @Column(DataType.DATE)
  lastActivityAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => ForumCategory)
  category!: ForumCategory;

  @BelongsTo(() => User)
  author!: User;

  @HasMany(() => ForumComment)
  comments!: ForumComment[];

  @HasMany(() => ForumReaction)
  reactions!: ForumReaction[];
}

// Forum Comment
@Table({
  tableName: 'forum_comments',
  timestamps: true
})
export class ForumComment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => ForumPost)
  @Column(DataType.UUID)
  postId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  authorId!: string;

  @Column({
    type: DataType.UUID
  })
  parentId?: string; // For nested replies

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  likeCount!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isAccepted!: boolean; // For Q&A posts

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isEdited!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => ForumPost)
  post!: ForumPost;

  @BelongsTo(() => User)
  author!: User;

  @HasMany(() => ForumReaction)
  reactions!: ForumReaction[];
}

// Forum Reaction (Likes, etc.)
@Table({
  tableName: 'forum_reactions',
  timestamps: true
})
export class ForumReaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => ForumPost)
  @Column({
    type: DataType.UUID
  })
  postId?: string;

  @ForeignKey(() => ForumComment)
  @Column({
    type: DataType.UUID
  })
  commentId?: string;

  @Column({
    type: DataType.ENUM('like', 'helpful', 'insightful', 'thanks'),
    defaultValue: 'like'
  })
  type!: 'like' | 'helpful' | 'insightful' | 'thanks';

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => ForumPost)
  post?: ForumPost;

  @BelongsTo(() => ForumComment)
  comment?: ForumComment;
}

// Forum Bookmark
@Table({
  tableName: 'forum_bookmarks',
  timestamps: true
})
export class ForumBookmark extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => ForumPost)
  @Column(DataType.UUID)
  postId!: string;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => ForumPost)
  post!: ForumPost;
}

export default ForumPost;

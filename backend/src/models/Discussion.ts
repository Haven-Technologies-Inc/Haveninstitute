/**
 * Discussion Models - Database Schema (Sequelize)
 */

import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'discussion_categories', timestamps: true, underscored: true })
export class DiscussionCategory extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  name!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  slug!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @Default('MessageSquare')
  @Column(DataType.STRING(50))
  icon!: string;

  @Default('#6b7280')
  @Column(DataType.STRING(20))
  color!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  postCount!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

@Table({ tableName: 'discussion_posts', timestamps: true, underscored: true })
export class DiscussionPost extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId!: string;

  @BelongsTo(() => User)
  author!: User;

  @ForeignKey(() => DiscussionCategory)
  @Column({ type: DataType.UUID, allowNull: true })
  categoryId!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  viewCount!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  likeCount!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

@Table({ tableName: 'discussion_comments', timestamps: true, underscored: true })
export class DiscussionComment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => DiscussionPost)
  @Column({ type: DataType.UUID, allowNull: false })
  postId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  likeCount!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

@Table({ tableName: 'discussion_reactions', timestamps: true, underscored: true })
export class DiscussionReaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  @Column({ type: DataType.UUID, allowNull: false })
  targetId!: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  type!: string;

  @CreatedAt
  createdAt!: Date;
}

@Table({ tableName: 'discussion_bookmarks', timestamps: true, underscored: true })
export class DiscussionBookmark extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  @ForeignKey(() => DiscussionPost)
  @Column({ type: DataType.UUID, allowNull: false })
  postId!: string;

  @CreatedAt
  createdAt!: Date;
}

@Table({ tableName: 'discussion_tags', timestamps: true, underscored: true })
export class DiscussionTag extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  name!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  count!: number;

  @CreatedAt
  createdAt!: Date;
}

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

@Table({
  tableName: 'flashcard_decks',
  timestamps: true,
  underscored: true
})
export class FlashcardDeck extends Model {
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
    type: DataType.STRING(50),
    defaultValue: 'general'
  })
  category!: string;

  @Column({
    type: DataType.JSON
  })
  tags?: string[];

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_public'
  })
  isPublic!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    field: 'card_count',
    defaultValue: 0
  })
  cardCount!: number;

  @Column({
    type: DataType.STRING(7),
    defaultValue: '#6366f1'
  })
  color?: string;

  @Column({
    type: DataType.STRING(50)
  })
  icon?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'created_by'
  })
  createdBy!: string;

  @BelongsTo(() => User)
  creator?: User;

  @HasMany(() => Flashcard)
  cards?: Flashcard[];

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

@Table({
  tableName: 'flashcards',
  timestamps: true,
  underscored: true
})
export class Flashcard extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => FlashcardDeck)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'deck_id'
  })
  deckId!: string;

  @BelongsTo(() => FlashcardDeck)
  deck?: FlashcardDeck;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  front!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  back!: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Additional notes or hints'
  })
  notes?: string;

  @Column({
    type: DataType.STRING(500),
    field: 'image_url'
  })
  imageUrl?: string;

  @Column({
    type: DataType.JSON
  })
  tags?: string[];

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  position!: number;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

@Table({
  tableName: 'user_flashcard_progress',
  timestamps: true,
  underscored: true
})
export class UserFlashcardProgress extends Model {
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

  @ForeignKey(() => Flashcard)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'flashcard_id'
  })
  flashcardId!: string;

  @BelongsTo(() => User)
  user?: User;

  @BelongsTo(() => Flashcard)
  flashcard?: Flashcard;

  @Column({
    type: DataType.FLOAT,
    field: 'ease_factor',
    defaultValue: 2.5,
    comment: 'SM-2 algorithm ease factor'
  })
  easeFactor!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: 'Current interval in days'
  })
  interval!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: 'Number of successful reviews'
  })
  repetitions!: number;

  @Column({
    type: DataType.DATE,
    field: 'next_review',
    comment: 'Next scheduled review date'
  })
  nextReview?: Date;

  @Column({
    type: DataType.DATE,
    field: 'last_reviewed'
  })
  lastReviewed?: Date;

  @Column({
    type: DataType.INTEGER,
    field: 'times_reviewed',
    defaultValue: 0
  })
  timesReviewed!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'times_correct',
    defaultValue: 0
  })
  timesCorrect!: number;

  @Column({
    type: DataType.STRING(20),
    field: 'mastery_level',
    defaultValue: 'new',
    comment: 'new, learning, reviewing, mastered'
  })
  masteryLevel!: 'new' | 'learning' | 'reviewing' | 'mastered';

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}

export default { FlashcardDeck, Flashcard, UserFlashcardProgress };

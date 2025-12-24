import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';

// NCLEX-RN Client Needs Categories
export type NCLEXCategory = 
  | 'safe_effective_care'      // Safe and Effective Care Environment
  | 'health_promotion'         // Health Promotion and Maintenance
  | 'psychosocial'            // Psychosocial Integrity
  | 'physiological_basic'     // Physiological Integrity: Basic Care
  | 'physiological_complex';  // Physiological Integrity: Complex Care

// Question types matching NCLEX format
export type QuestionType = 
  | 'multiple_choice'    // Single best answer
  | 'select_all'         // Multiple correct answers
  | 'ordered_response'   // Drag and drop ordering
  | 'fill_blank'         // Fill in the blank
  | 'hot_spot'           // Click on image area
  | 'chart_exhibit';     // Review chart data

// Bloom's Taxonomy levels
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

@Table({
  tableName: 'questions',
  timestamps: true,
  underscored: true
})
export class Question extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  text!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    comment: 'Array of {id, text} option objects'
  })
  options!: { id: string; text: string }[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'correct_answers',
    comment: 'Array of correct option IDs'
  })
  correctAnswers!: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  explanation!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  category!: NCLEXCategory;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'question_type',
    defaultValue: 'multiple_choice'
  })
  questionType!: QuestionType;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: 'bloom_level',
    defaultValue: 'apply'
  })
  bloomLevel!: BloomLevel;

  // IRT Parameters for CAT
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'irt_discrimination',
    defaultValue: 1.0,
    comment: 'IRT a-parameter (0.5 to 2.5)'
  })
  irtDiscrimination!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'irt_difficulty',
    defaultValue: 0.0,
    comment: 'IRT b-parameter (-3 to +3)'
  })
  irtDifficulty!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'irt_guessing',
    defaultValue: 0.2,
    comment: 'IRT c-parameter (0 to 0.35)'
  })
  irtGuessing!: number;

  // Legacy difficulty for display
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'medium'
  })
  difficulty!: 'easy' | 'medium' | 'hard';

  @Column({
    type: DataType.JSON,
    comment: 'Related topics or keywords'
  })
  tags?: string[];

  @Column({
    type: DataType.STRING(500),
    field: 'rationale_correct',
    comment: 'Why correct answer is correct'
  })
  rationaleCorrect?: string;

  @Column({
    type: DataType.STRING(500),
    field: 'rationale_incorrect',
    comment: 'Why incorrect answers are wrong'
  })
  rationaleIncorrect?: string;

  @Column({
    type: DataType.STRING(500),
    comment: 'Reference source for the question'
  })
  source?: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    field: 'times_answered',
    defaultValue: 0
  })
  timesAnswered!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'times_correct',
    defaultValue: 0
  })
  timesCorrect!: number;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;

  // Virtual getter for success rate
  get successRate(): number {
    if (this.timesAnswered === 0) return 0;
    return (this.timesCorrect / this.timesAnswered) * 100;
  }

  // Get IRT parameters as object
  getIRTParams() {
    return {
      discrimination: this.irtDiscrimination,
      difficulty: this.irtDifficulty,
      guessing: this.irtGuessing
    };
  }
}

export default Question;

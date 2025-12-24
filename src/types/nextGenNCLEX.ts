/**
 * NextGen NCLEX Question Types and Interfaces
 * Supports all question formats used in the Next Generation NCLEX exam
 */

// All possible NextGen NCLEX question types
export type QuestionType = 
  | 'multiple-choice'      // Traditional single answer
  | 'select-all'           // Multiple Response (SATA)
  | 'ordered-response'     // Drag and drop ordering
  | 'cloze-dropdown'       // Fill in blanks with dropdowns
  | 'hot-spot'             // Click on image areas
  | 'matrix'               // Grid/table selection
  | 'highlight'            // Select text in a passage
  | 'bow-tie'              // Clinical reasoning diagram
  | 'case-study';          // Extended scenario with multiple questions

// NCLEX Client Needs Categories (8 focus areas)
export type NCLEXCategory = 
  | 'management-of-care'
  | 'safety-infection'
  | 'health-promotion'
  | 'psychosocial'
  | 'basic-care'
  | 'pharmacological'
  | 'risk-reduction'
  | 'physiological-adaptation';

export interface NCLEXCategoryInfo {
  id: NCLEXCategory;
  name: string;
  parent: string;
  icon: string;
  percentage: string;
  description: string;
}

export const NCLEX_CATEGORIES: NCLEXCategoryInfo[] = [
  { 
    id: 'management-of-care', 
    name: 'Management of Care', 
    parent: 'Safe & Effective Care Environment', 
    icon: '🏥', 
    percentage: '17-23%',
    description: 'Advance directives, advocacy, case management, delegation, ethical practice'
  },
  { 
    id: 'safety-infection', 
    name: 'Safety and Infection Control', 
    parent: 'Safe & Effective Care Environment', 
    icon: '🛡️', 
    percentage: '9-15%',
    description: 'Accident prevention, emergency response, standard precautions'
  },
  { 
    id: 'health-promotion', 
    name: 'Health Promotion and Maintenance', 
    parent: 'Health Promotion', 
    icon: '💪', 
    percentage: '6-12%',
    description: 'Growth and development, health screening, disease prevention'
  },
  { 
    id: 'psychosocial', 
    name: 'Psychosocial Integrity', 
    parent: 'Psychosocial Integrity', 
    icon: '🧠', 
    percentage: '6-12%',
    description: 'Coping mechanisms, mental health, therapeutic communication'
  },
  { 
    id: 'basic-care', 
    name: 'Basic Care and Comfort', 
    parent: 'Physiological Integrity', 
    icon: '🛏️', 
    percentage: '6-12%',
    description: 'Mobility, nutrition, rest, elimination, personal hygiene'
  },
  { 
    id: 'pharmacological', 
    name: 'Pharmacological Therapies', 
    parent: 'Physiological Integrity', 
    icon: '💊', 
    percentage: '12-18%',
    description: 'Medication administration, adverse effects, pain management'
  },
  { 
    id: 'risk-reduction', 
    name: 'Reduction of Risk Potential', 
    parent: 'Physiological Integrity', 
    icon: '🔬', 
    percentage: '9-15%',
    description: 'Diagnostic tests, lab values, potential complications'
  },
  { 
    id: 'physiological-adaptation', 
    name: 'Physiological Adaptation', 
    parent: 'Physiological Integrity', 
    icon: '⚕️', 
    percentage: '11-17%',
    description: 'Alterations in body systems, fluid/electrolyte imbalances, medical emergencies'
  },
];

// Base question interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  category: NCLEXCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  stem: string;              // The question text
  rationale: string;         // Explanation for the correct answer
  references?: string[];     // Source references
  tags?: string[];           // Additional categorization
  cognitiveLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

// Multiple Choice (single answer)
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number;     // Index of correct option
}

// Select All That Apply (SATA)
export interface SelectAllQuestion extends BaseQuestion {
  type: 'select-all';
  options: string[];
  correctAnswers: number[];  // Indices of all correct options
  partialCredit?: boolean;   // Allow partial scoring
}

// Ordered Response (Drag and Drop)
export interface OrderedResponseQuestion extends BaseQuestion {
  type: 'ordered-response';
  items: string[];           // Items to be ordered
  correctOrder: number[];    // Correct sequence (indices)
}

// Cloze/Drop-down (Fill in blanks)
export interface ClozeDropdownQuestion extends BaseQuestion {
  type: 'cloze-dropdown';
  template: string;          // Text with {{1}}, {{2}} placeholders
  blanks: {
    id: number;
    options: string[];
    correctAnswer: number;   // Index of correct option
  }[];
}

// Hot Spot (Image-based)
export interface HotSpotQuestion extends BaseQuestion {
  type: 'hot-spot';
  imageUrl: string;
  hotSpots: {
    id: string;
    shape: 'circle' | 'rect' | 'polygon';
    coords: number[];        // Coordinates for the shape
    label?: string;
  }[];
  correctSpots: string[];    // IDs of correct hot spots
}

// Matrix/Grid
export interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  rows: string[];            // Row labels
  columns: string[];         // Column labels
  correctSelections: {
    row: number;
    column: number;
  }[];
  selectionType: 'single-per-row' | 'multiple';
}

// Highlight (Text selection)
export interface HighlightQuestion extends BaseQuestion {
  type: 'highlight';
  passage: string;
  highlightableSegments: {
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
  }[];
  correctHighlights: string[]; // IDs of segments to highlight
  instruction: string;         // e.g., "Highlight the findings that require immediate intervention"
}

// Bow-tie (Clinical reasoning)
export interface BowTieQuestion extends BaseQuestion {
  type: 'bow-tie';
  scenario: string;
  centerCondition: string;   // The main condition/diagnosis
  leftSide: {                // Causes/Contributing factors
    label: string;
    options: string[];
    correctAnswers: number[];
    selectCount: number;     // How many to select
  };
  rightSide: {               // Actions/Interventions
    label: string;
    options: string[];
    correctAnswers: number[];
    selectCount: number;
  };
}

// Case Study (Extended scenario)
export interface CaseStudyQuestion extends BaseQuestion {
  type: 'case-study';
  scenario: string;
  tabs?: {
    title: string;
    content: string;
  }[];
  subQuestions: (
    | Omit<MultipleChoiceQuestion, 'id' | 'category' | 'difficulty' | 'rationale'>
    | Omit<SelectAllQuestion, 'id' | 'category' | 'difficulty' | 'rationale'>
    | Omit<OrderedResponseQuestion, 'id' | 'category' | 'difficulty' | 'rationale'>
    | Omit<MatrixQuestion, 'id' | 'category' | 'difficulty' | 'rationale'>
  )[];
}

// Union type for all question types
export type NextGenQuestion = 
  | MultipleChoiceQuestion
  | SelectAllQuestion
  | OrderedResponseQuestion
  | ClozeDropdownQuestion
  | HotSpotQuestion
  | MatrixQuestion
  | HighlightQuestion
  | BowTieQuestion
  | CaseStudyQuestion;

// Answer types for each question type
export type QuestionAnswer = 
  | { type: 'multiple-choice'; answer: number }
  | { type: 'select-all'; answers: number[] }
  | { type: 'ordered-response'; order: number[] }
  | { type: 'cloze-dropdown'; answers: Record<number, number> }
  | { type: 'hot-spot'; selectedSpots: string[] }
  | { type: 'matrix'; selections: { row: number; column: number }[] }
  | { type: 'highlight'; highlightedIds: string[] }
  | { type: 'bow-tie'; left: number[]; right: number[] }
  | { type: 'case-study'; subAnswers: QuestionAnswer[] };

// Practice session configuration
export interface PracticeConfig {
  questionCount: number;
  categories: NCLEXCategory[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed' | 'adaptive';
  questionTypes: QuestionType[];
  mode: 'practice' | 'exam' | 'review';
  timed: boolean;
  timeLimit?: number;        // Total time in minutes
  instantFeedback: boolean;
  adaptiveMode: boolean;     // CAT-style adaptation
}

// Default practice configuration
export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  questionCount: 25,
  categories: [],            // Empty = all categories
  difficulty: 'mixed',
  questionTypes: ['multiple-choice', 'select-all'],
  mode: 'practice',
  timed: false,
  instantFeedback: true,
  adaptiveMode: false,
};

// Scoring utilities
export function calculateScore(question: NextGenQuestion, answer: QuestionAnswer): number {
  switch (question.type) {
    case 'multiple-choice':
      return answer.type === 'multiple-choice' && 
             answer.answer === question.correctAnswer ? 1 : 0;
    
    case 'select-all': {
      if (answer.type !== 'select-all') return 0;
      const correct = new Set(question.correctAnswers);
      const selected = new Set(answer.answers);
      if (question.partialCredit) {
        let score = 0;
        answer.answers.forEach(a => {
          if (correct.has(a)) score += 1 / question.correctAnswers.length;
          else score -= 0.5 / question.correctAnswers.length; // Penalty for wrong
        });
        return Math.max(0, Math.min(1, score));
      }
      // All or nothing
      return correct.size === selected.size && 
             [...correct].every(c => selected.has(c)) ? 1 : 0;
    }
    
    case 'ordered-response': {
      if (answer.type !== 'ordered-response') return 0;
      const correct = question.correctOrder;
      return JSON.stringify(answer.order) === JSON.stringify(correct) ? 1 : 0;
    }
    
    case 'cloze-dropdown': {
      if (answer.type !== 'cloze-dropdown') return 0;
      let correct = 0;
      question.blanks.forEach(blank => {
        if (answer.answers[blank.id] === blank.correctAnswer) correct++;
      });
      return correct / question.blanks.length;
    }
    
    case 'matrix': {
      if (answer.type !== 'matrix') return 0;
      const correctSet = new Set(
        question.correctSelections.map(s => `${s.row}-${s.column}`)
      );
      const selectedSet = new Set(
        answer.selections.map(s => `${s.row}-${s.column}`)
      );
      if (correctSet.size !== selectedSet.size) return 0;
      return [...correctSet].every(c => selectedSet.has(c)) ? 1 : 0;
    }
    
    case 'highlight': {
      if (answer.type !== 'highlight') return 0;
      const correct = new Set(question.correctHighlights);
      const selected = new Set(answer.highlightedIds);
      return correct.size === selected.size && 
             [...correct].every(c => selected.has(c)) ? 1 : 0;
    }
    
    case 'bow-tie': {
      if (answer.type !== 'bow-tie') return 0;
      const leftCorrect = question.leftSide.correctAnswers;
      const rightCorrect = question.rightSide.correctAnswers;
      const leftScore = leftCorrect.filter(c => answer.left.includes(c)).length / leftCorrect.length;
      const rightScore = rightCorrect.filter(c => answer.right.includes(c)).length / rightCorrect.length;
      return (leftScore + rightScore) / 2;
    }
    
    default:
      return 0;
  }
}

// Helper to get question type display name
export function getQuestionTypeName(type: QuestionType): string {
  const names: Record<QuestionType, string> = {
    'multiple-choice': 'Multiple Choice',
    'select-all': 'Select All That Apply',
    'ordered-response': 'Ordered Response',
    'cloze-dropdown': 'Drop-Down Cloze',
    'hot-spot': 'Hot Spot',
    'matrix': 'Matrix/Grid',
    'highlight': 'Highlight',
    'bow-tie': 'Bow-Tie',
    'case-study': 'Case Study',
  };
  return names[type];
}

// Question type icons (for UI)
export function getQuestionTypeIcon(type: QuestionType): string {
  const icons: Record<QuestionType, string> = {
    'multiple-choice': '○',
    'select-all': '☑',
    'ordered-response': '⇅',
    'cloze-dropdown': '▼',
    'hot-spot': '◎',
    'matrix': '▦',
    'highlight': '🖍',
    'bow-tie': '⋈',
    'case-study': '📋',
  };
  return icons[type];
}

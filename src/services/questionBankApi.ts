// Question Bank API Service
// Integrates with backend question management endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('haven_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'An error occurred');
  }
  return data.data;
};

// NCLEX Categories
export type NCLEXCategory = 
  | 'safe_effective_care'
  | 'health_promotion'
  | 'psychosocial'
  | 'physiological_basic'
  | 'physiological_complex';

export type QuestionType = 
  | 'multiple_choice'
  | 'select_all'
  | 'ordered_response'
  | 'fill_blank'
  | 'hot_spot'
  | 'chart_exhibit';

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
  category: NCLEXCategory;
  questionType: QuestionType;
  bloomLevel: BloomLevel;
  difficulty: Difficulty;
  tags?: string[];
  rationaleCorrect?: string;
  rationaleIncorrect?: string;
  source?: string;
  isActive: boolean;
  timesAnswered: number;
  timesCorrect: number;
  irtDiscrimination: number;
  irtDifficulty: number;
  irtGuessing: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  category?: NCLEXCategory;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  bloomLevel?: BloomLevel;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  questions: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuestionStatistics {
  total: number;
  active: number;
  inactive: number;
  byCategory: { category: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
  byType: { questionType: string; count: number }[];
}

export interface CreateQuestionInput {
  text: string;
  options: QuestionOption[];
  correctAnswers: string[];
  explanation: string;
  category: NCLEXCategory;
  questionType?: QuestionType;
  bloomLevel?: BloomLevel;
  difficulty?: Difficulty;
  tags?: string[];
  rationaleCorrect?: string;
  rationaleIncorrect?: string;
  source?: string;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// Category labels for display
export const CATEGORY_LABELS: Record<NCLEXCategory, string> = {
  'safe_effective_care': 'Safe & Effective Care',
  'health_promotion': 'Health Promotion',
  'psychosocial': 'Psychosocial Integrity',
  'physiological_basic': 'Physiological Basic',
  'physiological_complex': 'Physiological Complex'
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple_choice': 'Multiple Choice',
  'select_all': 'Select All That Apply',
  'ordered_response': 'Ordered Response',
  'fill_blank': 'Fill in the Blank',
  'hot_spot': 'Hot Spot',
  'chart_exhibit': 'Chart/Exhibit'
};

export const BLOOM_LEVEL_LABELS: Record<BloomLevel, string> = {
  'remember': 'Remember',
  'understand': 'Understand',
  'apply': 'Apply',
  'analyze': 'Analyze',
  'evaluate': 'Evaluate',
  'create': 'Create'
};

// ============= API FUNCTIONS =============

/**
 * Get questions with filtering and pagination
 */
export async function getQuestions(
  filters: QuestionFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResponse<Question>> {
  const params = new URLSearchParams();
  
  // Pagination
  if (pagination.page) params.append('page', pagination.page.toString());
  if (pagination.limit) params.append('limit', pagination.limit.toString());
  if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
  if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
  
  // Filters
  if (filters.category) params.append('category', filters.category);
  if (filters.questionType) params.append('questionType', filters.questionType);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.bloomLevel) params.append('bloomLevel', filters.bloomLevel);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.tags?.length) params.append('tags', filters.tags.join(','));

  const response = await fetch(`${API_BASE_URL}/questions?${params}`, {
    headers: getHeaders()
  });
  
  return handleResponse<PaginatedResponse<Question>>(response);
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(id: string): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    headers: getHeaders()
  });
  
  return handleResponse<Question>(response);
}

/**
 * Get question statistics
 */
export async function getQuestionStatistics(): Promise<QuestionStatistics> {
  const response = await fetch(`${API_BASE_URL}/questions/statistics`, {
    headers: getHeaders()
  });
  
  return handleResponse<QuestionStatistics>(response);
}

/**
 * Create a new question
 */
export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input)
  });
  
  return handleResponse<Question>(response);
}

/**
 * Update an existing question
 */
export async function updateQuestion(id: string, input: Partial<CreateQuestionInput> & { isActive?: boolean }): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input)
  });
  
  return handleResponse<Question>(response);
}

/**
 * Delete a question
 */
export async function deleteQuestion(id: string, hard = false): Promise<{ message: string }> {
  const params = hard ? '?hard=true' : '';
  const response = await fetch(`${API_BASE_URL}/questions/${id}${params}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  return handleResponse<{ message: string }>(response);
}

/**
 * Toggle question active status
 */
export async function toggleQuestionStatus(id: string, isActive: boolean): Promise<Question> {
  return updateQuestion(id, { isActive });
}

/**
 * Bulk import questions from JSON
 */
export async function bulkImportJSON(questions: CreateQuestionInput[]): Promise<BulkImportResult> {
  const response = await fetch(`${API_BASE_URL}/questions/import/json`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ questions })
  });
  
  return handleResponse<BulkImportResult>(response);
}

/**
 * Bulk import questions from CSV
 */
export async function bulkImportCSV(csvContent: string): Promise<BulkImportResult> {
  const response = await fetch(`${API_BASE_URL}/questions/import/csv`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ csv: csvContent })
  });
  
  return handleResponse<BulkImportResult>(response);
}

/**
 * Get random questions for practice
 */
export async function getRandomQuestions(count: number, filters?: QuestionFilters): Promise<Question[]> {
  const params = new URLSearchParams();
  params.append('count', count.toString());
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);

  const response = await fetch(`${API_BASE_URL}/questions/random?${params}`, {
    headers: getHeaders()
  });
  
  return handleResponse<Question[]>(response);
}

/**
 * Export questions to CSV format
 */
export function exportQuestionsToCSV(questions: Question[]): string {
  const headers = [
    'ID',
    'Question',
    'Category',
    'Type',
    'Difficulty',
    'Bloom Level',
    'Times Answered',
    'Success Rate',
    'Status',
    'Created'
  ];
  
  const rows = questions.map(q => [
    q.id,
    `"${q.text.replace(/"/g, '""')}"`,
    CATEGORY_LABELS[q.category],
    QUESTION_TYPE_LABELS[q.questionType],
    q.difficulty,
    BLOOM_LEVEL_LABELS[q.bloomLevel],
    q.timesAnswered.toString(),
    q.timesAnswered > 0 ? `${((q.timesCorrect / q.timesAnswered) * 100).toFixed(1)}%` : 'N/A',
    q.isActive ? 'Active' : 'Inactive',
    new Date(q.createdAt).toLocaleDateString()
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

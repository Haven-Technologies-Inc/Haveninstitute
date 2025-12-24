import api from '../api';

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category: string;
  questionType: string;
  bloomLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  rationaleCorrect?: string;
  rationaleIncorrect?: string;
  source?: string;
  irtDiscrimination: number;
  irtDifficulty: number;
  irtGuessing: number;
  timesAnswered: number;
  timesCorrect: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFilters {
  category?: string;
  questionType?: string;
  difficulty?: string;
  bloomLevel?: string;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateQuestionInput {
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category: string;
  questionType?: string;
  bloomLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
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

export interface QuestionStatistics {
  total: number;
  active: number;
  inactive: number;
  byCategory: { category: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
  byType: { questionType: string; count: number }[];
}

export const questionApi = {
  // Get all questions with filters and pagination
  async getQuestions(filters?: QuestionFilters, pagination?: PaginationParams): Promise<QuestionsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.questionType) params.append('questionType', filters.questionType);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.bloomLevel) params.append('bloomLevel', filters.bloomLevel);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    
    if (pagination?.page) params.append('page', String(pagination.page));
    if (pagination?.limit) params.append('limit', String(pagination.limit));
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await api.get(`/questions?${params.toString()}`);
    return response.data.data;
  },

  // Get a single question by ID
  async getQuestionById(id: string): Promise<Question> {
    const response = await api.get(`/questions/${id}`);
    return response.data.data;
  },

  // Create a new question
  async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const response = await api.post('/questions', input);
    return response.data.data;
  },

  // Update a question
  async updateQuestion(id: string, input: Partial<CreateQuestionInput>): Promise<Question> {
    const response = await api.put(`/questions/${id}`, input);
    return response.data.data;
  },

  // Delete a question
  async deleteQuestion(id: string, hard = false): Promise<{ message: string }> {
    const response = await api.delete(`/questions/${id}?hard=${hard}`);
    return response.data.data;
  },

  // Get random questions for practice
  async getRandomQuestions(count: number, filters?: { category?: string; difficulty?: string }): Promise<Question[]> {
    const params = new URLSearchParams({ count: String(count) });
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    
    const response = await api.get(`/questions/random?${params.toString()}`);
    return response.data.data;
  },

  // Bulk import questions from JSON
  async bulkImportJSON(questions: CreateQuestionInput[]): Promise<BulkImportResult> {
    const response = await api.post('/questions/import/json', { questions });
    return response.data.data;
  },

  // Bulk import questions from CSV
  async bulkImportCSV(csvContent: string): Promise<BulkImportResult> {
    const response = await api.post('/questions/import/csv', { csv: csvContent });
    return response.data.data;
  },

  // Get question statistics
  async getStatistics(): Promise<QuestionStatistics> {
    const response = await api.get('/questions/statistics');
    return response.data.data;
  },
};

export default questionApi;

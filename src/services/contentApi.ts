// Content Management API Service
// Handles questions, flashcards, books, and all content operations

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  rationale?: string;
  references?: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  category: string;
  chapters: Chapter[];
  totalPages: number;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  pageStart: number;
  pageEnd: number;
}

export interface ContentFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isActive?: boolean;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  imported: any[];
}

// Mock data stores
let mockQuestions: Question[] = Array.from({ length: 50 }, (_, i) => ({
  id: `q-${i + 1}`,
  question: `Sample NCLEX question ${i + 1}: Which intervention is most appropriate for a patient with...?`,
  options: [
    'Monitor vital signs every 4 hours',
    'Administer prescribed medication',
    'Notify the physician immediately',
    'Document findings in the chart'
  ],
  correctAnswer: Math.floor(Math.random() * 4),
  explanation: 'This is the correct answer because it addresses the immediate patient safety concern and follows nursing best practices.',
  category: ['management-of-care', 'safety-infection-control', 'pharmacological-therapies', 'reduction-of-risk'][Math.floor(Math.random() * 4)],
  difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
  tags: ['medication', 'patient-safety', 'assessment'],
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  isActive: Math.random() > 0.1,
  rationale: 'Clinical reasoning and evidence-based practice support this intervention.',
  references: ['NCLEX-RN Test Plan', 'Nursing Practice Guidelines']
}));

let mockFlashcards: Flashcard[] = Array.from({ length: 30 }, (_, i) => ({
  id: `f-${i + 1}`,
  front: `Key Concept ${i + 1}: What is the normal range for...?`,
  back: `Answer: The normal range is X-Y. This is important because it helps nurses identify abnormal values and take appropriate action.`,
  category: ['management-of-care', 'safety-infection-control', 'pharmacological-therapies'][Math.floor(Math.random() * 3)],
  difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
  tags: ['vital-signs', 'assessment', 'lab-values'],
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  isActive: true
}));

let mockBooks: Book[] = [
  {
    id: 'b-1',
    title: 'NCLEX-RN Comprehensive Review',
    description: 'Complete review guide for NCLEX-RN preparation',
    author: 'NurseHaven Team',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    category: 'nclex-prep',
    chapters: [],
    totalPages: 450,
    isActive: true,
    isPremium: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-02-15'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= QUESTION ENDPOINTS =============

export async function getAllQuestions(filters: ContentFilters = {}): Promise<PaginatedResponse<Question>> {
  await delay(300);
  
  let filtered = [...mockQuestions];
  
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(query) ||
      q.explanation.toLowerCase().includes(query)
    );
  }
  
  if (filters.category) {
    filtered = filtered.filter(q => q.category === filters.category);
  }
  
  if (filters.difficulty) {
    filtered = filtered.filter(q => q.difficulty === filters.difficulty);
  }
  
  if (filters.isActive !== undefined) {
    filtered = filtered.filter(q => q.isActive === filters.isActive);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(q => 
      filters.tags!.some(tag => q.tags.includes(tag))
    );
  }
  
  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof Question];
      const bVal = b[filters.sortBy as keyof Question];
      if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

export async function getQuestionById(id: string): Promise<Question | null> {
  await delay(200);
  return mockQuestions.find(q => q.id === id) || null;
}

export async function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
  await delay(300);
  
  const newQuestion: Question = {
    ...data,
    id: `q-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockQuestions.push(newQuestion);
  return newQuestion;
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
  await delay(300);
  
  const index = mockQuestions.findIndex(q => q.id === id);
  if (index === -1) throw new Error('Question not found');
  
  mockQuestions[index] = {
    ...mockQuestions[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockQuestions[index];
}

export async function deleteQuestion(id: string): Promise<boolean> {
  await delay(200);
  
  const index = mockQuestions.findIndex(q => q.id === id);
  if (index === -1) throw new Error('Question not found');
  
  mockQuestions.splice(index, 1);
  return true;
}

export async function bulkDeleteQuestions(ids: string[]): Promise<{ deleted: number }> {
  await delay(400);
  
  let deleted = 0;
  ids.forEach(id => {
    const index = mockQuestions.findIndex(q => q.id === id);
    if (index !== -1) {
      mockQuestions.splice(index, 1);
      deleted++;
    }
  });
  
  return { deleted };
}

export async function bulkUpdateQuestions(ids: string[], data: Partial<Question>): Promise<{ updated: number }> {
  await delay(400);
  
  let updated = 0;
  ids.forEach(id => {
    const index = mockQuestions.findIndex(q => q.id === id);
    if (index !== -1) {
      mockQuestions[index] = {
        ...mockQuestions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      updated++;
    }
  });
  
  return { updated };
}

export async function importQuestionsFromFile(file: File): Promise<BulkUploadResult> {
  await delay(1000);
  
  // Simulate file parsing
  const mockImported = Array.from({ length: 10 }, (_, i) => ({
    id: `q-import-${Date.now()}-${i}`,
    question: `Imported question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'Imported explanation',
    category: 'management-of-care',
    difficulty: 'medium' as const,
    tags: ['imported'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true
  }));
  
  mockQuestions.push(...mockImported);
  
  return {
    success: 10,
    failed: 0,
    errors: [],
    imported: mockImported
  };
}

export async function exportQuestionsToCSV(filters: ContentFilters = {}): Promise<string> {
  await delay(500);
  
  const { data } = await getAllQuestions({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['ID', 'Question', 'Category', 'Difficulty', 'Correct Answer', 'Explanation', 'Tags', 'Active'];
  const rows = data.map(q => [
    q.id,
    q.question,
    q.category,
    q.difficulty,
    q.options[q.correctAnswer],
    q.explanation,
    q.tags.join('; '),
    q.isActive ? 'Yes' : 'No'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export async function duplicateQuestion(id: string): Promise<Question> {
  await delay(300);
  
  const original = mockQuestions.find(q => q.id === id);
  if (!original) throw new Error('Question not found');
  
  const duplicate: Question = {
    ...original,
    id: `q-${Date.now()}`,
    question: `${original.question} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockQuestions.push(duplicate);
  return duplicate;
}

// ============= FLASHCARD ENDPOINTS =============

export async function getAllFlashcards(filters: ContentFilters = {}): Promise<PaginatedResponse<Flashcard>> {
  await delay(300);
  
  let filtered = [...mockFlashcards];
  
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(f => 
      f.front.toLowerCase().includes(query) ||
      f.back.toLowerCase().includes(query)
    );
  }
  
  if (filters.category) {
    filtered = filtered.filter(f => f.category === filters.category);
  }
  
  if (filters.difficulty) {
    filtered = filtered.filter(f => f.difficulty === filters.difficulty);
  }
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

export async function getFlashcardById(id: string): Promise<Flashcard | null> {
  await delay(200);
  return mockFlashcards.find(f => f.id === id) || null;
}

export async function createFlashcard(data: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flashcard> {
  await delay(300);
  
  const newFlashcard: Flashcard = {
    ...data,
    id: `f-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockFlashcards.push(newFlashcard);
  return newFlashcard;
}

export async function updateFlashcard(id: string, data: Partial<Flashcard>): Promise<Flashcard> {
  await delay(300);
  
  const index = mockFlashcards.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Flashcard not found');
  
  mockFlashcards[index] = {
    ...mockFlashcards[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return mockFlashcards[index];
}

export async function deleteFlashcard(id: string): Promise<boolean> {
  await delay(200);
  
  const index = mockFlashcards.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Flashcard not found');
  
  mockFlashcards.splice(index, 1);
  return true;
}

export async function bulkDeleteFlashcards(ids: string[]): Promise<{ deleted: number }> {
  await delay(400);
  
  let deleted = 0;
  ids.forEach(id => {
    const index = mockFlashcards.findIndex(f => f.id === id);
    if (index !== -1) {
      mockFlashcards.splice(index, 1);
      deleted++;
    }
  });
  
  return { deleted };
}

export async function importFlashcardsFromFile(file: File): Promise<BulkUploadResult> {
  await delay(1000);
  
  const mockImported = Array.from({ length: 15 }, (_, i) => ({
    id: `f-import-${Date.now()}-${i}`,
    front: `Imported flashcard ${i + 1} - Front`,
    back: `Imported flashcard ${i + 1} - Back`,
    category: 'management-of-care',
    difficulty: 'medium' as const,
    tags: ['imported'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true
  }));
  
  mockFlashcards.push(...mockImported);
  
  return {
    success: 15,
    failed: 0,
    errors: [],
    imported: mockImported
  };
}

export async function exportFlashcardsToCSV(filters: ContentFilters = {}): Promise<string> {
  await delay(500);
  
  const { data } = await getAllFlashcards({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['ID', 'Front', 'Back', 'Category', 'Difficulty', 'Tags', 'Active'];
  const rows = data.map(f => [
    f.id,
    f.front,
    f.back,
    f.category,
    f.difficulty,
    f.tags.join('; '),
    f.isActive ? 'Yes' : 'No'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// ============= BOOK ENDPOINTS =============

export async function getAllBooks(): Promise<Book[]> {
  await delay(300);
  return mockBooks;
}

export async function getBookById(id: string): Promise<Book | null> {
  await delay(200);
  return mockBooks.find(b => b.id === id) || null;
}

export async function createBook(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
  await delay(300);
  
  const newBook: Book = {
    ...data,
    id: `b-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  mockBooks.push(newBook);
  return newBook;
}

export async function updateBook(id: string, data: Partial<Book>): Promise<Book> {
  await delay(300);
  
  const index = mockBooks.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Book not found');
  
  mockBooks[index] = {
    ...mockBooks[index],
    ...data,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  return mockBooks[index];
}

export async function deleteBook(id: string): Promise<boolean> {
  await delay(200);
  
  const index = mockBooks.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Book not found');
  
  mockBooks.splice(index, 1);
  return true;
}

// ============= STATISTICS =============

export async function getContentStats() {
  await delay(200);
  
  return {
    questions: {
      total: mockQuestions.length,
      active: mockQuestions.filter(q => q.isActive).length,
      inactive: mockQuestions.filter(q => !q.isActive).length,
      byCategory: {
        'management-of-care': mockQuestions.filter(q => q.category === 'management-of-care').length,
        'safety-infection-control': mockQuestions.filter(q => q.category === 'safety-infection-control').length,
        'pharmacological-therapies': mockQuestions.filter(q => q.category === 'pharmacological-therapies').length,
        'reduction-of-risk': mockQuestions.filter(q => q.category === 'reduction-of-risk').length
      },
      byDifficulty: {
        easy: mockQuestions.filter(q => q.difficulty === 'easy').length,
        medium: mockQuestions.filter(q => q.difficulty === 'medium').length,
        hard: mockQuestions.filter(q => q.difficulty === 'hard').length
      }
    },
    flashcards: {
      total: mockFlashcards.length,
      active: mockFlashcards.filter(f => f.isActive).length,
      byCategory: {
        'management-of-care': mockFlashcards.filter(f => f.category === 'management-of-care').length,
        'safety-infection-control': mockFlashcards.filter(f => f.category === 'safety-infection-control').length,
        'pharmacological-therapies': mockFlashcards.filter(f => f.category === 'pharmacological-therapies').length
      }
    },
    books: {
      total: mockBooks.length,
      active: mockBooks.filter(b => b.isActive).length,
      premium: mockBooks.filter(b => b.isPremium).length
    }
  };
}

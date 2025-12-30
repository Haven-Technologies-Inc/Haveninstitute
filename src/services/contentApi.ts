/**
 * Content Management API Service
 * Connects to real backend endpoints for questions, flashcards, and books
 */

import api from './api';

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

// Helper to transform backend question to frontend format
function transformQuestion(q: any): Question {
  return {
    id: q.id,
    question: q.questionText || q.question || '',
    options: q.options || [],
    correctAnswer: q.correctOptionIndex ?? q.correctAnswer ?? 0,
    explanation: q.explanation || '',
    category: q.category || '',
    subcategory: q.subcategory,
    difficulty: q.difficulty || 'medium',
    tags: q.tags || [],
    createdAt: q.createdAt || new Date().toISOString(),
    updatedAt: q.updatedAt || new Date().toISOString(),
    createdBy: q.createdBy || 'admin',
    isActive: q.isActive !== false,
    rationale: q.rationale,
    references: q.references
  };
}

// ============= QUESTION ENDPOINTS =============

export async function getAllQuestions(filters: ContentFilters = {}): Promise<PaginatedResponse<Question>> {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 20));
    
    const response = await api.get(`/questions?${params}`);
    const data = response.data.data;
    
    return {
      data: (data.questions || data || []).map(transformQuestion),
      total: data.pagination?.total || data.length || 0,
      page: data.pagination?.page || filters.page || 1,
      limit: data.pagination?.limit || filters.limit || 20,
      totalPages: data.pagination?.totalPages || 1
    };
  } catch (error: any) {
    console.error('Failed to fetch questions:', error);
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  try {
    const response = await api.get(`/questions/${id}`);
    return transformQuestion(response.data.data);
  } catch (error) {
    return null;
  }
}

export async function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
  try {
    const response = await api.post('/questions', {
      questionText: data.question,
      options: data.options,
      correctOptionIndex: data.correctAnswer,
      explanation: data.explanation,
      category: data.category,
      difficulty: data.difficulty,
      tags: data.tags,
      isActive: data.isActive
    });
    return transformQuestion(response.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to create question');
  }
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
  try {
    const response = await api.put(`/questions/${id}`, {
      questionText: data.question,
      options: data.options,
      correctOptionIndex: data.correctAnswer,
      explanation: data.explanation,
      category: data.category,
      difficulty: data.difficulty,
      tags: data.tags,
      isActive: data.isActive
    });
    return transformQuestion(response.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update question');
  }
}

export async function deleteQuestion(id: string): Promise<boolean> {
  try {
    await api.delete(`/questions/${id}`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete question');
  }
}

export async function bulkDeleteQuestions(ids: string[]): Promise<{ deleted: number }> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await deleteQuestion(id);
      deleted++;
    } catch (e) {
      console.error(`Failed to delete question ${id}:`, e);
    }
  }
  return { deleted };
}

export async function bulkUpdateQuestions(ids: string[], data: Partial<Question>): Promise<{ updated: number }> {
  let updated = 0;
  for (const id of ids) {
    try {
      await updateQuestion(id, data);
      updated++;
    } catch (e) {
      console.error(`Failed to update question ${id}:`, e);
    }
  }
  return { updated };
}

export async function importQuestionsFromFile(file: File): Promise<BulkUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/questions/import/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data.data;
  } catch (error: any) {
    return {
      success: 0,
      failed: 1,
      errors: [{ row: 0, error: error.response?.data?.error?.message || 'Import failed' }],
      imported: []
    };
  }
}

export async function exportQuestionsToCSV(filters: ContentFilters = {}): Promise<string> {
  const { data } = await getAllQuestions({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['ID', 'Question', 'Category', 'Difficulty', 'Correct Answer', 'Explanation', 'Tags', 'Active'];
  const rows = data.map(q => [
    q.id,
    `"${q.question.replace(/"/g, '""')}"`,
    q.category,
    q.difficulty,
    q.options[q.correctAnswer] || '',
    `"${(q.explanation || '').replace(/"/g, '""')}"`,
    q.tags.join('; '),
    q.isActive ? 'Yes' : 'No'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export async function duplicateQuestion(id: string): Promise<Question> {
  const original = await getQuestionById(id);
  if (!original) throw new Error('Question not found');
  
  return createQuestion({
    ...original,
    question: `${original.question} (Copy)`
  });
}

// Helper to transform backend flashcard to frontend format
function transformFlashcard(f: any): Flashcard {
  return {
    id: f.id,
    front: f.front || f.question || '',
    back: f.back || f.answer || '',
    category: f.category || '',
    subcategory: f.subcategory,
    difficulty: f.difficulty || 'medium',
    tags: f.tags || [],
    createdAt: f.createdAt || new Date().toISOString(),
    updatedAt: f.updatedAt || new Date().toISOString(),
    createdBy: f.createdBy || f.userId || 'admin',
    isActive: f.isActive !== false
  };
}

// ============= FLASHCARD ENDPOINTS =============

export async function getAllFlashcards(filters: ContentFilters = {}): Promise<PaginatedResponse<Flashcard>> {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    params.append('includePublic', 'true');
    
    const response = await api.get(`/flashcards/decks?${params}`);
    const decks = response.data.data || [];
    
    // Flatten all cards from all decks
    const allCards: Flashcard[] = [];
    for (const deck of decks) {
      if (deck.cards) {
        allCards.push(...deck.cards.map(transformFlashcard));
      }
    }
    
    // Apply client-side filtering
    let filtered = allCards;
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(f => 
        f.front.toLowerCase().includes(query) ||
        f.back.toLowerCase().includes(query)
      );
    }
    if (filters.difficulty) {
      filtered = filtered.filter(f => f.difficulty === filters.difficulty);
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  } catch (error: any) {
    console.error('Failed to fetch flashcards:', error);
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function getFlashcardById(id: string): Promise<Flashcard | null> {
  try {
    // Flashcards are nested in decks, so we need to search
    const { data } = await getAllFlashcards({ page: 1, limit: 1000 });
    return data.find(f => f.id === id) || null;
  } catch (error) {
    return null;
  }
}

export async function createFlashcard(data: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flashcard> {
  try {
    // Need to create in a deck - use default deck or create one
    const response = await api.post('/flashcards/decks', {
      name: 'Quick Cards',
      description: 'Quick created cards',
      category: data.category,
      isPublic: false
    });
    const deck = response.data.data;
    
    const cardResponse = await api.post(`/flashcards/decks/${deck.id}/cards`, {
      front: data.front,
      back: data.back,
      difficulty: data.difficulty,
      tags: data.tags
    });
    
    return transformFlashcard(cardResponse.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to create flashcard');
  }
}

export async function updateFlashcard(id: string, data: Partial<Flashcard>): Promise<Flashcard> {
  try {
    const response = await api.put(`/flashcards/cards/${id}`, {
      front: data.front,
      back: data.back,
      difficulty: data.difficulty,
      tags: data.tags
    });
    return transformFlashcard(response.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update flashcard');
  }
}

export async function deleteFlashcard(id: string): Promise<boolean> {
  try {
    await api.delete(`/flashcards/cards/${id}`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete flashcard');
  }
}

export async function bulkDeleteFlashcards(ids: string[]): Promise<{ deleted: number }> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await deleteFlashcard(id);
      deleted++;
    } catch (e) {
      console.error(`Failed to delete flashcard ${id}:`, e);
    }
  }
  return { deleted };
}

export async function importFlashcardsFromFile(_file: File): Promise<BulkUploadResult> {
  // TODO: Implement file import when backend supports it
  return {
    success: 0,
    failed: 1,
    errors: [{ row: 0, error: 'File import not yet implemented' }],
    imported: []
  };
}

export async function exportFlashcardsToCSV(filters: ContentFilters = {}): Promise<string> {
  const { data } = await getAllFlashcards({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['ID', 'Front', 'Back', 'Category', 'Difficulty', 'Tags', 'Active'];
  const rows = data.map(f => [
    f.id,
    `"${f.front.replace(/"/g, '""')}"`,
    `"${f.back.replace(/"/g, '""')}"`,
    f.category,
    f.difficulty,
    f.tags.join('; '),
    f.isActive ? 'Yes' : 'No'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Helper to transform backend book to frontend format
function transformBook(b: any): Book {
  return {
    id: b.id,
    title: b.title || '',
    description: b.description || '',
    author: b.author || '',
    coverImage: b.coverImageUrl || b.coverImage || '',
    category: b.category || '',
    chapters: b.chapters || [],
    totalPages: b.pageCount || b.totalPages || 0,
    isActive: b.isActive !== false,
    isPremium: b.isPremiumOnly || b.isPremium || false,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: b.updatedAt || new Date().toISOString()
  };
}

// ============= BOOK ENDPOINTS =============

export async function getAllBooks(): Promise<Book[]> {
  try {
    const response = await api.get('/books');
    const data = response.data.data;
    return (data.books || data || []).map(transformBook);
  } catch (error: any) {
    console.error('Failed to fetch books:', error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const response = await api.get(`/books/${id}`);
    return transformBook(response.data.data);
  } catch (error) {
    return null;
  }
}

export async function createBook(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
  try {
    const response = await api.post('/books', {
      title: data.title,
      description: data.description,
      author: data.author,
      coverImageUrl: data.coverImage,
      category: data.category,
      pageCount: data.totalPages,
      isActive: data.isActive,
      isPremiumOnly: data.isPremium
    });
    return transformBook(response.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to create book');
  }
}

export async function updateBook(id: string, data: Partial<Book>): Promise<Book> {
  try {
    const response = await api.put(`/books/${id}`, {
      title: data.title,
      description: data.description,
      author: data.author,
      coverImageUrl: data.coverImage,
      category: data.category,
      pageCount: data.totalPages,
      isActive: data.isActive,
      isPremiumOnly: data.isPremium
    });
    return transformBook(response.data.data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to update book');
  }
}

export async function deleteBook(id: string): Promise<boolean> {
  try {
    await api.delete(`/books/${id}`);
    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete book');
  }
}

// ============= STATISTICS =============

export async function getContentStats() {
  try {
    // Fetch real stats from backend
    const [questionsRes, flashcardsRes, booksRes] = await Promise.all([
      getAllQuestions({ page: 1, limit: 1 }),
      getAllFlashcards({ page: 1, limit: 1 }),
      getAllBooks()
    ]);

    // Get question statistics from backend
    let questionStats = { total: 0, byCategory: {}, byDifficulty: {} };
    try {
      const statsRes = await api.get('/questions/statistics');
      questionStats = statsRes.data.data || questionStats;
    } catch (e) {
      // Use totals from pagination
      questionStats.total = questionsRes.total;
    }

    return {
      questions: {
        total: questionStats.total || questionsRes.total,
        active: questionStats.total || questionsRes.total,
        inactive: 0,
        byCategory: questionStats.byCategory || {},
        byDifficulty: questionStats.byDifficulty || {}
      },
      flashcards: {
        total: flashcardsRes.total,
        active: flashcardsRes.total,
        byCategory: {}
      },
      books: {
        total: booksRes.length,
        active: booksRes.filter(b => b.isActive).length,
        premium: booksRes.filter(b => b.isPremium).length
      }
    };
  } catch (error) {
    console.error('Failed to fetch content stats:', error);
    return {
      questions: { total: 0, active: 0, inactive: 0, byCategory: {}, byDifficulty: {} },
      flashcards: { total: 0, active: 0, byCategory: {} },
      books: { total: 0, active: 0, premium: 0 }
    };
  }
}

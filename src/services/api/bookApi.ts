/**
 * Book API Service
 * 
 * Frontend API client for book/e-book endpoints
 */

import apiClient from './client';

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  category: string;
  format: 'epub' | 'pdf';
  pageCount?: number;
  publishedAt?: string;
  price?: number;
  isFree: boolean;
  isPublished: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastReadAt?: string;
  highlights?: Highlight[];
  bookmarks?: Bookmark[];
  notes?: Note[];
  rating?: number;
  review?: string;
  book?: Book;
}

export interface Highlight {
  id: string;
  page: number;
  text: string;
  color: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  page: number;
  title?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  page: number;
  content: string;
  createdAt: string;
}

export interface BookFilters {
  category?: string;
  search?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

// Public endpoints
export const getBooks = async (filters?: BookFilters) => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.isFree !== undefined) params.append('isFree', String(filters.isFree));
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  
  const response = await apiClient.get(`/books?${params.toString()}`);
  return response.data;
};

export const getBookById = async (bookId: string) => {
  const response = await apiClient.get(`/books/${bookId}`);
  return response.data;
};

export const getBookCategories = async () => {
  const response = await apiClient.get('/books/categories');
  return response.data;
};

// User library endpoints
export const getUserLibrary = async () => {
  const response = await apiClient.get('/books/library');
  return response.data;
};

export const addToLibrary = async (bookId: string) => {
  const response = await apiClient.post(`/books/${bookId}/library`);
  return response.data;
};

export const removeFromLibrary = async (bookId: string) => {
  const response = await apiClient.delete(`/books/${bookId}/library`);
  return response.data;
};

// Progress tracking
export const updateProgress = async (bookId: string, data: { currentPage: number; totalPages?: number }) => {
  const response = await apiClient.put(`/books/${bookId}/progress`, data);
  return response.data;
};

export const getProgress = async (bookId: string) => {
  const response = await apiClient.get(`/books/${bookId}/progress`);
  return response.data;
};

// Highlights
export const addHighlight = async (bookId: string, highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
  const response = await apiClient.post(`/books/${bookId}/highlights`, highlight);
  return response.data;
};

export const removeHighlight = async (bookId: string, highlightId: string) => {
  const response = await apiClient.delete(`/books/${bookId}/highlights/${highlightId}`);
  return response.data;
};

// Bookmarks
export const addBookmark = async (bookId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
  const response = await apiClient.post(`/books/${bookId}/bookmarks`, bookmark);
  return response.data;
};

export const removeBookmark = async (bookId: string, bookmarkId: string) => {
  const response = await apiClient.delete(`/books/${bookId}/bookmarks/${bookmarkId}`);
  return response.data;
};

// Notes
export const addNote = async (bookId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
  const response = await apiClient.post(`/books/${bookId}/notes`, note);
  return response.data;
};

export const updateNote = async (bookId: string, noteId: string, content: string) => {
  const response = await apiClient.put(`/books/${bookId}/notes/${noteId}`, { content });
  return response.data;
};

export const removeNote = async (bookId: string, noteId: string) => {
  const response = await apiClient.delete(`/books/${bookId}/notes/${noteId}`);
  return response.data;
};

// Ratings
export const rateBook = async (bookId: string, rating: number, review?: string) => {
  const response = await apiClient.post(`/books/${bookId}/rating`, { rating, review });
  return response.data;
};

// Admin endpoints
export const createBook = async (data: Partial<Book>) => {
  const response = await apiClient.post('/books/admin', data);
  return response.data;
};

export const updateBook = async (bookId: string, data: Partial<Book>) => {
  const response = await apiClient.put(`/books/admin/${bookId}`, data);
  return response.data;
};

export const deleteBook = async (bookId: string) => {
  const response = await apiClient.delete(`/books/admin/${bookId}`);
  return response.data;
};

export const getBookStats = async () => {
  const response = await apiClient.get('/books/admin/stats');
  return response.data;
};

export default {
  getBooks,
  getBookById,
  getBookCategories,
  getUserLibrary,
  addToLibrary,
  removeFromLibrary,
  updateProgress,
  getProgress,
  addHighlight,
  removeHighlight,
  addBookmark,
  removeBookmark,
  addNote,
  updateNote,
  removeNote,
  rateBook,
  createBook,
  updateBook,
  deleteBook,
  getBookStats,
};

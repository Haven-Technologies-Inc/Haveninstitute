import { apiClient } from './client';

export interface SearchResult {
  id: string;
  type: 'user' | 'question' | 'book' | 'flashcard' | 'post' | 'study-group';
  title: string;
  subtitle?: string;
  icon?: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface SearchFilters {
  types?: ('user' | 'question' | 'book' | 'flashcard' | 'post' | 'study-group')[];
  limit?: number;
}

/**
 * Global search API for searching across all content types
 */
export const searchApi = {
  /**
   * Perform a global search across all content types
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0, query };
    }

    try {
      const response = await apiClient.get('/search', {
        params: {
          q: query,
          types: filters?.types?.join(','),
          limit: filters?.limit || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      // Return empty results on error instead of throwing
      return { results: [], total: 0, query };
    }
  },

  /**
   * Search users only (admin)
   */
  async searchUsers(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      const response = await apiClient.get('/api/admin/users/search', {
        params: { q: query, limit }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('User search error:', error);
      return [];
    }
  },

  /**
   * Search questions only
   */
  async searchQuestions(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      const response = await apiClient.get('/api/questions/search', {
        params: { q: query, limit }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Question search error:', error);
      return [];
    }
  },

  /**
   * Search books only
   */
  async searchBooks(query: string, limit = 5): Promise<SearchResult[]> {
    try {
      const response = await apiClient.get('/api/books/search', {
        params: { q: query, limit }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Book search error:', error);
      return [];
    }
  },

  /**
   * Get recent searches for a user
   */
  getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save a search query to recent searches
   */
  saveRecentSearch(query: string): void {
    try {
      const stored = localStorage.getItem('recentSearches');
      const recent: string[] = stored ? JSON.parse(stored) : [];
      
      // Remove if exists and add to front
      const filtered = recent.filter(q => q.toLowerCase() !== query.toLowerCase());
      filtered.unshift(query);
      
      // Keep only last 5
      const trimmed = filtered.slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(trimmed));
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    localStorage.removeItem('recentSearches');
  }
};

export default searchApi;

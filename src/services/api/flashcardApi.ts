import api from '../api';

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  isPublic: boolean;
  cardCount: number;
  color?: string;
  icon?: string;
  createdBy: string;
  creator?: { id: string; fullName: string };
  progress?: DeckProgress;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  notes?: string;
  imageUrl?: string;
  tags?: string[];
  position: number;
  progress?: CardProgress | null;
}

export interface CardProgress {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview?: string;
  lastReviewed?: string;
  timesReviewed: number;
  timesCorrect: number;
  masteryLevel: 'new' | 'learning' | 'reviewing' | 'mastered';
}

export interface DeckProgress {
  total: number;
  studied: number;
  mastered: number;
  learning: number;
  reviewing: number;
  due: number;
  accuracy: number;
}

export interface FlashcardStats {
  totalDecks: number;
  totalCards: number;
  cardsStudied: number;
  cardsMastered: number;
  cardsDue: number;
  reviewedToday: number;
  overallAccuracy: number;
  streakDays: number;
}

export interface ReviewResult {
  flashcardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface CreateDeckInput {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  color?: string;
  icon?: string;
}

export interface CreateCardInput {
  front: string;
  back: string;
  notes?: string;
  imageUrl?: string;
  tags?: string[];
}

export const flashcardApi = {
  // ==================== DECK OPERATIONS ====================
  
  async getDecks(options?: { includePublic?: boolean; category?: string }): Promise<FlashcardDeck[]> {
    const params = new URLSearchParams();
    if (options?.includePublic) params.append('includePublic', 'true');
    if (options?.category) params.append('category', options.category);
    
    const response = await api.get(`/flashcards/decks?${params.toString()}`);
    return response.data.data;
  },

  async getDeckById(id: string): Promise<FlashcardDeck & { cards: Flashcard[] }> {
    const response = await api.get(`/flashcards/decks/${id}`);
    return response.data.data;
  },

  async createDeck(input: CreateDeckInput): Promise<FlashcardDeck> {
    const response = await api.post('/flashcards/decks', input);
    return response.data.data;
  },

  async updateDeck(id: string, input: Partial<CreateDeckInput>): Promise<FlashcardDeck> {
    const response = await api.put(`/flashcards/decks/${id}`, input);
    return response.data.data;
  },

  async deleteDeck(id: string): Promise<void> {
    await api.delete(`/flashcards/decks/${id}`);
  },

  // ==================== CARD OPERATIONS ====================

  async getCards(deckId: string): Promise<Flashcard[]> {
    const response = await api.get(`/flashcards/decks/${deckId}/cards`);
    return response.data.data;
  },

  async createCard(deckId: string, input: CreateCardInput): Promise<Flashcard> {
    const response = await api.post(`/flashcards/decks/${deckId}/cards`, input);
    return response.data.data;
  },

  async bulkCreateCards(deckId: string, cards: CreateCardInput[]): Promise<{ created: number; cards: Flashcard[] }> {
    const response = await api.post(`/flashcards/decks/${deckId}/cards/bulk`, { cards });
    return response.data.data;
  },

  async updateCard(cardId: string, input: Partial<CreateCardInput>): Promise<Flashcard> {
    const response = await api.put(`/flashcards/cards/${cardId}`, input);
    return response.data.data;
  },

  async deleteCard(cardId: string): Promise<void> {
    await api.delete(`/flashcards/cards/${cardId}`);
  },

  // ==================== STUDY SESSION ====================

  async getStudySession(deckId: string, limit = 20): Promise<Flashcard[]> {
    const response = await api.get(`/flashcards/decks/${deckId}/study?limit=${limit}`);
    return response.data.data;
  },

  async submitReview(results: ReviewResult[]): Promise<{ reviewed: number }> {
    const response = await api.post('/flashcards/review', { results });
    return response.data.data;
  },

  // ==================== STATS ====================

  async getDeckProgress(deckId: string): Promise<DeckProgress> {
    const response = await api.get(`/flashcards/decks/${deckId}/progress`);
    return response.data.data;
  },

  async getStats(): Promise<FlashcardStats> {
    const response = await api.get('/flashcards/stats');
    return response.data.data;
  },
};

export default flashcardApi;

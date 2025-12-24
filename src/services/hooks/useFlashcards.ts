import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardApi, CreateDeckInput, CreateCardInput, ReviewResult } from '../api/flashcardApi';

// Query keys
export const flashcardKeys = {
  all: ['flashcards'] as const,
  decks: () => [...flashcardKeys.all, 'decks'] as const,
  deck: (id: string) => [...flashcardKeys.all, 'deck', id] as const,
  cards: (deckId: string) => [...flashcardKeys.all, 'cards', deckId] as const,
  studySession: (deckId: string) => [...flashcardKeys.all, 'study', deckId] as const,
  stats: () => [...flashcardKeys.all, 'stats'] as const,
  progress: (deckId: string) => [...flashcardKeys.all, 'progress', deckId] as const,
};

// Get all decks
export function useDecks(options?: { includePublic?: boolean; category?: string }) {
  return useQuery({
    queryKey: [...flashcardKeys.decks(), options],
    queryFn: () => flashcardApi.getDecks(options),
  });
}

// Get single deck with cards
export function useDeck(id: string) {
  return useQuery({
    queryKey: flashcardKeys.deck(id),
    queryFn: () => flashcardApi.getDeckById(id),
    enabled: !!id,
  });
}

// Get cards for a deck
export function useCards(deckId: string) {
  return useQuery({
    queryKey: flashcardKeys.cards(deckId),
    queryFn: () => flashcardApi.getCards(deckId),
    enabled: !!deckId,
  });
}

// Get study session
export function useStudySession(deckId: string, limit = 20) {
  return useQuery({
    queryKey: flashcardKeys.studySession(deckId),
    queryFn: () => flashcardApi.getStudySession(deckId, limit),
    enabled: !!deckId,
  });
}

// Get flashcard stats
export function useFlashcardStats() {
  return useQuery({
    queryKey: flashcardKeys.stats(),
    queryFn: () => flashcardApi.getStats(),
  });
}

// Get deck progress
export function useDeckProgress(deckId: string) {
  return useQuery({
    queryKey: flashcardKeys.progress(deckId),
    queryFn: () => flashcardApi.getDeckProgress(deckId),
    enabled: !!deckId,
  });
}

// Create deck mutation
export function useCreateDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateDeckInput) => flashcardApi.createDeck(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.stats() });
    },
  });
}

// Update deck mutation
export function useUpdateDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateDeckInput> }) =>
      flashcardApi.updateDeck(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.deck(id) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() });
    },
  });
}

// Delete deck mutation
export function useDeleteDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => flashcardApi.deleteDeck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.stats() });
    },
  });
}

// Create card mutation
export function useCreateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deckId, input }: { deckId: string; input: CreateCardInput }) =>
      flashcardApi.createCard(deckId, input),
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.deck(deckId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() });
    },
  });
}

// Bulk create cards mutation
export function useBulkCreateCards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deckId, cards }: { deckId: string; cards: CreateCardInput[] }) =>
      flashcardApi.bulkCreateCards(deckId, cards),
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.cards(deckId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.deck(deckId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() });
    },
  });
}

// Update card mutation
export function useUpdateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cardId, input }: { cardId: string; input: Partial<CreateCardInput> }) =>
      flashcardApi.updateCard(cardId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.all });
    },
  });
}

// Delete card mutation
export function useDeleteCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cardId: string) => flashcardApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.all });
    },
  });
}

// Submit review mutation
export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (results: ReviewResult[]) => flashcardApi.submitReview(results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.all });
    },
  });
}

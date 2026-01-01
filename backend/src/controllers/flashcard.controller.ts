import { Request, Response } from 'express';
import { flashcardService } from '../services/flashcard.service';
import { AuthRequest } from '../middleware/authenticate';

export class FlashcardController {
  // Get all decks for user
  static async getDecks(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { category, isPublic } = req.query;

      const decks = await flashcardService.getUserDecks(userId, {
        categoryId: category ? parseInt(category as string) : undefined,
        isPublic: isPublic === 'true',
      });

      return ResponseHandler.success(res, decks);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get single deck with cards
  static async getDeck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deck = await flashcardService.getDeckWithCards(id);

      if (!deck) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found', 404);
      }

      return ResponseHandler.success(res, deck);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Create new deck
  static async createDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { title, description, categoryId, isPublic, tags } = req.body;

      const deck = await flashcardService.createDeck({
        userId,
        title,
        description,
        categoryId,
        isPublic: isPublic || false,
        tags,
      });

      return ResponseHandler.success(res, deck, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update deck
  static async updateDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updates = req.body;

      const deck = await flashcardService.updateDeck(id, userId, updates);

      if (!deck) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found or unauthorized', 404);
      }

      return ResponseHandler.success(res, deck);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Delete deck
  static async deleteDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const success = await flashcardService.deleteDeck(id, userId);

      if (!success) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found or unauthorized', 404);
      }

      return ResponseHandler.success(res, { message: 'Deck deleted' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Add card to deck
  static async addCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { deckId } = req.params;
      const { frontContent, backContent, hints, tags, difficulty } = req.body;

      const card = await flashcardService.addCard(deckId, userId, {
        frontContent,
        backContent,
        hints,
        tags,
        difficulty,
      });

      if (!card) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found or unauthorized', 404);
      }

      return ResponseHandler.success(res, card, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update card
  static async updateCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { cardId } = req.params;
      const updates = req.body;

      const card = await flashcardService.updateCard(cardId, userId, updates);

      if (!card) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Card not found or unauthorized', 404);
      }

      return ResponseHandler.success(res, card);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Delete card
  static async deleteCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { cardId } = req.params;

      const success = await flashcardService.deleteCard(cardId, userId);

      if (!success) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Card not found or unauthorized', 404);
      }

      return ResponseHandler.success(res, { message: 'Card deleted' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get cards due for review (SRS)
  static async getDueCards(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { deckId, limit = '20' } = req.query;

      const cards = await flashcardService.getDueCards(
        userId,
        deckId as string | undefined,
        parseInt(limit as string)
      );

      return ResponseHandler.success(res, cards);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Submit card review (SRS update)
  static async submitReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { cardId } = req.params;
      const { quality, responseTimeMs } = req.body;

      const progress = await flashcardService.submitReview(userId, cardId, {
        quality, // 0-5 scale
        responseTimeMs,
      });

      return ResponseHandler.success(res, progress);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get user's flashcard progress
  static async getProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { deckId } = req.query;

      const progress = await flashcardService.getUserProgress(
        userId,
        deckId as string | undefined
      );

      return ResponseHandler.success(res, progress);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get public decks
  static async getPublicDecks(req: AuthRequest, res: Response) {
    try {
      const { category, search, page = '1', limit = '20' } = req.query;

      const result = await flashcardService.getPublicDecks({
        categoryId: category ? parseInt(category as string) : undefined,
        search: search as string | undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Clone public deck
  static async cloneDeck(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deck = await flashcardService.cloneDeck(id, userId);

      if (!deck) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found or not public', 404);
      }

      return ResponseHandler.success(res, deck, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }
}

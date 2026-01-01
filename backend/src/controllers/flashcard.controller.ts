import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { ResponseHandler } from '../utils/response';
import { flashcardService } from '../services/flashcard.service';

export class FlashcardController {
  // Get all decks for user
  static async getDecks(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await flashcardService.getUserDecks(userId, {
        page: Number(page),
        limit: Number(limit)
      });

      return ResponseHandler.success(res, result);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Get single deck with cards
  static async getDeck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      
      const deck = await flashcardService.getDeckById(id, userId);
      
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
      const { title, description, category } = req.body;

      if (!title) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Title is required', 400);
      }

      const deck = await flashcardService.createDeck(userId, {
        title,
        description,
        category
      });

      return ResponseHandler.success(res, deck, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Update deck
  static async updateDeck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { title, description, category } = req.body;

      const deck = await flashcardService.updateDeck(id, userId, {
        title,
        description,
        category
      });

      if (!deck) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found', 404);
      }

      return ResponseHandler.success(res, deck);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Delete deck
  static async deleteDeck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const deleted = await flashcardService.deleteDeck(id, userId);
      
      if (!deleted) {
        return ResponseHandler.error(res, 'NOT_FOUND', 'Deck not found', 404);
      }

      return ResponseHandler.success(res, { message: 'Deck deleted successfully' });
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Add card to deck
  static async addCard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { front, back, difficulty } = req.body;

      if (!front || !back) {
        return ResponseHandler.error(res, 'VALIDATION_ERROR', 'Front and back are required', 400);
      }

      const card = await flashcardService.addCard(id, userId, {
        front,
        back,
        difficulty
      });

      return ResponseHandler.success(res, card, 201);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Study session
  static async studySession(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { count = 10 } = req.query;

      const session = await flashcardService.createStudySession(id, userId, {
        cardCount: Number(count)
      });

      return ResponseHandler.success(res, session);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Submit study result
  static async submitStudyResult(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { cardId, result, timeSpent } = req.body;

      const studyResult = await flashcardService.submitStudyResult(id, userId, {
        cardId,
        result,
        timeSpent
      });

      return ResponseHandler.success(res, studyResult);
    } catch (error: any) {
      return ResponseHandler.error(res, 'INTERNAL_ERROR', error.message, 500);
    }
  }

  // Health check for flashcards
  static async health(req: Request, res: Response) {
    return ResponseHandler.success(res, { status: 'Flashcard service operational' });
  }
}

export default FlashcardController;

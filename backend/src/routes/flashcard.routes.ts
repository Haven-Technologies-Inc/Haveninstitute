import { Router, Request, Response } from 'express';
import { flashcardService } from '../services/flashcard.service';
import { flashcardGeneratorService } from '../services/flashcardGenerator.service';
import { authenticate } from '../middleware/authenticate';
import { ResponseHandler, errorCodes } from '../utils/response';

interface AuthRequest extends Request {
  user?: { id: string };
  userId?: string;
}

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== DECK ROUTES ====================

// Get all decks
router.get('/decks', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const includePublic = req.query.includePublic === 'true';
    const category = req.query.category as string;

    const decks = await flashcardService.getDecks(userId, { includePublic, category });
    return ResponseHandler.success(res, decks);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get decks', 500);
  }
});

// Get single deck
router.get('/decks/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const deck = await flashcardService.getDeckById(req.params.id, userId);
    return ResponseHandler.success(res, deck);
  } catch (error) {
    if (error instanceof Error && error.message === 'Deck not found') {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Deck not found', 404);
    }
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get deck', 500);
  }
});

// Create deck
router.post('/decks', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const deck = await flashcardService.createDeck(userId, req.body);
    return ResponseHandler.success(res, deck, 201);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to create deck', 400);
  }
});

// Update deck
router.put('/decks/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const deck = await flashcardService.updateDeck(req.params.id, userId, req.body);
    return ResponseHandler.success(res, deck);
  } catch (error) {
    if (error instanceof Error && error.message === 'Deck not found') {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Deck not found', 404);
    }
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to update deck', 500);
  }
});

// Delete deck
router.delete('/decks/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await flashcardService.deleteDeck(req.params.id, userId);
    return ResponseHandler.success(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Deck not found') {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Deck not found', 404);
    }
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete deck', 500);
  }
});

// ==================== CARD ROUTES ====================

// Get cards in deck
router.get('/decks/:deckId/cards', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cards = await flashcardService.getCards(req.params.deckId, userId);
    return ResponseHandler.success(res, cards);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get cards', 500);
  }
});

// Create card
router.post('/decks/:deckId/cards', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const card = await flashcardService.createCard(req.params.deckId, userId, req.body);
    return ResponseHandler.success(res, card, 201);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to create card', 400);
  }
});

// Bulk create cards
router.post('/decks/:deckId/cards/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { cards } = req.body;
    if (!Array.isArray(cards)) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'Cards array required', 400);
    }
    const created = await flashcardService.bulkCreateCards(req.params.deckId, userId, cards);
    return ResponseHandler.success(res, { created: created.length, cards: created }, 201);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to create cards', 400);
  }
});

// Update card
router.put('/cards/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const card = await flashcardService.updateCard(req.params.id, userId, req.body);
    return ResponseHandler.success(res, card);
  } catch (error) {
    if (error instanceof Error && error.message === 'Card not found') {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Card not found', 404);
    }
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to update card', 500);
  }
});

// Delete card
router.delete('/cards/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await flashcardService.deleteCard(req.params.id, userId);
    return ResponseHandler.success(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Card not found') {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Card not found', 404);
    }
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete card', 500);
  }
});

// ==================== STUDY SESSION ROUTES ====================

// Get study session (cards due for review)
router.get('/decks/:deckId/study', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const cards = await flashcardService.getStudySession(req.params.deckId, userId, limit);
    return ResponseHandler.success(res, cards);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get study session', 500);
  }
});

// Submit review results
router.post('/review', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { results } = req.body;
    if (!Array.isArray(results)) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'Results array required', 400);
    }
    const reviewResult = await flashcardService.submitReview(userId, results);
    return ResponseHandler.success(res, reviewResult);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to submit review', 500);
  }
});

// ==================== STATS ROUTES ====================

// Get deck progress
router.get('/decks/:deckId/progress', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const progress = await flashcardService.getDeckProgress(req.params.deckId, userId);
    return ResponseHandler.success(res, progress);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get progress', 500);
  }
});

// Get user flashcard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const stats = await flashcardService.getUserFlashcardStats(userId);
    return ResponseHandler.success(res, stats);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get stats', 500);
  }
});

// ==================== AI GENERATION ROUTES ====================

// Start AI flashcard generation
router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { 
      totalCards, 
      categories, 
      cardTypes, 
      topics, 
      difficulty,
      deckTitle,
      deckDescription 
    } = req.body;

    // Validate request
    if (!totalCards || totalCards < 5 || totalCards > 200) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'Total cards must be between 5 and 200', 400);
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'At least one category is required', 400);
    }

    if (!cardTypes || !Array.isArray(cardTypes) || cardTypes.length === 0) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, 'At least one card type is required', 400);
    }

    const jobId = await flashcardGeneratorService.startGeneration(userId, {
      totalCards,
      categories,
      cardTypes,
      topics,
      difficulty: difficulty || 'intermediate',
      deckTitle,
      deckDescription
    });

    return ResponseHandler.success(res, { jobId, message: 'Flashcard generation started' }, 202);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to start generation', 500);
  }
});

// Get generation job status
router.get('/generate/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = flashcardGeneratorService.getJobStatus(jobId);

    if (!job) {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Job not found', 404);
    }

    return ResponseHandler.success(res, job);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get job status', 500);
  }
});

// Cancel generation job
router.delete('/generate/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const cancelled = flashcardGeneratorService.cancelJob(jobId);

    if (!cancelled) {
      return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Job not found or cannot be cancelled', 404);
    }

    return ResponseHandler.success(res, { message: 'Generation cancelled' });
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to cancel job', 500);
  }
});

// Get user's generation jobs
router.get('/generate/jobs/list', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const jobs = flashcardGeneratorService.getUserJobs(userId);
    return ResponseHandler.success(res, jobs);
  } catch (error) {
    return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to get jobs', 500);
  }
});

export default router;

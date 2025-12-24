import { Op } from 'sequelize';
import { FlashcardDeck, Flashcard, UserFlashcardProgress } from '../models/Flashcard';
import { StudyActivity } from '../models/StudyActivity';
import { User } from '../models/User';

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

export interface ReviewResult {
  flashcardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality rating
}

class FlashcardService {
  // ==================== DECK OPERATIONS ====================

  async getDecks(userId: string, options?: { includePublic?: boolean; category?: string }) {
    const where: any = { isActive: true };
    
    if (options?.includePublic) {
      where[Op.or] = [{ createdBy: userId }, { isPublic: true }];
    } else {
      where.createdBy = userId;
    }

    if (options?.category) {
      where.category = options.category;
    }

    const decks = await FlashcardDeck.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'fullName'] }],
      order: [['updatedAt', 'DESC']],
    });

    // Get progress stats for each deck
    const decksWithProgress = await Promise.all(
      decks.map(async (deck) => {
        const stats = await this.getDeckProgress(deck.id, userId);
        return {
          ...deck.toJSON(),
          progress: stats,
        };
      })
    );

    return decksWithProgress;
  }

  async getDeckById(deckId: string, userId: string) {
    const deck = await FlashcardDeck.findByPk(deckId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'fullName'] },
        { model: Flashcard, as: 'cards', where: { isActive: true }, required: false },
      ],
    });

    if (!deck) throw new Error('Deck not found');
    if (!deck.isPublic && deck.createdBy !== userId) {
      throw new Error('Access denied');
    }

    const progress = await this.getDeckProgress(deckId, userId);
    return { ...deck.toJSON(), progress };
  }

  async createDeck(userId: string, input: CreateDeckInput) {
    const deck = await FlashcardDeck.create({
      ...input,
      createdBy: userId,
    } as any);

    return deck;
  }

  async updateDeck(deckId: string, userId: string, input: Partial<CreateDeckInput>) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (deck.createdBy !== userId) throw new Error('Access denied');

    await deck.update(input);
    return deck;
  }

  async deleteDeck(deckId: string, userId: string) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (deck.createdBy !== userId) throw new Error('Access denied');

    await deck.update({ isActive: false });
    return { message: 'Deck deleted' };
  }

  // ==================== CARD OPERATIONS ====================

  async getCards(deckId: string, userId: string) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (!deck.isPublic && deck.createdBy !== userId) {
      throw new Error('Access denied');
    }

    const cards = await Flashcard.findAll({
      where: { deckId, isActive: true },
      order: [['position', 'ASC']],
    });

    // Get progress for each card
    const cardsWithProgress = await Promise.all(
      cards.map(async (card) => {
        const progress = await UserFlashcardProgress.findOne({
          where: { userId, flashcardId: card.id },
        });
        return {
          ...card.toJSON(),
          progress: progress?.toJSON() || null,
        };
      })
    );

    return cardsWithProgress;
  }

  async createCard(deckId: string, userId: string, input: CreateCardInput) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (deck.createdBy !== userId) throw new Error('Access denied');

    const maxPosition = await Flashcard.max('position', { where: { deckId } }) || 0;

    const card = await Flashcard.create({
      ...input,
      deckId,
      position: (maxPosition as number) + 1,
    } as any);

    await deck.update({ cardCount: deck.cardCount + 1 });
    return card;
  }

  async updateCard(cardId: string, userId: string, input: Partial<CreateCardInput>) {
    const card = await Flashcard.findByPk(cardId, {
      include: [{ model: FlashcardDeck, as: 'deck' }],
    });
    if (!card) throw new Error('Card not found');
    if (card.deck?.createdBy !== userId) throw new Error('Access denied');

    await card.update(input);
    return card;
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await Flashcard.findByPk(cardId, {
      include: [{ model: FlashcardDeck, as: 'deck' }],
    });
    if (!card) throw new Error('Card not found');
    if (card.deck?.createdBy !== userId) throw new Error('Access denied');

    await card.update({ isActive: false });
    
    if (card.deck) {
      await card.deck.update({ cardCount: Math.max(0, card.deck.cardCount - 1) });
    }

    return { message: 'Card deleted' };
  }

  async bulkCreateCards(deckId: string, userId: string, cards: CreateCardInput[]) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (deck.createdBy !== userId) throw new Error('Access denied');

    const maxPosition = (await Flashcard.max('position', { where: { deckId } }) || 0) as number;

    const cardsToCreate = cards.map((card, index) => ({
      ...card,
      deckId,
      position: maxPosition + index + 1,
    }));

    const createdCards = await Flashcard.bulkCreate(cardsToCreate as any[]);
    await deck.update({ cardCount: deck.cardCount + cards.length });

    return createdCards;
  }

  // ==================== STUDY SESSION ====================

  async getStudySession(deckId: string, userId: string, limit = 20) {
    const deck = await FlashcardDeck.findByPk(deckId);
    if (!deck) throw new Error('Deck not found');
    if (!deck.isPublic && deck.createdBy !== userId) {
      throw new Error('Access denied');
    }

    const now = new Date();

    // Get cards due for review (SRS)
    const dueCards = await Flashcard.findAll({
      where: { deckId, isActive: true },
      include: [{
        model: UserFlashcardProgress,
        as: 'progress',
        where: {
          userId,
          nextReview: { [Op.lte]: now },
        },
        required: false,
      }],
      order: [
        [{ model: UserFlashcardProgress, as: 'progress' }, 'nextReview', 'ASC'],
      ],
      limit,
    });

    // If not enough due cards, add new cards
    if (dueCards.length < limit) {
      const reviewedCardIds = dueCards.map(c => c.id);
      const progressRecords = await UserFlashcardProgress.findAll({
        where: { userId },
        attributes: ['flashcardId'],
      });
      const studiedCardIds = progressRecords.map(p => p.flashcardId);

      const newCards = await Flashcard.findAll({
        where: {
          deckId,
          isActive: true,
          id: { [Op.notIn]: [...reviewedCardIds, ...studiedCardIds] },
        },
        limit: limit - dueCards.length,
        order: [['position', 'ASC']],
      });

      return [...dueCards, ...newCards];
    }

    return dueCards;
  }

  async submitReview(userId: string, results: ReviewResult[]) {
    const reviewed: any[] = [];

    for (const result of results) {
      const progress = await this.updateCardProgress(
        userId,
        result.flashcardId,
        result.quality
      );
      reviewed.push(progress);
    }

    // Record study activity
    await StudyActivity.create({
      userId,
      activityType: 'flashcard_reviewed',
      description: `Reviewed ${results.length} flashcards`,
      metadata: {
        cardsReviewed: results.length,
        averageQuality: results.reduce((sum, r) => sum + r.quality, 0) / results.length,
      },
      pointsEarned: results.length * 2,
    } as any);

    return { reviewed: reviewed.length, cards: reviewed };
  }

  // SM-2 Spaced Repetition Algorithm
  private async updateCardProgress(userId: string, flashcardId: string, quality: number) {
    let progress = await UserFlashcardProgress.findOne({
      where: { userId, flashcardId },
    });

    if (!progress) {
      progress = await UserFlashcardProgress.create({
        userId,
        flashcardId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
      } as any);
    }

    const isCorrect = quality >= 3;
    let { easeFactor, interval, repetitions } = progress;

    if (quality < 3) {
      // Reset if failed
      repetitions = 0;
      interval = 1;
    } else {
      // SM-2 algorithm
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Determine mastery level
    let masteryLevel: 'new' | 'learning' | 'reviewing' | 'mastered' = 'learning';
    if (repetitions === 0) masteryLevel = 'new';
    else if (repetitions < 3) masteryLevel = 'learning';
    else if (interval < 21) masteryLevel = 'reviewing';
    else masteryLevel = 'mastered';

    await progress.update({
      easeFactor,
      interval,
      repetitions,
      nextReview,
      lastReviewed: new Date(),
      timesReviewed: progress.timesReviewed + 1,
      timesCorrect: isCorrect ? progress.timesCorrect + 1 : progress.timesCorrect,
      masteryLevel,
    });

    return progress;
  }

  // ==================== PROGRESS & STATS ====================

  async getDeckProgress(deckId: string, userId: string) {
    const cards = await Flashcard.findAll({
      where: { deckId, isActive: true },
      attributes: ['id'],
    });

    const cardIds = cards.map(c => c.id);
    
    const progress = await UserFlashcardProgress.findAll({
      where: { userId, flashcardId: { [Op.in]: cardIds } },
    });

    const now = new Date();
    const stats = {
      total: cards.length,
      studied: progress.length,
      mastered: progress.filter(p => p.masteryLevel === 'mastered').length,
      learning: progress.filter(p => p.masteryLevel === 'learning').length,
      reviewing: progress.filter(p => p.masteryLevel === 'reviewing').length,
      due: progress.filter(p => p.nextReview && p.nextReview <= now).length,
      accuracy: progress.length > 0
        ? Math.round(
            (progress.reduce((sum, p) => sum + p.timesCorrect, 0) /
              Math.max(1, progress.reduce((sum, p) => sum + p.timesReviewed, 0))) * 100
          )
        : 0,
    };

    return stats;
  }

  async getUserFlashcardStats(userId: string) {
    const progress = await UserFlashcardProgress.findAll({
      where: { userId },
    });

    const decks = await FlashcardDeck.findAll({
      where: { createdBy: userId, isActive: true },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayReviews = progress.filter(
      p => p.lastReviewed && p.lastReviewed >= todayStart
    ).length;

    return {
      totalDecks: decks.length,
      totalCards: decks.reduce((sum, d) => sum + d.cardCount, 0),
      cardsStudied: progress.length,
      cardsMastered: progress.filter(p => p.masteryLevel === 'mastered').length,
      cardsDue: progress.filter(p => p.nextReview && p.nextReview <= now).length,
      reviewedToday: todayReviews,
      overallAccuracy: progress.length > 0
        ? Math.round(
            (progress.reduce((sum, p) => sum + p.timesCorrect, 0) /
              Math.max(1, progress.reduce((sum, p) => sum + p.timesReviewed, 0))) * 100
          )
        : 0,
      streakDays: await this.getFlashcardStreak(userId),
    };
  }

  private async getFlashcardStreak(userId: string) {
    const activities = await StudyActivity.findAll({
      where: { userId, activityType: 'flashcard_reviewed' },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(activities.map(a => a.createdAt.toISOString().split('T')[0]))];

    if (dates[0] !== today && dates[0] !== new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      return 0;
    }

    streak = 1;
    let expectedDate = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      if (dates[i] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const flashcardService = new FlashcardService();
export default flashcardService;

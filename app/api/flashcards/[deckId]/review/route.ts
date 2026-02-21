import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get cards due for review (spaced repetition)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await requireAuth();
    const { deckId } = await params;

    const deck = await prisma.flashcardDeck.findFirst({
      where: {
        id: deckId,
        OR: [{ userId: session.user.id }, { isPublic: true }],
      },
    });

    if (!deck) return errorResponse('Deck not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get cards due for review: nextReviewDate <= today or never reviewed
    const cards = await prisma.flashcard.findMany({
      where: { deckId, isActive: true },
      orderBy: { sequenceOrder: 'asc' },
      include: {
        progress: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    });

    const dueCards = cards.filter(card => {
      if (!card.progress.length) return true; // Never reviewed
      const p = card.progress[0];
      return !p.nextReviewDate || new Date(p.nextReviewDate) <= today;
    });

    return successResponse({
      totalCards: cards.length,
      dueCards: dueCards.length,
      cards: dueCards,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Submit review result (SM-2 spaced repetition algorithm)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await requireAuth();
    const { deckId } = await params;
    const body = await request.json();
    const { flashcardId, quality } = body;

    // quality: 0-5 (SM-2 scale)
    // 0 = complete blackout, 1 = incorrect but recognized, 2 = incorrect but easy to recall
    // 3 = correct with difficulty, 4 = correct with hesitation, 5 = perfect recall
    if (quality === undefined || quality < 0 || quality > 5) {
      return errorResponse('Quality must be 0-5');
    }

    const card = await prisma.flashcard.findFirst({
      where: { id: flashcardId, deckId },
    });

    if (!card) return errorResponse('Card not found', 404);

    // Get or create progress
    let progress = await prisma.userFlashcardProgress.findUnique({
      where: {
        userId_flashcardId: { userId: session.user.id, flashcardId },
      },
    });

    // SM-2 Algorithm
    let ef = progress ? Number(progress.easeFactor) : 2.5;
    let interval = progress?.intervalDays ?? 1;
    let repetitions = progress?.repetitions ?? 0;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      repetitions += 1;
    } else {
      // Incorrect response - reset
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ef = Math.max(1.3, ef); // Minimum ease factor

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const isCorrect = quality >= 3;
    const masteryLevel =
      repetitions >= 5 ? 'mastered' :
      repetitions >= 3 ? 'learned' :
      repetitions >= 1 ? 'reviewing' : 'new';

    if (progress) {
      await prisma.userFlashcardProgress.update({
        where: { id: progress.id },
        data: {
          easeFactor: ef,
          intervalDays: interval,
          repetitions,
          nextReviewDate,
          lastReviewDate: new Date(),
          totalReviews: { increment: 1 },
          correctReviews: { increment: isCorrect ? 1 : 0 },
          masteryLevel,
        },
      });
    } else {
      await prisma.userFlashcardProgress.create({
        data: {
          userId: session.user.id,
          flashcardId,
          easeFactor: ef,
          intervalDays: interval,
          repetitions,
          nextReviewDate,
          lastReviewDate: new Date(),
          totalReviews: 1,
          correctReviews: isCorrect ? 1 : 0,
          masteryLevel,
        },
      });
    }

    // Update deck mastered count
    if (masteryLevel === 'mastered') {
      const masteredCount = await prisma.userFlashcardProgress.count({
        where: {
          flashcard: { deckId },
          userId: session.user.id,
          masteryLevel: 'mastered',
        },
      });
      await prisma.flashcardDeck.update({
        where: { id: deckId },
        data: { masteredCount },
      });
    }

    return successResponse({
      nextReviewDate,
      interval,
      easeFactor: ef,
      repetitions,
      masteryLevel,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

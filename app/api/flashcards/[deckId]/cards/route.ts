import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get cards in a deck
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

    return successResponse(cards);
  } catch (error) {
    return handleApiError(error);
  }
}

// Add a card to a deck
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await requireAuth();
    const { deckId } = await params;
    const body = await request.json();

    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: deckId, userId: session.user.id },
    });

    if (!deck) return errorResponse('Deck not found or access denied', 404);

    const { front, back, hint, tags, difficulty } = body;
    if (!front?.trim() || !back?.trim()) {
      return errorResponse('Front and back are required');
    }

    // Get next sequence order
    const lastCard = await prisma.flashcard.findFirst({
      where: { deckId },
      orderBy: { sequenceOrder: 'desc' },
    });

    const card = await prisma.flashcard.create({
      data: {
        deckId,
        front: front.trim(),
        back: back.trim(),
        hint: hint?.trim() || null,
        tags: tags || null,
        difficulty: difficulty || 'medium',
        sequenceOrder: (lastCard?.sequenceOrder ?? 0) + 1,
      },
    });

    // Update deck card count
    await prisma.flashcardDeck.update({
      where: { id: deckId },
      data: { cardCount: { increment: 1 } },
    });

    return successResponse(card, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

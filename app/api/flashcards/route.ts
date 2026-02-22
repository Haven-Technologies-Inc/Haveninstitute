import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get user's flashcard decks
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {
      OR: [
        { userId: session.user.id },
        { isPublic: true },
      ],
      isActive: true,
    };

    if (category) where.category = category;

    const decks = await prisma.flashcardDeck.findMany({
      where,
      include: {
        _count: { select: { cards: true } },
        user: { select: { fullName: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(decks);
  } catch (error) {
    return handleApiError(error);
  }
}

// Create a new flashcard deck
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const deck = await prisma.flashcardDeck.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description,
        category: body.category,
        isPublic: body.isPublic ?? false,
      },
    });

    return successResponse(deck, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

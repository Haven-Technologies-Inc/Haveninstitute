import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return errorResponse('Search query must be at least 2 characters');
    }

    const searchTerm = query.toLowerCase();

    const [questions, discussions, materials, books] = await Promise.all([
      prisma.question.findMany({
        where: {
          isActive: true,
          questionText: { contains: searchTerm, mode: 'insensitive' },
        },
        select: { id: true, questionText: true, difficulty: true },
        take: 5,
      }),
      prisma.discussionPost.findMany({
        where: {
          status: 'published',
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, slug: true },
        take: 5,
      }),
      prisma.studyMaterial.findMany({
        where: {
          isPublished: true,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        select: { id: true, title: true, materialType: true },
        take: 5,
      }),
      prisma.book.findMany({
        where: {
          isPublished: true,
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        select: { id: true, title: true, author: true },
        take: 5,
      }),
    ]);

    return successResponse({
      questions: questions.map((q) => ({ ...q, type: 'question' })),
      discussions: discussions.map((d) => ({ ...d, type: 'discussion' })),
      materials: materials.map((m) => ({ ...m, type: 'material' })),
      books: books.map((b) => ({ ...b, type: 'book' })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

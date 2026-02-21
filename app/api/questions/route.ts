import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    const where: any = { isActive: true };

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficulty) where.difficulty = difficulty;
    if (type) where.questionType = type;
    if (search) {
      where.questionText = { contains: search, mode: 'insensitive' };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { category: { select: { name: true, code: true } } },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return successResponse({ questions, total, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const question = await prisma.question.create({
      data: {
        categoryId: body.categoryId,
        questionText: body.questionText,
        questionType: body.questionType ?? 'multiple_choice',
        options: body.options,
        correctAnswers: body.correctAnswers,
        difficulty: body.difficulty ?? 'medium',
        explanation: body.explanation,
        rationale: body.rationale,
        tags: body.tags,
        bloomLevel: body.bloomLevel,
        createdBy: session.user.id,
      },
      include: { category: true },
    });

    return successResponse(question, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

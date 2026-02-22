import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const categoryId = searchParams.get('categoryId');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');
    const discipline = searchParams.get('discipline');
    const status = searchParams.get('status');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.questionType = type;
    if (subject) where.subject = subject;
    if (discipline) where.discipline = discipline;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive' || status === 'archived') where.isActive = false;
    if (verified === 'true') where.isVerified = true;
    if (verified === 'false') where.isVerified = false;
    if (search) {
      where.OR = [
        { questionText: { contains: search, mode: 'insensitive' } },
        { rationale: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, code: true } },
          creator: { select: { fullName: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return successResponse({ questions, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('questionId') || searchParams.get('id');

    if (!id) return errorResponse('Question ID required');

    await prisma.question.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

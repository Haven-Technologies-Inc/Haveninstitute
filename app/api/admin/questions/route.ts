import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const categoryId = searchParams.get('categoryId');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficulty) where.difficulty = difficulty;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'verified') where.isVerified = true;
    if (search) {
      where.questionText = { contains: search, mode: 'insensitive' };
    }

    const [questions, total, categories] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          category: { select: { name: true, code: true } },
          creator: { select: { fullName: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
      prisma.nCLEXCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
    ]);

    return successResponse({ questions, total, categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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

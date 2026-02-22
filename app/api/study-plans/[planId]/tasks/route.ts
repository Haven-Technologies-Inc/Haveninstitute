import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Update task status (complete/uncomplete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await requireAuth();
    const { planId } = await params;
    const body = await request.json();
    const { taskId, status } = body;

    // Verify plan ownership
    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId: session.user.id },
    });

    if (!plan) return errorResponse('Plan not found', 404);

    const task = await prisma.studyPlanTask.findFirst({
      where: { id: taskId, planId },
    });

    if (!task) return errorResponse('Task not found', 404);

    const isCompleting = status === 'completed';

    await prisma.studyPlanTask.update({
      where: { id: taskId },
      data: {
        status: status || 'completed',
        completedAt: isCompleting ? new Date() : null,
      },
    });

    // Update plan counters
    const completedCount = await prisma.studyPlanTask.count({
      where: { planId, status: 'completed' },
    });

    const totalCount = await prisma.studyPlanTask.count({
      where: { planId },
    });

    await prisma.studyPlan.update({
      where: { id: planId },
      data: {
        completedTasks: completedCount,
        totalTasks: totalCount,
      },
    });

    return successResponse({
      taskId,
      status,
      completedTasks: completedCount,
      totalTasks: totalCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

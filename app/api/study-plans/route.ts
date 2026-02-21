import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const plans = await prisma.studyPlan.findMany({
      where: { userId: session.user.id },
      include: {
        tasks: { orderBy: { sequenceOrder: 'asc' } },
        milestones: { orderBy: { targetDate: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(plans);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const plan = await prisma.studyPlan.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        focusAreas: body.focusAreas,
        weakAreas: body.weakAreas,
        dailyStudyHours: body.dailyStudyHours ?? 2.0,
        studyDays: body.studyDays,
        sessionDurationMinutes: body.sessionDurationMinutes ?? 45,
        isAiGenerated: body.isAiGenerated ?? false,
      },
    });

    // Create tasks if provided
    if (body.tasks?.length) {
      await prisma.studyPlanTask.createMany({
        data: body.tasks.map((task: any, i: number) => ({
          planId: plan.id,
          title: task.title,
          description: task.description,
          taskType: task.taskType ?? 'practice',
          category: task.category,
          scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
          estimatedMinutes: task.estimatedMinutes ?? 30,
          sequenceOrder: i,
        })),
      });
    }

    return successResponse(plan, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

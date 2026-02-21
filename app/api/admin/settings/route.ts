import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.systemSettings.findMany({
      where: { isSecret: false },
      orderBy: [{ category: 'asc' }, { settingKey: 'asc' }],
    });

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const { key, value, valueType, description, category } = body;

    const setting = await prisma.systemSettings.upsert({
      where: { settingKey: key },
      update: {
        settingValue: value,
        updatedBy: session.user.id,
      },
      create: {
        settingKey: key,
        settingValue: value,
        valueType: valueType ?? 'string',
        description,
        category,
        updatedBy: session.user.id,
      },
    });

    return successResponse(setting);
  } catch (error) {
    return handleApiError(error);
  }
}

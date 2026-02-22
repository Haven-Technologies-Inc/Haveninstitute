import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.systemSettings.findMany({
      orderBy: [{ category: 'asc' }, { settingKey: 'asc' }],
      select: {
        id: true,
        settingKey: true,
        settingValue: true,
        valueType: true,
        description: true,
        category: true,
        isSecret: true,
        isEditable: true,
        updatedAt: true,
      },
    });

    // Mask secret values
    const maskedSettings = settings.map((s) => ({
      ...s,
      settingValue: s.isSecret ? '********' : s.settingValue,
    }));

    // Group by category
    const grouped: Record<string, typeof maskedSettings> = {};
    for (const setting of maskedSettings) {
      const cat = setting.category || 'general';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(setting);
    }

    return successResponse({ settings: maskedSettings, grouped });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    // Support batch update: { settings: [{ key, value }, ...] }
    if (body.settings && Array.isArray(body.settings)) {
      const results = [];
      for (const item of body.settings) {
        const { key, value, valueType, description, category } = item;
        if (!key) continue;

        const setting = await prisma.systemSettings.upsert({
          where: { settingKey: key },
          update: {
            settingValue: String(value ?? ''),
            updatedBy: session.user.id,
          },
          create: {
            settingKey: key,
            settingValue: String(value ?? ''),
            valueType: valueType ?? 'string',
            description: description ?? null,
            category: category ?? 'general',
            updatedBy: session.user.id,
          },
        });
        results.push(setting);
      }
      return successResponse(results);
    }

    // Single update
    const { key, value, valueType, description, category } = body;
    if (!key) {
      return errorResponse('Setting key is required', 400);
    }

    const setting = await prisma.systemSettings.upsert({
      where: { settingKey: key },
      update: {
        settingValue: String(value ?? ''),
        updatedBy: session.user.id,
      },
      create: {
        settingKey: key,
        settingValue: String(value ?? ''),
        valueType: valueType ?? 'string',
        description: description ?? null,
        category: category ?? 'general',
        updatedBy: session.user.id,
      },
    });

    return successResponse(setting);
  } catch (error) {
    return handleApiError(error);
  }
}

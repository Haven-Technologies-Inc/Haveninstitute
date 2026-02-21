import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  requireAdmin,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/admin/cms - Fetch all CMS settings (keys starting with 'cms_')
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.systemSettings.findMany({
      where: {
        settingKey: { startsWith: 'cms_' },
      },
      orderBy: { settingKey: 'asc' },
    });

    // Parse JSON values
    const parsed = settings.reduce<Record<string, any>>((acc, s) => {
      try {
        acc[s.settingKey] = s.settingValue ? JSON.parse(s.settingValue) : null;
      } catch {
        acc[s.settingKey] = s.settingValue;
      }
      return acc;
    }, {});

    return successResponse(parsed);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/cms - Update a CMS setting
// Body: { key: string, value: any }
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return errorResponse('Setting key is required', 400);
    }

    // Ensure the key starts with 'cms_'
    if (!key.startsWith('cms_')) {
      return errorResponse('CMS setting keys must start with "cms_"', 400);
    }

    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await prisma.systemSettings.upsert({
      where: { settingKey: key },
      create: {
        settingKey: key,
        settingValue: serializedValue,
        valueType: 'json',
        description: `CMS content for ${key.replace('cms_', '').replace(/_/g, ' ')}`,
        category: 'cms',
        isEditable: true,
        updatedBy: (session.user as any).id,
      },
      update: {
        settingValue: serializedValue,
        updatedBy: (session.user as any).id,
      },
    });

    return successResponse(setting);
  } catch (error) {
    return handleApiError(error);
  }
}

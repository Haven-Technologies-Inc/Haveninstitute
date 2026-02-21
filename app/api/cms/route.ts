import { prisma } from '@/lib/db';
import { successResponse, handleApiError } from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// GET /api/cms - Fetch published CMS content (public, no auth required)
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        settingKey: { startsWith: 'cms_' },
      },
      select: {
        settingKey: true,
        settingValue: true,
      },
      orderBy: { settingKey: 'asc' },
    });

    // Parse JSON values and return as a clean object
    const content = settings.reduce<Record<string, any>>((acc, s) => {
      const cleanKey = s.settingKey.replace('cms_', '');
      try {
        acc[cleanKey] = s.settingValue ? JSON.parse(s.settingValue) : null;
      } catch {
        acc[cleanKey] = s.settingValue;
      }
      return acc;
    }, {});

    return successResponse(content);
  } catch (error) {
    return handleApiError(error);
  }
}

import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils';
import { getUsageSummary } from '@/lib/usage-limits';

export async function GET() {
  try {
    const session = await requireAuth();
    const tier = (session.user as any).subscriptionTier || 'Free';
    const summary = await getUsageSummary(session.user.id, tier);

    return successResponse({
      tier,
      usage: summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

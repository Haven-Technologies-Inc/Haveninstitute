import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { members: true, messages: true } },
      },
    });

    if (!group) return errorResponse('Group not found', 404);
    if (!group.isActive) return errorResponse('Group is inactive');

    // Verify membership for private groups
    if (!group.isPublic) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: session.user.id } },
      });
      if (!member) return errorResponse('Not a member of this group', 403);
    }

    return successResponse(group);
  } catch (error) {
    return handleApiError(error);
  }
}

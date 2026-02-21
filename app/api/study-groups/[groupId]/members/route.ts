import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// Get group members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;

    // Verify membership
    const currentMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!currentMember) return errorResponse('Not a member of this group', 403);

    const members = await prisma.groupMember.findMany({
      where: { groupId, status: 'active' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return successResponse(members);
  } catch (error) {
    return handleApiError(error);
  }
}

// Join a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;
    const body = await request.json();

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { _count: { select: { members: true } } },
    });

    if (!group) return errorResponse('Group not found', 404);
    if (!group.isActive) return errorResponse('Group is inactive');

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });
    if (existing) return errorResponse('Already a member');

    // Check max members
    if (group._count.members >= group.maxMembers) {
      return errorResponse('Group is full');
    }

    // If private group, check join code
    if (!group.isPublic) {
      if (body.joinCode !== group.joinCode) {
        return errorResponse('Invalid join code', 403);
      }
    }

    await prisma.groupMember.create({
      data: { groupId, userId: session.user.id, role: 'member' },
    });

    await prisma.studyGroup.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });

    return successResponse({ joined: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// Leave a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await requireAuth();
    const { groupId } = await params;

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    });

    if (!member) return errorResponse('Not a member', 404);

    // Owner can't leave (must transfer ownership or delete group)
    const group = await prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (group?.ownerId === session.user.id) {
      return errorResponse('Owner cannot leave. Transfer ownership first.');
    }

    await prisma.groupMember.delete({ where: { id: member.id } });
    await prisma.studyGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });

    return successResponse({ left: true });
  } catch (error) {
    return handleApiError(error);
  }
}

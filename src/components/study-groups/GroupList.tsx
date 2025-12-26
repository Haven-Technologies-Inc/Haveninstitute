/**
 * GroupList Component - Reusable list for displaying study groups
 * Follows same list-rendering patterns as other list components
 */

import { StudyGroup } from '../../services/api/studyGroup.api';
import { GroupCard } from './GroupCard';
import { Card, CardContent } from '../ui/card';
import { Users } from 'lucide-react';
import { Button } from '../ui/button';

interface GroupListProps {
  groups: StudyGroup[];
  isLoading?: boolean;
  isMemberList?: boolean;
  onJoinGroup?: (groupId: string) => void;
  onGroupClick?: (groupId: string) => void;
  joiningGroupId?: string | null;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function GroupList({
  groups,
  isLoading,
  isMemberList = false,
  onJoinGroup,
  onGroupClick,
  joiningGroupId,
  emptyMessage = 'No groups found',
  emptyAction
}: GroupListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-48 animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!groups || groups.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 text-center py-12">
          <Users className="size-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {emptyMessage}
          </h3>
          {emptyAction && (
            <Button onClick={emptyAction.onClick} className="mt-4">
              {emptyAction.label}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          isMember={isMemberList}
          onJoin={onJoinGroup}
          onClick={onGroupClick}
          isJoining={joiningGroupId === group.id}
        />
      ))}
    </div>
  );
}

export default GroupList;

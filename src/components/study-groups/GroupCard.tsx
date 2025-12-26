/**
 * GroupCard Component - Displays a study group card
 */

import { Users, Globe, Lock, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StudyGroup } from '../../services/api/studyGroup.api';

interface GroupCardProps {
  group: StudyGroup;
  isMember?: boolean;
  onJoin?: (groupId: string) => void;
  onClick?: (groupId: string) => void;
  isJoining?: boolean;
}

export function GroupCard({ group, isMember = false, onJoin, onClick, isJoining }: GroupCardProps) {
  const memberCount = group.members?.length || 0;
  
  const handleClick = () => {
    if (onClick) onClick(group.id);
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJoin) onJoin(group.id);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 h-full"
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {group.isPublic ? (
                  <Globe className="size-4 text-green-600" />
                ) : (
                  <Lock className="size-4 text-yellow-600" />
                )}
                <span className="capitalize">{group.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>
          </div>
          {isMember && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Joined
            </Badge>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Category */}
        {group.category && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {group.category}
            </Badge>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{memberCount}/{group.maxMembers}</span>
            </div>
          </div>
          
          {!isMember && onJoin && memberCount < group.maxMembers && (
            <Button 
              size="sm" 
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GroupCard;

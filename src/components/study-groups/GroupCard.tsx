/**
 * GroupCard Component - Reusable card for displaying study group info
 * Follows DRY principles with consistent styling patterns
 */

import { Users, Globe, Lock, MessageCircle, Calendar } from 'lucide-react';
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
  const memberCount = group.memberCount || group.members?.length || 0;
  const maxMembers = group.maxMembers || 6;
  
  const getVisibilityIcon = () => {
    return group.visibility === 'private' 
      ? <Lock className="size-4 text-yellow-600" />
      : <Globe className="size-4 text-green-600" />;
  };

  const getInitial = () => group.name.charAt(0).toUpperCase();

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
              {getInitial()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {getVisibilityIcon()}
                <span className="capitalize">{group.visibility}</span>
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

        {/* Focus Areas */}
        {group.focusAreas && group.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {group.focusAreas.slice(0, 3).map((area, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
            {group.focusAreas.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{group.focusAreas.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{memberCount}/{maxMembers}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="size-4" />
              <span>{group.messageCount || 0}</span>
            </div>
          </div>
          
          {!isMember && onJoin && memberCount < maxMembers && (
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

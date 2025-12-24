/**
 * Study Groups Page - Browse, join, and manage study groups
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Calendar,
  TrendingUp,
  Globe,
  Lock,
  Mail,
  UserPlus,
  Settings,
  ChevronRight
} from 'lucide-react';
import {
  useMyGroups,
  useRecommendedGroups,
  useSearchGroups,
  useCreateGroup,
  useJoinGroup
} from '../../services/hooks/useStudyGroups';
import { StudyGroup } from '../../services/api/studyGroup.api';

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk',
  'Physiological Adaptation'
];

export default function StudyGroupsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('public');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const { data: myGroups, isLoading: loadingMyGroups } = useMyGroups();
  const { data: recommendedGroups, isLoading: loadingRecommended } = useRecommendedGroups(6);
  const { data: searchResults, isLoading: loadingSearch } = useSearchGroups(
    searchQuery ? { query: searchQuery } : undefined
  );
  
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      const group = await createGroupMutation.mutateAsync({
        name: newGroupName,
        description: newGroupDescription,
        visibility: newGroupVisibility,
        focusAreas: selectedFocusAreas
      });
      setShowCreateModal(false);
      navigate(`/app/group-study/${group.id}`);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroupMutation.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="size-4 text-green-600" />;
      case 'private': return <Lock className="size-4 text-yellow-600" />;
      case 'invite_only': return <Mail className="size-4 text-blue-600" />;
      default: return <Globe className="size-4" />;
    }
  };

  const GroupCard = ({ group, isMember = false }: { group: StudyGroup; isMember?: boolean }) => (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
      onClick={() => navigate(`/app/group-study/${group.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="size-3" />
                <span>{group.memberCount} members</span>
                {getVisibilityIcon(group.visibility)}
              </div>
            </div>
          </div>
          {!isMember && (
            <Button 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
              disabled={joinGroupMutation.isPending}
            >
              <UserPlus className="size-4 mr-1" />
              Join
            </Button>
          )}
        </div>
        
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {group.focusAreas?.slice(0, 3).map(area => (
            <Badge key={area} variant="secondary" className="text-xs">
              {area}
            </Badge>
          ))}
          {(group.focusAreas?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs">
              +{group.focusAreas!.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" />
              {group.stats?.totalMessages || 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {group.stats?.totalSessions || 0} sessions
            </span>
          </div>
          <ChevronRight className="size-4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collaborate with other NCLEX students
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Search Results
          </h2>
          {loadingSearch ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : searchResults?.groups?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.groups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No groups found matching "{searchQuery}"
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* My Groups */}
      {!searchQuery && (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Groups
              </h2>
              <Badge variant="outline">{myGroups?.length || 0} groups</Badge>
            </div>
            {loadingMyGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : myGroups?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map(group => (
                  <GroupCard key={group.id} group={group} isMember />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <Users className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Join a study group or create your own
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Recommended Groups */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
            </div>
            {loadingRecommended ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : recommendedGroups?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No recommendations available yet
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Create Study Group</CardTitle>
              <CardDescription>
                Start a new group to study with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Group Name *
                </label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., NCLEX Med-Surg Masters"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="What is this group about?"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Visibility
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={newGroupVisibility === 'public' ? 'default' : 'outline'}
                    onClick={() => setNewGroupVisibility('public')}
                    className="flex-1"
                  >
                    <Globe className="size-4 mr-2" />
                    Public
                  </Button>
                  <Button
                    variant={newGroupVisibility === 'private' ? 'default' : 'outline'}
                    onClick={() => setNewGroupVisibility('private')}
                    className="flex-1"
                  >
                    <Lock className="size-4 mr-2" />
                    Private
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Focus Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {NCLEX_CATEGORIES.map(category => (
                    <Badge
                      key={category}
                      variant={selectedFocusAreas.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedFocusAreas(prev =>
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      )}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || createGroupMutation.isPending}
                  className="flex-1"
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

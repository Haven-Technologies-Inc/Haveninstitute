/**
 * Study Groups Page - Browse, join, and manage study groups
 * Production-ready with real backend API integration
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
  UserPlus,
  ChevronRight,
  X,
  CheckCircle2
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
  const [createSuccess, setCreateSuccess] = useState(false);

  // Real API hooks
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
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        visibility: newGroupVisibility,
        focusAreas: selectedFocusAreas
      });
      
      setCreateSuccess(true);
      
      // Reset form after short delay and navigate to group
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupVisibility('public');
        setSelectedFocusAreas([]);
        navigate(`/app/group-study/${group.id}`);
      }, 1500);
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
            <div className="size-10 sm:size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{group.name}</h3>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Users className="size-3" />
                <span>{group.memberCount} members</span>
                {getVisibilityIcon(group.visibility)}
              </div>
            </div>
          </div>
          {!isMember && (
            <Button 
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
              onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
            >
              <UserPlus className="size-3 sm:size-4 mr-1" />
              <span className="hidden sm:inline">Join</span>
            </Button>
          )}
        </div>
        
        {group.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {group.focusAreas?.slice(0, 2).map((area: string) => (
            <Badge key={area} variant="secondary" className="text-xs">
              {area.length > 15 ? area.substring(0, 15) + '...' : area}
            </Badge>
          ))}
          {(group.focusAreas?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{group.focusAreas!.length - 2}
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
              {group.stats?.totalSessions || 0}
            </span>
          </div>
          <ChevronRight className="size-4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Collaborate with other NCLEX students
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Search Results
          </h2>
          {loadingSearch ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : searchResults?.groups && searchResults.groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {searchResults.groups.map((group: StudyGroup) => (
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                My Groups
              </h2>
              <Badge variant="outline">{myGroups?.length || 0} groups</Badge>
            </div>
            {loadingMyGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : myGroups && myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {myGroups.map((group: StudyGroup) => (
                  <GroupCard key={group.id} group={group} isMember />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center py-8 sm:py-12">
                  <Users className="size-10 sm:size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 px-4">
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
            </div>
            {loadingRecommended ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : recommendedGroups && recommendedGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recommendedGroups.map((group: StudyGroup) => (
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

      {/* Enhanced Create Group Modal - Mobile Responsive */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <Card className="w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="size-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Users className="size-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Create Study Group</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Start a new group to study with others
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Scrollable Content */}
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[60vh]">
              {createSuccess ? (
                <div className="text-center py-8">
                  <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Group Created!
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your study group has been created successfully.
                  </p>
                </div>
              ) : (
                <>
                  {/* Group Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., NCLEX Med-Surg Masters"
                      className="h-11 sm:h-12"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      rows={3}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="What is this group about? What will members study together?"
                    />
                  </div>
                  
                  {/* Visibility */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setNewGroupVisibility('public')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          newGroupVisibility === 'public'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Globe className={`size-5 sm:size-6 mx-auto mb-1 ${
                          newGroupVisibility === 'public' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-xs sm:text-sm font-medium ${
                          newGroupVisibility === 'public' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>Public</span>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">Anyone can join</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGroupVisibility('private')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          newGroupVisibility === 'private'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Lock className={`size-5 sm:size-6 mx-auto mb-1 ${
                          newGroupVisibility === 'private' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-xs sm:text-sm font-medium ${
                          newGroupVisibility === 'private' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>Private</span>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">Invite only</p>
                      </button>
                    </div>
                  </div>
                  
                  {/* Focus Areas */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Focus Areas <span className="text-gray-400 font-normal">(select topics)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {NCLEX_CATEGORIES.map(category => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedFocusAreas(prev =>
                            prev.includes(category)
                              ? prev.filter(c => c !== category)
                              : [...prev, category]
                          )}
                          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            selectedFocusAreas.includes(category)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {selectedFocusAreas.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {selectedFocusAreas.length} area{selectedFocusAreas.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>

            {/* Footer Actions */}
            {!createSuccess && (
              <div className="p-4 sm:p-6 border-t bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-11 sm:h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || createGroupMutation.isPending}
                    className="flex-1 h-11 sm:h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4 mr-2" />
                        Create Group
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

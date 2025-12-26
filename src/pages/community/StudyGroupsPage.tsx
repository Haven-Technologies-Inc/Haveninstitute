/**
 * Study Groups Page - Browse, join, and manage study groups
 * New implementation with clean UI
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
  TrendingUp,
  Globe,
  Lock,
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
import { GroupCard } from '../../components/study-groups';
import { StudyGroup } from '../../services/api/studyGroup.api';

const CATEGORIES = [
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
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupIsPublic, setNewGroupIsPublic] = useState(true);
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState(6);
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  // API hooks
  const { data: myGroups, isLoading: loadingMyGroups } = useMyGroups();
  const { data: recommendedGroups, isLoading: loadingRecommended } = useRecommendedGroups(6);
  const { data: searchResults, isLoading: loadingSearch } = useSearchGroups(
    searchQuery.length >= 2 ? { query: searchQuery } : undefined
  );
  
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      const group = await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        isPublic: newGroupIsPublic,
        maxMembers: newGroupMaxMembers,
        category: newGroupCategory || undefined
      });
      
      setCreateSuccess(true);
      
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
        resetForm();
        navigate(`/app/study-groups/${group.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoiningGroupId(groupId);
    try {
      await joinGroupMutation.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to join group:', error);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/app/study-groups/${groupId}`);
  };

  const resetForm = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupIsPublic(true);
    setNewGroupMaxMembers(6);
    setNewGroupCategory('');
  };

  const isMemberOfGroup = (group: StudyGroup) => {
    return myGroups?.some(g => g.id === group.id) || false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-gray-600 dark:text-gray-400">
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
      {searchQuery.length >= 2 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Search Results
          </h2>
          {loadingSearch ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : searchResults?.groups && searchResults.groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={isMemberOfGroup(group)}
                  onClick={handleGroupClick}
                  onJoin={handleJoinGroup}
                  isJoining={joiningGroupId === group.id}
                />
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

      {/* My Groups & Recommended */}
      {searchQuery.length < 2 && (
        <>
          {/* My Groups */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Groups
              </h2>
              <Badge variant="outline">{myGroups?.length || 0} groups</Badge>
            </div>
            {loadingMyGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : myGroups && myGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isMember={true}
                    onClick={handleGroupClick}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center py-12">
                  <Users className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : recommendedGroups && recommendedGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isMember={isMemberOfGroup(group)}
                    onClick={handleGroupClick}
                    onJoin={handleJoinGroup}
                    isJoining={joiningGroupId === group.id}
                  />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 relative">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
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
                  <CardTitle>Create Study Group</CardTitle>
                  <CardDescription>Start a new group to study with others</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              {createSuccess ? (
                <div className="text-center py-8">
                  <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Group Created!
                  </h3>
                  <p className="text-sm text-gray-500">Redirecting to your new group...</p>
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
                      maxLength={100}
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg resize-none dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="What is this group about?"
                      maxLength={500}
                    />
                  </div>
                  
                  {/* Visibility */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewGroupIsPublic(true)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          newGroupIsPublic
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Globe className={`size-6 mx-auto mb-1 ${newGroupIsPublic ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${newGroupIsPublic ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          Public
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Anyone can join</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGroupIsPublic(false)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          !newGroupIsPublic
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Lock className={`size-6 mx-auto mb-1 ${!newGroupIsPublic ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${!newGroupIsPublic ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          Private
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Invite only</p>
                      </button>
                    </div>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Maximum Members: {newGroupMaxMembers}
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      value={newGroupMaxMembers}
                      onChange={(e) => setNewGroupMaxMembers(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optimal size: 4-6 members</p>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Category (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewGroupCategory(newGroupCategory === cat ? '' : cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            newGroupCategory === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            {!createSuccess && (
              <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || createGroupMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
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

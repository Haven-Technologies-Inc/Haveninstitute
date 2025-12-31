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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  MessageSquare,
  Calendar,
  Target,
  Info
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
  const [createError, setCreateError] = useState<string | null>(null);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [touched, setTouched] = useState({ name: false, description: false });

  // API hooks
  const { data: myGroups, isLoading: loadingMyGroups } = useMyGroups();
  const { data: recommendedGroups, isLoading: loadingRecommended } = useRecommendedGroups(6);
  const { data: searchResults, isLoading: loadingSearch } = useSearchGroups(
    searchQuery.length >= 2 ? { query: searchQuery } : undefined
  );
  
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setCreateError('Group name is required');
      return;
    }
    
    setCreateError(null);
    
    try {
      const group = await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        isPublic: newGroupIsPublic,
        maxMembers: newGroupMaxMembers,
        category: newGroupCategory || undefined
      });
      
      if (!group || !group.id) {
        setCreateError('Group created but could not get group details. Please check My Groups.');
        return;
      }
      
      setCreateSuccess(true);
      
      const groupId = group.id;
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
        resetForm();
        navigate(`/app/community/groups/${groupId}`);
      }, 1500);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create group. Please try again.';
      setCreateError(errorMessage);
    }
  };

  const validateName = () => {
    if (!newGroupName.trim()) return 'Group name is required';
    if (newGroupName.trim().length < 3) return 'Name must be at least 3 characters';
    if (newGroupName.trim().length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const canProceedToStep2 = () => {
    return newGroupName.trim().length >= 3;
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
    navigate(`/app/community/groups/${groupId}`);
  };

  const resetForm = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupIsPublic(true);
    setNewGroupMaxMembers(6);
    setNewGroupCategory('');
    setFormStep(1);
    setCreateError(null);
    setTouched({ name: false, description: false });
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

      {/* Enhanced Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="size-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create Study Group</h2>
                  <p className="text-sm text-white/80">Step {formStep} of 2 • {formStep === 1 ? 'Basic Info' : 'Settings'}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                aria-label="Close modal"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: formStep === 1 ? '50%' : '100%' }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error Message */}
              {createError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                  <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{createError}</p>
                </div>
              )}

              {createSuccess ? (
                <div className="text-center py-12">
                  <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="size-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Group Created Successfully!
                  </h3>
                  <p className="text-gray-500">Redirecting to your new study group...</p>
                </div>
              ) : formStep === 1 ? (
                <div className="space-y-6">
                  {/* Group Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Target className="size-4 text-blue-500" />
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, name: true }))}
                      placeholder="e.g., NCLEX Med-Surg Masters"
                      maxLength={100}
                      className={`text-lg h-12 ${
                        touched.name && validateName() 
                          ? 'border-red-500 focus:ring-red-500' 
                          : ''
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${
                        touched.name && validateName() ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {touched.name && validateName() ? validateName() : 'Choose a unique, descriptive name'}
                      </span>
                      <span className="text-xs text-gray-400">{newGroupName.length}/100</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="size-4 text-green-500" />
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl resize-none dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={4}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Describe your group's goals, study schedule, and what members can expect..."
                      maxLength={500}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Help others understand what your group is about</span>
                      <span className="text-xs text-gray-400">{newGroupDescription.length}/500</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Calendar className="size-4 text-purple-500" />
                      Focus Category
                      <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewGroupCategory(newGroupCategory === cat ? '' : cat)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            newGroupCategory === cat
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visibility */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Globe className="size-4 text-blue-500" />
                      Group Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setNewGroupIsPublic(true)}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          newGroupIsPublic
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className={`p-3 rounded-lg inline-block mb-3 ${
                          newGroupIsPublic ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Globe className="size-5" />
                        </div>
                        <h4 className={`font-semibold mb-1 ${
                          newGroupIsPublic ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>Public</h4>
                        <p className="text-xs text-gray-500">Anyone can find and join your group</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGroupIsPublic(false)}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          !newGroupIsPublic
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className={`p-3 rounded-lg inline-block mb-3 ${
                          !newGroupIsPublic ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Lock className="size-5" />
                        </div>
                        <h4 className={`font-semibold mb-1 ${
                          !newGroupIsPublic ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>Private</h4>
                        <p className="text-xs text-gray-500">Only invited members can join</p>
                      </button>
                    </div>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Users className="size-4 text-orange-500" />
                      Group Size
                    </label>
                    <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {newGroupMaxMembers}
                        </span>
                        <span className="text-sm text-gray-500">members max</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={20}
                        value={newGroupMaxMembers}
                        onChange={(e) => setNewGroupMaxMembers(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        aria-label="Maximum members"
                        title="Maximum members"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>2 (Duo)</span>
                        <span>6 (Optimal)</span>
                        <span>20 (Large)</span>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
                        <Info className="size-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Research shows groups of 4-6 members have the best engagement and accountability.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="size-4 text-yellow-500" />
                      Group Summary
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                          {newGroupName || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Visibility</span>
                        <Badge variant={newGroupIsPublic ? 'default' : 'secondary'}>
                          {newGroupIsPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Max Members</span>
                        <span className="font-medium text-gray-900 dark:text-white">{newGroupMaxMembers}</span>
                      </div>
                      {newGroupCategory && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Category</span>
                          <Badge variant="outline">{newGroupCategory}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!createSuccess && (
              <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                {formStep === 1 ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setFormStep(2)}
                      disabled={!canProceedToStep2()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Continue
                      <span className="ml-2">→</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setFormStep(1)}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={!canProceedToStep2() || createGroupMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {createGroupMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4 mr-2" />
                          Create Group
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

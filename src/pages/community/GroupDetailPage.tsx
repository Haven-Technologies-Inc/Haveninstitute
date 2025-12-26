/**
 * Group Detail Page - Production-ready with real API integration
 * Features: Group info, member management, chat, invites, sessions
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Users,
  MessageSquare,
  Calendar,
  Send,
  Settings,
  UserPlus,
  Crown,
  Shield,
  ArrowLeft,
  Globe,
  Lock,
  MoreVertical,
  Clock,
  CheckCircle,
  X,
  Mail,
  Copy,
  Share2,
  LogOut,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import {
  useStudyGroup,
  useGroupMessages,
  useGroupSessions,
  useSendMessage,
  useJoinGroup,
  useLeaveGroup,
  useInviteUser
} from '../../services/hooks/useStudyGroups';
import { StudyGroup, StudyGroupMessage, StudyGroupMember } from '../../services/api/studyGroup.api';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [messageText, setMessageText] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // API Hooks
  const { data: group, isLoading: loadingGroup, error: groupError } = useStudyGroup(groupId || '');
  const { data: messages, isLoading: loadingMessages } = useGroupMessages(groupId || '');
  const { data: sessions } = useGroupSessions(groupId || '');
  
  const sendMessageMutation = useSendMessage();
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const inviteUserMutation = useInviteUser();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !groupId) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        groupId,
        content: messageText.trim(),
        type: 'text'
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !groupId) return;
    
    try {
      await inviteUserMutation.mutateAsync({ groupId, email: inviteEmail.trim() });
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteEmail('');
        setInviteSuccess(false);
        setShowInviteDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    try {
      await leaveGroupMutation.mutateAsync(groupId);
      navigate('/app/groups');
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId) return;
    try {
      await joinGroupMutation.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="size-3 text-yellow-500" />;
      case 'admin': return <Shield className="size-3 text-blue-500" />;
      case 'moderator': return <Shield className="size-3 text-green-500" />;
      default: return null;
    }
  };

  const isMember = group?.members?.some(m => m.userId === user?.id && m.status === 'active');
  const isOwner = group?.ownerId === user?.id;
  const isAdmin = group?.members?.some(m => m.userId === user?.id && ['owner', 'admin'].includes(m.role));

  if (loadingGroup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="size-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Group Not Found</h2>
            <p className="text-gray-500 mb-6">This group doesn't exist or you don't have access.</p>
            <Button onClick={() => navigate('/app/groups')}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/app/groups')} className="p-2">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="size-12 sm:size-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {group.name}
              </h1>
              {group.visibility === 'private' ? (
                <Lock className="size-4 text-yellow-600 flex-shrink-0" />
              ) : (
                <Globe className="size-4 text-green-600 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="size-4" />
              <span>{group.memberCount} members</span>
              <span>•</span>
              <span>{group.focusAreas?.[0] || 'General'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {isMember ? (
            <>
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="size-4 mr-2" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
              {isAdmin && (
                <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="size-4" />
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={handleJoinGroup}
              disabled={joinGroupMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chat & Content Area */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-220px)] sm:h-[calc(100vh-200px)] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3 m-2 sm:m-4 mb-0">
                <TabsTrigger value="chat" className="text-xs sm:text-sm">
                  <MessageSquare className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">
                  <Calendar className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="about" className="text-xs sm:text-sm">
                  <Users className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  About
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                <ScrollArea className="flex-1 p-3 sm:p-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {[...messages].reverse().map((msg: StudyGroupMessage) => (
                        <div key={msg.id} className="flex gap-2 sm:gap-3">
                          <div className="size-8 sm:size-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm flex-shrink-0">
                            {msg.sender?.firstName?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {msg.sender?.firstName} {msg.sender?.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                {isMember && (
                  <div className="p-3 sm:p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="flex-1 m-0 overflow-auto p-3 sm:p-4">
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <Card key={session.id} className="p-3 sm:p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(session.scheduledStart).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {session.attendeeCount} attending
                              </span>
                            </div>
                          </div>
                          <Badge variant={session.status === 'scheduled' ? 'outline' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No sessions scheduled yet.</p>
                  </div>
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="flex-1 m-0 overflow-auto p-3 sm:p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {group.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.focusAreas?.map((area, idx) => (
                        <Badge key={idx} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{group.stats?.totalMessages || 0}</p>
                        <p className="text-xs text-gray-500">Messages</p>
                      </div>
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{group.stats?.totalSessions || 0}</p>
                        <p className="text-xs text-gray-500">Sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Members Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-fit lg:h-[calc(100vh-200px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="size-5" />
                Members ({group.memberCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] lg:h-[calc(100vh-320px)]">
                <div className="space-y-3">
                  {group.members?.filter(m => m.status === 'active').map((member: StudyGroupMember) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm">
                        {member.user?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {member.user?.firstName} {member.user?.lastName}
                          </span>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {isMember && !isOwner && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLeaveGroup}
                  disabled={leaveGroupMutation.isPending}
                >
                  <LogOut className="size-4 mr-2" />
                  Leave Group
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Group</DialogTitle>
            <DialogDescription>
              Send an invitation to join {group.name}
            </DialogDescription>
          </DialogHeader>
          
          {inviteSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="size-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-600 font-medium">Invitation sent!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || inviteUserMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {inviteUserMutation.isPending ? '...' : <Send className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Or share invite link</p>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/app/groups/${groupId}/join`}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/app/groups/${groupId}/join`)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
            <DialogDescription>
              Manage your group settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Group settings coming soon...</p>
            {isOwner && (
              <Button variant="destructive" className="w-full">
                <Trash2 className="size-4 mr-2" />
                Delete Group
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

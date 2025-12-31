/**
 * Group Detail Page - View and interact with a study group
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  Send,
  UserPlus,
  Settings,
  LogOut,
  Crown,
  Shield,
  User,
  Mail,
  X,
  Check,
  Copy
} from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import {
  useStudyGroup,
  useGroupMessages,
  useLeaveGroup,
  useSendMessage,
  useCreateInvitation
} from '../../services/hooks/useStudyGroups';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);

  // API hooks
  const { data: group, isLoading: loadingGroup } = useStudyGroup(groupId || '');
  const { data: messagesData, isLoading: loadingMessages } = useGroupMessages(groupId || '');
  const leaveGroupMutation = useLeaveGroup();
  const sendMessageMutation = useSendMessage();
  const createInvitationMutation = useCreateInvitation();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        groupId,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    if (confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroupMutation.mutateAsync(groupId);
        navigate('/app/community/groups');
      } catch (error) {
        console.error('Failed to leave group:', error);
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !groupId) return;
    
    try {
      await createInvitationMutation.mutateAsync({
        groupId,
        email: inviteEmail.trim()
      });
      setInviteEmail('');
      alert('Invitation sent!');
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/app/community/groups/join/${groupId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return <Crown className="size-4 text-yellow-500" />;
      case 'admin': return <Shield className="size-4 text-blue-500" />;
      default: return <User className="size-4 text-gray-400" />;
    }
  };

  const currentUserMembership = group?.members?.find(m => m.userId === user?.id);
  const isCreator = currentUserMembership?.role === 'creator';

  if (loadingGroup) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Group not found
            </h2>
            <Button onClick={() => navigate('/app/community/groups')}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Groups
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/app/community/groups')}
            className="p-2"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {group.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {group.isPublic ? (
                  <Globe className="size-4 text-green-600" />
                ) : (
                  <Lock className="size-4 text-yellow-600" />
                )}
                <span>{group.isPublic ? 'Public' : 'Private'}</span>
                <span>•</span>
                <Users className="size-4" />
                <span>{group.members?.length || 0}/{group.maxMembers} members</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="size-4 mr-2" />
            Invite
          </Button>
          {!isCreator && (
            <Button
              variant="outline"
              onClick={handleLeaveGroup}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4 mr-2" />
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
            {group.category && (
              <Badge variant="outline" className="mt-2">{group.category}</Badge>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                  messagesData.messages.map((msg) => {
                    const isOwn = msg.userId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                          {!isOwn && (
                            <p className="text-xs text-gray-500 mb-1 ml-1">
                              {msg.user?.fullName || msg.user?.email || 'Unknown'}
                            </p>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        <div>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="size-5" />
                Members ({group.members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {group.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {(member.user?.fullName || member.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {member.user?.fullName || member.user?.email || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="border-b relative">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute right-4 top-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="size-4" />
              </button>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-blue-600" />
                Invite to {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email Invite */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  <Mail className="size-4 inline mr-2" />
                  Invite by Email
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || createInvitationMutation.isPending}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
                </div>
              </div>

              {/* Copy Link */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Share Invite Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/app/community/groups/join/${groupId}`}
                    readOnly
                    className="text-sm bg-gray-50"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

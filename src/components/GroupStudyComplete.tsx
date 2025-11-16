import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Users,
  MessageSquare,
  Video,
  Calendar,
  Award,
  Target,
  Send,
  Plus,
  Settings,
  UserPlus,
  Crown,
  Shield,
  User,
  Search,
  Filter,
  Clock,
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Star,
  ArrowLeft,
  Share2,
  Link2,
  Check,
  X,
  MoreVertical,
  FileText,
  Image,
  Paperclip,
  Smile,
  PhoneCall,
  Mail,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Flame,
  Download
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface GroupStudyCompleteProps {
  onBack: () => void;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  createdBy: string;
  createdAt: Date;
  avatar: string;
  isPrivate: boolean;
  tags: string[];
}

interface GroupMember {
  id: string;
  name: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  studyStreak: number;
  contributionScore: number;
  avatar: string;
}

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'poll';
  reactions?: Record<string, string[]>; // emoji -> userIds
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // minutes
  host: string;
  attendees: string[];
  meetingLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  goal: number;
  currentProgress: number;
  participants: string[];
  startDate: Date;
  endDate: Date;
  reward: string;
}

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation',
  'General Study'
];

export function GroupStudyComplete({ onBack }: GroupStudyCompleteProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'browse' | 'my-groups' | 'group-detail'>('my-groups');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'NCLEX Warriors 2024',
      description: 'Dedicated group for NCLEX-RN preparation. Daily study sessions and peer support!',
      category: 'General Study',
      memberCount: 12,
      maxMembers: 20,
      createdBy: 'Sarah M.',
      createdAt: new Date('2024-01-15'),
      avatar: '🎯',
      isPrivate: false,
      tags: ['NCLEX-RN', 'Daily Sessions', 'Active']
    },
    {
      id: '2',
      name: 'Pharmacology Masters',
      description: 'Focus on mastering pharmacology for NCLEX',
      category: 'Pharmacological Therapies',
      memberCount: 8,
      maxMembers: 15,
      createdBy: 'Michael C.',
      createdAt: new Date('2024-02-01'),
      avatar: '💊',
      isPrivate: false,
      tags: ['Pharmacology', 'Advanced']
    }
  ]);

  const [availableGroups, setAvailableGroups] = useState<StudyGroup[]>([
    {
      id: '3',
      name: 'Morning Study Club',
      description: 'Early birds studying together 6-8 AM EST',
      category: 'General Study',
      memberCount: 15,
      maxMembers: 20,
      createdBy: 'Emily R.',
      createdAt: new Date('2024-01-20'),
      avatar: '🌅',
      isPrivate: false,
      tags: ['Morning', 'EST', 'Committed']
    },
    {
      id: '4',
      name: 'Maternal-Newborn Focus',
      description: 'Specialized group for maternal-newborn nursing',
      category: 'Health Promotion and Maintenance',
      memberCount: 10,
      maxMembers: 15,
      createdBy: 'Jessica P.',
      createdAt: new Date('2024-02-10'),
      avatar: '👶',
      isPrivate: false,
      tags: ['Maternal-Newborn', 'Specialized']
    },
    {
      id: '5',
      name: 'Weekend Warriors',
      description: 'Intensive weekend study sessions',
      category: 'General Study',
      memberCount: 18,
      maxMembers: 25,
      createdBy: 'David L.',
      createdAt: new Date('2024-01-25'),
      avatar: '⚡',
      isPrivate: false,
      tags: ['Weekend', 'Intensive']
    }
  ]);

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    {
      id: '1',
      name: 'Sarah Mitchell',
      role: 'owner',
      joinedAt: new Date('2024-01-15'),
      studyStreak: 15,
      contributionScore: 450,
      avatar: '👩‍⚕️'
    },
    {
      id: '2',
      name: 'John Davis',
      role: 'moderator',
      joinedAt: new Date('2024-01-16'),
      studyStreak: 12,
      contributionScore: 380,
      avatar: '👨‍⚕️'
    },
    {
      id: '3',
      name: 'Emily Chen',
      role: 'member',
      joinedAt: new Date('2024-01-18'),
      studyStreak: 10,
      contributionScore: 290,
      avatar: '👩‍🔬'
    },
    {
      id: '4',
      name: 'Michael Johnson',
      role: 'member',
      joinedAt: new Date('2024-01-20'),
      studyStreak: 8,
      contributionScore: 220,
      avatar: '👨‍🔬'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      role: 'member',
      joinedAt: new Date('2024-01-22'),
      studyStreak: 7,
      contributionScore: 180,
      avatar: '👩‍🎓'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      groupId: '1',
      senderId: '1',
      senderName: 'Sarah Mitchell',
      senderAvatar: '👩‍⚕️',
      content: 'Good morning everyone! Ready for today\'s study session?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: '2',
      groupId: '1',
      senderId: '2',
      senderName: 'John Davis',
      senderAvatar: '👨‍⚕️',
      content: 'Absolutely! I\'ve prepared some practice questions on cardiovascular medications.',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text'
    },
    {
      id: '3',
      groupId: '1',
      senderId: '3',
      senderName: 'Emily Chen',
      senderAvatar: '👩‍🔬',
      content: 'Can someone explain the difference between ACE inhibitors and ARBs? I keep mixing them up.',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      reactions: { '👍': ['1', '2'], '💡': ['4'] }
    },
    {
      id: '4',
      groupId: '1',
      senderId: '1',
      senderName: 'Sarah Mitchell',
      senderAvatar: '👩‍⚕️',
      content: 'Great question! ACE inhibitors block the conversion of angiotensin I to II, while ARBs block the receptors for angiotensin II. Both lower blood pressure but through different mechanisms.',
      timestamp: new Date(Date.now() - 1200000),
      type: 'text',
      reactions: { '🎯': ['3', '5'], '📚': ['2'] }
    },
    {
      id: '5',
      groupId: '1',
      senderId: '4',
      senderName: 'Michael Johnson',
      senderAvatar: '👨‍🔬',
      content: 'Thanks for the explanation! That makes it much clearer.',
      timestamp: new Date(Date.now() - 600000),
      type: 'text'
    }
  ]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: '1',
      groupId: '1',
      title: 'Pharmacology Review Session',
      description: 'Covering cardiovascular and respiratory medications',
      scheduledAt: new Date(Date.now() + 3600000),
      duration: 90,
      host: 'Sarah Mitchell',
      attendees: ['1', '2', '3', '5'],
      meetingLink: 'https://meet.nursehaven.com/pharm-review',
      status: 'scheduled'
    },
    {
      id: '2',
      groupId: '1',
      title: 'Practice Questions Marathon',
      description: '50 questions covering all NCLEX categories',
      scheduledAt: new Date(Date.now() + 86400000),
      duration: 120,
      host: 'John Davis',
      attendees: ['1', '2', '4'],
      status: 'scheduled'
    }
  ]);

  const [challenges, setChallenges] = useState<GroupChallenge[]>([
    {
      id: '1',
      groupId: '1',
      title: '100 Questions Challenge',
      description: 'Complete 100 practice questions as a group this week',
      goal: 100,
      currentProgress: 67,
      participants: ['1', '2', '3', '4', '5'],
      startDate: new Date(Date.now() - 3 * 86400000),
      endDate: new Date(Date.now() + 4 * 86400000),
      reward: '🏆 Champion Badge'
    },
    {
      id: '2',
      groupId: '1',
      title: '7-Day Study Streak',
      description: 'Study every day for 7 consecutive days',
      goal: 7,
      currentProgress: 4,
      participants: ['1', '2', '3'],
      startDate: new Date(Date.now() - 4 * 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      reward: '🔥 Streak Master'
    }
  ]);

  const handleCreateGroup = (groupData: Partial<StudyGroup>) => {
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      memberCount: 1,
      maxMembers: 20,
      createdBy: user?.name || 'You',
      createdAt: new Date(),
      avatar: '📚',
      isPrivate: false,
      tags: [],
      ...groupData
    } as StudyGroup;
    
    setMyGroups([...myGroups, newGroup]);
    setShowCreateGroup(false);
  };

  const handleJoinGroup = (group: StudyGroup) => {
    setMyGroups([...myGroups, { ...group, memberCount: group.memberCount + 1 }]);
    setAvailableGroups(availableGroups.filter(g => g.id !== group.id));
  };

  const handleLeaveGroup = (groupId: string) => {
    const group = myGroups.find(g => g.id === groupId);
    if (group) {
      setAvailableGroups([...availableGroups, { ...group, memberCount: group.memberCount - 1 }]);
    }
    setMyGroups(myGroups.filter(g => g.id !== groupId));
    setSelectedGroup(null);
    setActiveView('my-groups');
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedGroup) {
      const newMessage: Message = {
        id: Date.now().toString(),
        groupId: selectedGroup.id,
        senderId: user?.id || 'current-user',
        senderName: user?.name || 'You',
        senderAvatar: '👤',
        content: messageText,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const handleScheduleSession = (sessionData: Partial<StudySession>) => {
    if (selectedGroup) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        groupId: selectedGroup.id,
        host: user?.name || 'You',
        attendees: [user?.id || 'current-user'],
        status: 'scheduled',
        ...sessionData
      } as StudySession;
      setStudySessions([...studySessions, newSession]);
      setShowScheduleSession(false);
    }
  };

  const filteredAvailableGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Browse Groups View
  if (activeView === 'browse') {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl mb-2">👥 Discover Study Groups</h1>
            <p className="text-gray-600">Find and join study groups that match your goals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveView('my-groups')}>
              <ArrowLeft className="size-4 mr-2" />
              My Groups
            </Button>
            <Button onClick={() => setShowCreateGroup(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="size-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                <Input
                  placeholder="Search groups by name, category, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="size-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvailableGroups.map(group => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{group.avatar}</div>
                  <Badge variant="outline">{group.category}</Badge>
                </div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>{group.memberCount}/{group.maxMembers}</span>
                    </div>
                    <span>By {group.createdBy}</span>
                  </div>

                  <Button 
                    onClick={() => handleJoinGroup(group)} 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    <UserPlus className="size-4 mr-2" />
                    Join Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAvailableGroups.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="size-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No groups found matching your search</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // My Groups View
  if (activeView === 'my-groups') {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl mb-2">👥 My Study Groups</h1>
            <p className="text-gray-600">Collaborate and learn with your study partners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveView('browse')}>
              <Search className="size-4 mr-2" />
              Discover Groups
            </Button>
            <Button onClick={() => setShowCreateGroup(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="size-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* My Groups Grid */}
        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map(group => (
              <Card 
                key={group.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedGroup(group);
                  setActiveView('group-detail');
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{group.avatar}</div>
                    <Badge variant="outline">{group.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="size-4" />
                          <span>{group.memberCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="size-4" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGroup(group);
                        setActiveView('group-detail');
                      }}
                      className="w-full"
                    >
                      Open Group
                      <ChevronRight className="size-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="size-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No Study Groups Yet</h3>
              <p className="text-gray-600 mb-6">Join or create a study group to start collaborating</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setActiveView('browse')}>
                  <Search className="size-4 mr-2" />
                  Browse Groups
                </Button>
                <Button onClick={() => setShowCreateGroup(true)} variant="outline">
                  <Plus className="size-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Group Detail View
  if (activeView === 'group-detail' && selectedGroup) {
    const groupMessages = messages.filter(m => m.groupId === selectedGroup.id);
    const groupSessions = studySessions.filter(s => s.groupId === selectedGroup.id);
    const groupChallenges = challenges.filter(c => c.groupId === selectedGroup.id);

    return (
      <div className="max-w-7xl mx-auto p-4">
        {/* Group Header */}
        <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-5xl">{selectedGroup.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl">{selectedGroup.name}</h2>
                    <Badge>{selectedGroup.category}</Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{selectedGroup.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      <span>{selectedGroup.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-purple-600" />
                      <span>Created {selectedGroup.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                  <Share2 className="size-4 mr-2" />
                  Invite
                </Button>
                <Button variant="outline" onClick={() => setActiveView('my-groups')}>
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Group Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="chat">
              <MessageSquare className="size-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Video className="size-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="size-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Trophy className="size-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="size-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Area */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Group Chat</CardTitle>
                  <CardDescription>Real-time messaging with group members</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <ScrollArea className="h-[500px] mb-4">
                    <div className="space-y-4">
                      {groupMessages.map(message => (
                        <div key={message.id} className="flex gap-3">
                          <div className="text-2xl">{message.senderAvatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{message.senderName}</span>
                              <span className="text-xs text-gray-600">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3 inline-block max-w-full">
                              <p className="text-sm">{message.content}</p>
                            </div>
                            {message.reactions && Object.keys(message.reactions).length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {Object.entries(message.reactions).map(([emoji, userIds]) => (
                                  <Badge key={emoji} variant="secondary" className="text-xs">
                                    {emoji} {userIds.length}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Online Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Online Now</CardTitle>
                  <CardDescription>{groupMembers.slice(0, 3).length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupMembers.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="relative">
                          <div className="text-2xl">{member.avatar}</div>
                          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{member.name}</p>
                            {member.role === 'owner' && <Crown className="size-3 text-yellow-600" />}
                            {member.role === 'moderator' && <Shield className="size-3 text-blue-600" />}
                          </div>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">Study Sessions</h3>
                  <p className="text-gray-600">Schedule and join group study sessions</p>
                </div>
                <Button onClick={() => setShowScheduleSession(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Plus className="size-4 mr-2" />
                  Schedule Session
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupSessions.map(session => {
                  const isPast = session.scheduledAt < new Date();
                  const isToday = session.scheduledAt.toDateString() === new Date().toDateString();
                  
                  return (
                    <Card key={session.id} className={session.status === 'ongoing' ? 'border-2 border-green-400 bg-green-50' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <Badge className={
                            session.status === 'ongoing' ? 'bg-green-600' :
                            session.status === 'completed' ? 'bg-gray-600' :
                            'bg-blue-600'
                          }>
                            {session.status}
                          </Badge>
                        </div>
                        <CardDescription>{session.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-blue-600" />
                            <span>{session.scheduledAt.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                            {isToday && <Badge variant="secondary">Today</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="size-4 text-purple-600" />
                            <span>{session.scheduledAt.toLocaleTimeString()} • {session.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="size-4 text-green-600" />
                            <span>Hosted by {session.host}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="size-4 text-orange-600" />
                            <span>{session.attendees.length} attending</span>
                          </div>
                        </div>

                        {session.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-green-600">
                              <Check className="size-4 mr-2" />
                              Attend
                            </Button>
                            {session.meetingLink && (
                              <Button variant="outline">
                                <Video className="size-4 mr-2" />
                                Join Link
                              </Button>
                            )}
                          </div>
                        )}

                        {session.status === 'ongoing' && (
                          <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                            <Video className="size-4 mr-2" />
                            Join Now (Live)
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {groupSessions.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <Video className="size-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No sessions scheduled yet</p>
                    <Button onClick={() => setShowScheduleSession(true)}>
                      <Plus className="size-4 mr-2" />
                      Schedule First Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Group Members</CardTitle>
                    <CardDescription>{groupMembers.length} total members</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="size-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-3xl">{member.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p>{member.name}</p>
                          {member.role === 'owner' && (
                            <Badge className="bg-yellow-600">
                              <Crown className="size-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                          {member.role === 'moderator' && (
                            <Badge className="bg-blue-600">
                              <Shield className="size-3 mr-1" />
                              Moderator
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Flame className="size-4 text-orange-500" />
                            {member.studyStreak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="size-4 text-yellow-500" />
                            {member.contributionScore} points
                          </span>
                          <span>Joined {member.joinedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">Group Challenges</h3>
                  <p className="text-gray-600">Compete and motivate each other</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600">
                  <Plus className="size-4 mr-2" />
                  Create Challenge
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupChallenges.map(challenge => {
                  const progress = (challenge.currentProgress / challenge.goal) * 100;
                  const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={challenge.id} className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 mb-2">
                              <Trophy className="size-5 text-yellow-600" />
                              {challenge.title}
                            </CardTitle>
                            <CardDescription>{challenge.description}</CardDescription>
                          </div>
                          <Badge className="bg-yellow-600">{daysLeft}d left</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">Progress</span>
                            <span className="text-lg">
                              {challenge.currentProgress}/{challenge.goal}
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-blue-600" />
                            <span className="text-sm">{challenge.participants.length} participating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="size-4 text-yellow-600" />
                            <span className="text-sm">{challenge.reward}</span>
                          </div>
                        </div>

                        <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600">
                          <Zap className="size-4 mr-2" />
                          Join Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shared Resources</CardTitle>
                    <CardDescription>Study materials shared by group members</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                    <Plus className="size-4 mr-2" />
                    Upload Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Pharmacology Study Guide.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'Sarah Mitchell', date: '2 days ago' },
                    { name: 'NCLEX Practice Questions.docx', type: 'DOC', size: '1.8 MB', uploadedBy: 'John Davis', date: '3 days ago' },
                    { name: 'Lab Values Cheat Sheet.pdf', type: 'PDF', size: '850 KB', uploadedBy: 'Emily Chen', date: '5 days ago' },
                  ].map((resource, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 border">
                      <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1">{resource.name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>by {resource.uploadedBy}</span>
                          <span>•</span>
                          <span>{resource.date}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="size-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leave Group Button */}
        <Card className="mt-6 border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Leave this group</p>
                <p className="text-sm text-gray-600">You can always rejoin later</p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to leave this group?')) {
                    handleLeaveGroup(selectedGroup.id);
                  }
                }}
              >
                Leave Group
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
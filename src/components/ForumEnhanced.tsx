import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Search,
  Plus,
  Pin,
  CheckCircle,
  AlertCircle,
  Flame,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Stethoscope,
  Heart,
  Brain,
  Send,
  MoreVertical,
  Flag,
  Bookmark,
  Share2
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface ForumProps {
  onBack: () => void;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'admin';
    verified: boolean;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: Reply[];
  views: number;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: Date;
}

interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'admin';
    verified: boolean;
  };
  likes: number;
  isAnswer: boolean;
  createdAt: Date;
}

const categories = [
  { id: 'all', name: 'All Topics', icon: MessageSquare, color: 'gray' },
  { id: 'fundamentals', name: 'Fundamentals', icon: BookOpen, color: 'blue' },
  { id: 'pharmacology', name: 'Pharmacology', icon: Stethoscope, color: 'green' },
  { id: 'med-surg', name: 'Med-Surg', icon: Heart, color: 'red' },
  { id: 'mental-health', name: 'Mental Health', icon: Brain, color: 'purple' },
  { id: 'test-tips', name: 'Test Tips', icon: TrendingUp, color: 'yellow' }
];

// Sample forum data
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'Best way to memorize lab values for NCLEX?',
    content: 'I\'m struggling to remember all the normal lab values. Does anyone have any good mnemonics or study techniques that worked for them? I keep mixing up sodium and potassium ranges.',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'student',
      verified: true
    },
    category: 'test-tips',
    tags: ['lab-values', 'study-tips', 'nclex-rn'],
    likes: 24,
    replies: [
      {
        id: 'r1',
        content: 'I used flashcards with Anki! The spaced repetition really helped. I also made up silly stories for each value to help remember them. For sodium (135-145), I imagined "13-5" people at a party with "14-5" pieces of pizza. Weird but it worked!',
        author: {
          name: 'Mike Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          role: 'student',
          verified: false
        },
        likes: 12,
        isAnswer: false,
        createdAt: new Date('2024-11-14T10:30:00')
      },
      {
        id: 'r2',
        content: 'Create a chart grouping similar labs together (electrolytes, cardiac markers, liver function, etc). Practice with NCLEX-style questions that incorporate lab values. Don\'t just memorize - understand what each value means clinically.',
        author: {
          name: 'Dr. Emily Rodriguez',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
          role: 'instructor',
          verified: true
        },
        likes: 45,
        isAnswer: true,
        createdAt: new Date('2024-11-14T11:15:00')
      }
    ],
    views: 342,
    isPinned: true,
    isResolved: true,
    createdAt: new Date('2024-11-14T09:00:00')
  },
  {
    id: '2',
    title: 'Priority Question Strategy - Help!',
    content: 'I always struggle with priority questions on practice exams. How do you decide which patient to see first? Is there a reliable framework I should be using? Sometimes ABC doesn\'t seem to apply...',
    author: {
      name: 'Jessica Martinez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
      role: 'student',
      verified: false
    },
    category: 'test-tips',
    tags: ['priority-questions', 'test-strategy', 'nclex-tips'],
    likes: 31,
    replies: [
      {
        id: 'r3',
        content: 'ABC is your first step! Then think Maslow\'s hierarchy. After that, consider acute vs chronic, stable vs unstable. Remember: unstable or worsening = priority. A patient going into respiratory distress beats stable chest pain every time.',
        author: {
          name: 'Prof. Anderson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anderson',
          role: 'instructor',
          verified: true
        },
        likes: 38,
        isAnswer: true,
        createdAt: new Date('2024-11-13T14:20:00')
      }
    ],
    views: 289,
    isPinned: false,
    isResolved: true,
    createdAt: new Date('2024-11-13T13:00:00')
  },
  {
    id: '3',
    title: 'Insulin administration question',
    content: 'Can someone explain the difference between rapid-acting, short-acting, and long-acting insulin? I keep confusing which one to give before meals. Also, does it matter where you inject it?',
    author: {
      name: 'David Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      role: 'student',
      verified: false
    },
    category: 'pharmacology',
    tags: ['insulin', 'diabetes', 'medication'],
    likes: 18,
    replies: [
      {
        id: 'r4',
        content: 'Rapid-acting (lispro, aspart) - give 5-15 min before meals, peaks in 1 hour. Short-acting (regular) - give 30 min before meals, peaks 2-4 hours. Long-acting (glargine, detemir) - once daily, no peak, provides basal coverage. Rotate injection sites to prevent lipohypertrophy!',
        author: {
          name: 'Amanda White',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
          role: 'student',
          verified: true
        },
        likes: 22,
        isAnswer: true,
        createdAt: new Date('2024-11-12T16:45:00')
      }
    ],
    views: 156,
    isPinned: false,
    isResolved: true,
    createdAt: new Date('2024-11-12T15:30:00')
  },
  {
    id: '4',
    title: 'Taking NCLEX next week - any last minute tips?',
    content: 'My test is scheduled for next Tuesday! I\'m feeling anxious. What should I focus on in these final days? Should I keep doing practice questions or just review content?',
    author: {
      name: 'Rachel Thompson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
      role: 'student',
      verified: false
    },
    category: 'test-tips',
    tags: ['nclex-week', 'test-anxiety', 'final-prep'],
    likes: 42,
    replies: [],
    views: 523,
    isPinned: false,
    isResolved: false,
    createdAt: new Date('2024-11-15T08:00:00')
  },
  {
    id: '5',
    title: 'Cardiac rhythms - how to master them?',
    content: 'I need help understanding EKG strips. V-tach, V-fib, A-fib - they all look similar to me. What\'s the best way to learn to read cardiac rhythms quickly?',
    author: {
      name: 'Chris Davis',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
      role: 'student',
      verified: false
    },
    category: 'med-surg',
    tags: ['cardiac', 'ekg', 'rhythms'],
    likes: 27,
    replies: [
      {
        id: 'r5',
        content: 'Practice, practice, practice! Look at strips daily. Start with normal sinus, then learn the life-threatening ones (V-fib, V-tach, asystole). Use the systematic approach: rate, rhythm, P waves, PR interval, QRS. Check out EKG practice websites - they have tons of strips to review.',
        author: {
          name: 'Nurse Kelly',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kelly',
          role: 'instructor',
          verified: true
        },
        likes: 35,
        isAnswer: true,
        createdAt: new Date('2024-11-11T13:30:00')
      }
    ],
    views: 234,
    isPinned: false,
    isResolved: true,
    createdAt: new Date('2024-11-11T12:00:00')
  }
];

export function Forum({ onBack }: ForumProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [replyContent, setReplyContent] = useState('');

  // New post form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('fundamentals');
  const [newPostTags, setNewPostTags] = useState('');

  // Filter posts
  const filteredPosts = posts
    .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
    .filter(post => 
      searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'unanswered') return (a.replies.length === 0 ? -1 : 1) - (b.replies.length === 0 ? -1 : 1);
      return 0;
    });

  const handleCreatePost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: {
        name: user?.name || 'Anonymous',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`,
        role: 'student',
        verified: false
      },
      category: newPostCategory,
      tags: newPostTags.split(',').map(t => t.trim()),
      likes: 0,
      replies: [],
      views: 0,
      isPinned: false,
      isResolved: false,
      createdAt: new Date()
    };

    setPosts([newPost, ...posts]);
    setShowNewPostDialog(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
  };

  const handleReply = () => {
    if (!selectedPost || !replyContent.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      content: replyContent,
      author: {
        name: user?.name || 'Anonymous',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`,
        role: 'student',
        verified: false
      },
      likes: 0,
      isAnswer: false,
      createdAt: new Date()
    };

    const updatedPosts = posts.map(post => {
      if (post.id === selectedPost.id) {
        return { ...post, replies: [...post.replies, newReply] };
      }
      return post;
    });

    setPosts(updatedPosts);
    setSelectedPost({ ...selectedPost, replies: [...selectedPost.replies, newReply] });
    setReplyContent('');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Post List View
  if (!selectedPost) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                <MessageSquare className="size-5 sm:size-7 text-white" />
              </div>
              Community Forum
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Connect with fellow nursing students and instructors</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="mr-2 size-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>Ask a question or start a discussion</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What's your question?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {categories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Describe your question in detail..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      placeholder="nclex, pharmacology, study-tips"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCreatePost} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                      Post Question
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  onClick={() => setSortBy('recent')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Clock className="mr-1 sm:mr-2 size-3 sm:size-4" />
                  Recent
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  onClick={() => setSortBy('popular')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Flame className="mr-1 sm:mr-2 size-3 sm:size-4" />
                  Popular
                </Button>
                <Button
                  variant={sortBy === 'unanswered' ? 'default' : 'outline'}
                  onClick={() => setSortBy('unanswered')}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <AlertCircle className="mr-1 sm:mr-2 size-3 sm:size-4" />
                  Unanswered
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                <Icon className="size-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="size-8 text-purple-600" />
                <div>
                  <p className="text-2xl text-gray-900">{posts.length}</p>
                  <p className="text-sm text-gray-600">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="size-8 text-blue-600" />
                <div>
                  <p className="text-2xl text-gray-900">127</p>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-8 text-green-600" />
                <div>
                  <p className="text-2xl text-gray-900">{posts.filter(p => p.isResolved).length}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Flame className="size-8 text-orange-600" />
                <div>
                  <p className="text-2xl text-gray-900">45</p>
                  <p className="text-sm text-gray-600">Hot Topics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedPost(post)}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="size-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl">
                      {post.author.name[0]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Pin className="size-4 text-blue-600" />}
                          {post.isResolved && <CheckCircle className="size-4 text-green-600" />}
                          <h3 className="text-lg text-gray-900">{post.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{post.author.name}</span>
                          {post.author.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="size-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {post.author.role === 'instructor' && (
                            <Badge className="text-xs bg-blue-100 text-blue-800">Instructor</Badge>
                          )}
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="size-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="size-4" />
                        <span>{post.replies.length} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{post.views} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <MessageSquare className="size-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Post Detail View
  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-6">
        <ArrowLeft className="mr-2 size-4" />
        Back to Forum
      </Button>

      {/* Post */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="size-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl">
                {selectedPost.author.name[0]}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPost.isPinned && <Pin className="size-5 text-blue-600" />}
                    {selectedPost.isResolved && <CheckCircle className="size-5 text-green-600" />}
                    <h1 className="text-2xl text-gray-900">{selectedPost.title}</h1>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-900">{selectedPost.author.name}</span>
                    {selectedPost.author.verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="size-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {selectedPost.author.role === 'instructor' && (
                      <Badge className="text-xs bg-blue-100 text-blue-800">Instructor</Badge>
                    )}
                    <span>•</span>
                    <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPost.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-gray-800 mb-6 whitespace-pre-wrap">{selectedPost.content}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLikePost(selectedPost.id)}
                >
                  <ThumbsUp className="mr-2 size-4" />
                  Like ({selectedPost.likes})
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 size-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="mr-2 size-4" />
                  Save
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="mr-2 size-4" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{selectedPost.replies.length} Replies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedPost.replies.map(reply => (
            <div key={reply.id} className={`flex gap-4 ${reply.isAnswer ? 'p-4 bg-green-50 border-2 border-green-200 rounded-lg' : ''}`}>
              <div className="shrink-0">
                <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-lg">
                  {reply.author.name[0]}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-900">{reply.author.name}</span>
                  {reply.author.verified && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="size-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {reply.author.role === 'instructor' && (
                    <Badge className="text-xs bg-blue-100 text-blue-800">Instructor</Badge>
                  )}
                  {reply.isAnswer && (
                    <Badge className="text-xs bg-green-600 text-white">
                      <CheckCircle className="size-3 mr-1" />
                      Accepted Answer
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">• {formatTimeAgo(reply.createdAt)}</span>
                </div>

                <p className="text-gray-800 mb-3">{reply.content}</p>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="mr-2 size-4" />
                    {reply.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Reply className="mr-2 size-4" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Your Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts or answer..."
            className="min-h-[120px] mb-4"
          />
          <div className="flex gap-3">
            <Button onClick={handleReply} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Send className="mr-2 size-4" />
              Post Reply
            </Button>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

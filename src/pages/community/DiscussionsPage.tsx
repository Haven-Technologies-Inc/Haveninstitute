/**
 * Discussions Page - Main Community Hub for NCLEX Nursing Students
 * Mobile-first responsive design
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, Search, Plus, Filter, TrendingUp, Clock, 
  Flame, HelpCircle, Eye, ThumbsUp, MessageCircle, CheckCircle2, 
  Pin, Lock, X, Lightbulb, FileText, ClipboardList, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../components/ui/utils';
import type { DiscussionPost, PostType, SortOption } from '../../types/discussions';

// Post type config
const POST_TYPES: Record<PostType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  question: { label: 'Question', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  discussion: { label: 'Discussion', icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  'study-tip': { label: 'Study Tip', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100' },
  resource: { label: 'Resource', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'case-study': { label: 'Case Study', icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-100' },
  mnemonics: { label: 'Mnemonic', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-100' },
};

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Popular', icon: Flame },
  { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
];

// Mock data for demo
const MOCK_POSTS: DiscussionPost[] = [
  {
    id: '1', slug: 'best-way-to-memorize-lab-values', title: 'Best way to memorize lab values for NCLEX?',
    content: '', excerpt: "I'm struggling to remember all the normal lab values. Does anyone have good mnemonics?",
    type: 'question', status: 'answered', author: { id: '1', firstName: 'Sarah', lastName: 'J', displayName: 'Sarah J.', role: 'student', isVerified: true, badges: [], stats: { postsCount: 12, helpfulCount: 45, reputation: 320 } },
    categoryId: '1', category: { id: '1', name: 'Lab Values', slug: 'lab-values', description: '', icon: 'TestTube', color: '#ec4899', postCount: 45, isNclexCategory: true, createdAt: '', updatedAt: '' },
    tags: ['lab-values', 'study-tips', 'nclex-rn'], nclexTopics: [], isPinned: true, isLocked: false, isFeatured: false,
    viewCount: 342, likeCount: 24, commentCount: 8, bookmarkCount: 15, shareCount: 3, hasAcceptedAnswer: true, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: '', lastActivityAt: ''
  },
  {
    id: '2', slug: 'priority-question-strategy', title: 'Priority Question Strategy - Help!',
    content: '', excerpt: "I always struggle with priority questions. How do you decide which patient to see first?",
    type: 'question', status: 'open', author: { id: '2', firstName: 'Mike', lastName: 'C', displayName: 'Mike C.', role: 'student', isVerified: false, badges: [], stats: { postsCount: 5, helpfulCount: 12, reputation: 80 } },
    categoryId: '2', category: { id: '2', name: 'NCLEX Strategy', slug: 'nclex-strategy', description: '', icon: 'Target', color: '#06b6d4', postCount: 78, isNclexCategory: true, createdAt: '', updatedAt: '' },
    tags: ['priority', 'test-strategy'], nclexTopics: [], isPinned: false, isLocked: false, isFeatured: false,
    viewCount: 189, likeCount: 31, commentCount: 5, bookmarkCount: 8, shareCount: 2, hasAcceptedAnswer: false, createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: '', lastActivityAt: ''
  },
  {
    id: '3', slug: 'insulin-administration-mnemonic', title: 'Insulin Administration Mnemonic: "Clear Before Cloudy"',
    content: '', excerpt: "Here's my favorite way to remember insulin mixing order. Clear (regular) is drawn up first!",
    type: 'mnemonics', status: 'resolved', author: { id: '3', firstName: 'Dr. Emily', lastName: 'R', displayName: 'Dr. Emily R.', role: 'instructor', isVerified: true, badges: [], stats: { postsCount: 89, helpfulCount: 456, reputation: 2100 } },
    categoryId: '3', category: { id: '3', name: 'Pharmacology', slug: 'pharmacology', description: '', icon: 'Pill', color: '#f59e0b', postCount: 156, isNclexCategory: true, createdAt: '', updatedAt: '' },
    tags: ['insulin', 'diabetes', 'pharmacology', 'mnemonics'], nclexTopics: [], isPinned: false, isLocked: false, isFeatured: true,
    viewCount: 567, likeCount: 89, commentCount: 12, bookmarkCount: 45, shareCount: 23, hasAcceptedAnswer: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: '', lastActivityAt: ''
  },
];

const MOCK_CATEGORIES = [
  { id: '1', name: 'Safe & Effective Care', slug: 'safe-care', color: '#3b82f6', postCount: 234 },
  { id: '2', name: 'Pharmacology', slug: 'pharmacology', color: '#f59e0b', postCount: 156 },
  { id: '3', name: 'NCLEX Strategy', slug: 'nclex-strategy', color: '#06b6d4', postCount: 78 },
  { id: '4', name: 'Lab Values', slug: 'lab-values', color: '#ec4899', postCount: 45 },
  { id: '5', name: 'Psychosocial', slug: 'psychosocial', color: '#8b5cf6', postCount: 92 },
];

// Post Card Component
function PostCard({ post, onClick }: { post: DiscussionPost; onClick: () => void }) {
  const postType = POST_TYPES[post.type];
  const TypeIcon = postType?.icon || MessageSquare;
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 active:scale-[0.99]" style={{ borderLeftColor: post.category?.color }} onClick={onClick}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2.5 sm:gap-3">
          <div className="hidden sm:block shrink-0">
            <Avatar className="size-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                {post.author.firstName?.[0]}{post.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {post.isPinned && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]"><Pin className="size-2.5 mr-0.5" />Pinned</Badge>}
              {post.hasAcceptedAnswer && <Badge className="h-5 px-1.5 text-[10px] bg-green-500"><CheckCircle2 className="size-2.5 mr-0.5" />Answered</Badge>}
              <Badge className={cn('h-5 px-1.5 text-[10px]', postType?.bg, postType?.color)}><TypeIcon className="size-2.5 mr-0.5" />{postType?.label}</Badge>
            </div>
            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">{post.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>
            {post.tags?.length > 0 && (
              <div className="flex gap-1 mb-2 overflow-hidden">
                {post.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px]">#{tag}</Badge>)}
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><ThumbsUp className="size-3" />{post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageCircle className="size-3" />{post.commentCount}</span>
                <span className="flex items-center gap-1"><Eye className="size-3" />{post.viewCount}</span>
              </div>
              <span>{post.author.displayName} • {timeAgo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

export function DiscussionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sortBy = (searchParams.get('sort') as SortOption) || 'latest';
  const categoryId = searchParams.get('category');
  const postType = searchParams.get('type') as PostType | undefined;

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleCategoryChange = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    id ? params.set('category', id) : params.delete('category');
    setSearchParams(params);
  };

  const filteredPosts = MOCK_POSTS.filter(p => {
    if (categoryId && p.categoryId !== categoryId) return false;
    if (postType && p.type !== postType) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <MessageSquare className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Discussions</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Connect with fellow nursing students</p>
              </div>
            </div>
            <Button onClick={() => navigate('/app/discussions/new')} className="bg-gradient-to-r from-blue-600 to-purple-600 h-9 px-3 text-sm">
              <Plus className="size-4 mr-1" />New Post
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search discussions..." className="pl-9 h-9 text-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 lg:hidden" onClick={() => setShowFilters(!showFilters)}><Filter className="size-4" /></Button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <Tabs value={sortBy} onValueChange={(v: string) => handleSortChange(v as SortOption)}>
              <TabsList className="h-8 p-0.5">
                {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger key={value} value={value} className="h-7 px-2.5 text-xs gap-1"><Icon className="size-3" />{label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Categories</CardTitle></CardHeader>
              <CardContent className="px-2 pb-3 space-y-0.5">
                <button onClick={() => handleCategoryChange(null)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', !categoryId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100')}>All</button>
                {MOCK_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2', categoryId === cat.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100')}>
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{cat.postCount}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Posts */}
          <div className="lg:col-span-3 space-y-3">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} onClick={() => navigate(`/app/discussions/${post.slug}`)} />)
            ) : (
              <Card><CardContent className="py-12 text-center">
                <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                <p className="text-sm text-gray-500 mb-4">Be the first to start a conversation!</p>
                <Button onClick={() => navigate('/app/discussions/new')}><Plus className="size-4 mr-2" />Create Post</Button>
              </CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscussionsPage;

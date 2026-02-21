'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  MessageSquare,
  Heart,
  Eye,
  ArrowUpDown,
  Clock,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Brain,
  Stethoscope,
  Pill,
  Shield,
  CheckCircle2,
  Pin,
  Users,
  FileText,
  Flame,
  Send,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface DiscussionAuthor {
  name: string;
  avatar: string | null;
}

interface Discussion {
  slug: string;
  title: string;
  excerpt: string;
  author: DiscussionAuthor;
  category: string;
  date: Date;
  replies: number;
  likes: number;
  views: number;
  isPinned: boolean;
  isResolved: boolean;
  tags: string[];
}

interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ── Data ───────────────────────────────────────────────────────────

const categories: Category[] = [
  { name: 'All', icon: MessageSquare, count: 156 },
  { name: 'General', icon: MessageSquare, count: 35 },
  { name: 'NCLEX Tips', icon: Brain, count: 28 },
  { name: 'Study Groups', icon: Users, count: 22 },
  { name: 'Pharmacology', icon: Pill, count: 34 },
  { name: 'Management of Care', icon: Shield, count: 19 },
  { name: 'Clinical', icon: Stethoscope, count: 18 },
];

const sortOptions: SortOption[] = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
];

const discussions: Discussion[] = [
  {
    slug: 'best-way-to-memorize-drug-classifications',
    title: 'Best way to memorize drug classifications?',
    excerpt:
      "I'm struggling with remembering all the different drug classes and their mechanisms. What mnemonics or techniques have worked for you?",
    author: { name: 'Sarah Chen', avatar: null },
    category: 'Pharmacology',
    date: new Date('2026-02-20T14:30:00'),
    replies: 24,
    likes: 48,
    views: 312,
    isPinned: true,
    isResolved: true,
    tags: ['pharmacology', 'mnemonics', 'study-tips'],
  },
  {
    slug: 'cat-simulation-vs-actual-nclex',
    title: 'How accurate are CAT simulations compared to the actual NCLEX?',
    excerpt:
      'Those who have taken the real NCLEX - how did CAT practice simulations compare in difficulty and question style?',
    author: { name: 'Marcus Johnson', avatar: null },
    category: 'NCLEX Tips',
    date: new Date('2026-02-20T10:15:00'),
    replies: 18,
    likes: 35,
    views: 256,
    isPinned: true,
    isResolved: false,
    tags: ['cat-exam', 'nclex', 'experience'],
  },
  {
    slug: 'delegation-and-prioritization-tips',
    title: 'Delegation and prioritization - anyone else finding these tough?',
    excerpt:
      'I keep getting delegation questions wrong. The answer choices always seem so similar. How do you approach these?',
    author: { name: 'Emily Rodriguez', avatar: null },
    category: 'Management of Care',
    date: new Date('2026-02-19T16:45:00'),
    replies: 31,
    likes: 62,
    views: 445,
    isPinned: false,
    isResolved: true,
    tags: ['delegation', 'prioritization', 'management'],
  },
  {
    slug: 'study-schedule-for-working-nurses',
    title: 'Study schedule for working nurses - how do you balance it all?',
    excerpt:
      'I work 3 twelve-hour shifts a week and struggle to find time to study. What schedules have worked for other working nurses?',
    author: { name: 'Jessica Park', avatar: null },
    category: 'Study Groups',
    date: new Date('2026-02-19T09:20:00'),
    replies: 42,
    likes: 89,
    views: 678,
    isPinned: false,
    isResolved: false,
    tags: ['work-life-balance', 'study-schedule'],
  },
  {
    slug: 'fluid-and-electrolyte-cheat-sheet',
    title: 'Fluid and Electrolyte imbalances - my comprehensive cheat sheet',
    excerpt:
      'After weeks of struggling, I created a detailed cheat sheet for all fluid and electrolyte imbalances. Sharing here for everyone!',
    author: { name: 'David Kim', avatar: null },
    category: 'Clinical',
    date: new Date('2026-02-18T20:00:00'),
    replies: 56,
    likes: 124,
    views: 892,
    isPinned: false,
    isResolved: false,
    tags: ['fluid-electrolyte', 'cheat-sheet', 'resource'],
  },
  {
    slug: 'nclex-anxiety-and-mental-health',
    title: "Dealing with NCLEX anxiety - you're not alone",
    excerpt:
      "Let's talk about the mental health side of NCLEX prep. I've been feeling overwhelmed and want to share some coping strategies.",
    author: { name: 'Alex Thompson', avatar: null },
    category: 'General',
    date: new Date('2026-02-18T15:30:00'),
    replies: 38,
    likes: 97,
    views: 543,
    isPinned: false,
    isResolved: false,
    tags: ['mental-health', 'anxiety', 'support'],
  },
  {
    slug: 'pediatric-growth-milestones-tips',
    title: 'Pediatric growth and development milestones - easy memory tricks',
    excerpt:
      'I found these amazing tricks to remember all the developmental milestones. Works perfectly for NCLEX questions!',
    author: { name: 'Maria Garcia', avatar: null },
    category: 'Clinical',
    date: new Date('2026-02-17T11:00:00'),
    replies: 15,
    likes: 41,
    views: 287,
    isPinned: false,
    isResolved: false,
    tags: ['pediatrics', 'milestones', 'memory-tricks'],
  },
];

// ── Component ──────────────────────────────────────────────────────

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [dialogOpen, setDialogOpen] = useState(false);

  // New post form state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDiscussions = discussions
    .filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'unanswered') return a.replies - b.replies;
      return b.date.getTime() - a.date.getTime();
    });

  const myPostsCount = 3;
  const totalReplies = discussions.reduce((sum, d) => sum + d.replies, 0);
  const popularCount = discussions.filter((d) => d.likes >= 50).length;

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostCategory || !newPostContent.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setDialogOpen(false);
    setNewPostTitle('');
    setNewPostCategory('');
    setNewPostContent('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Discussions"
        description="Ask questions, share knowledge, and connect with peers"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="What would you like to discuss?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger id="post-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.name !== 'All')
                      .map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <textarea
                  id="post-content"
                  rows={5}
                  placeholder="Share your thoughts, questions, or insights..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={
                    isSubmitting ||
                    !newPostTitle.trim() ||
                    !newPostCategory ||
                    !newPostContent.trim()
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post Discussion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Posts"
          value={discussions.length}
          change="+12 this week"
          icon={FileText}
          iconColor="text-indigo-500"
        />
        <StatCard
          label="My Posts"
          value={myPostsCount}
          change="+1 today"
          icon={MessageSquare}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Replies"
          value={totalReplies}
          change="+48 this week"
          icon={MessageSquare}
          iconColor="text-emerald-500"
        />
        <StatCard
          label="Popular"
          value={popularCount}
          change="50+ likes"
          icon={Flame}
          iconColor="text-orange-500"
        />
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background/60 backdrop-blur-sm"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
                selectedCategory === cat.name
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              )}
            >
              <cat.icon className="h-3 w-3" />
              {cat.name}
              <span className="text-[10px] opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                sortBy === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <option.icon className="h-3 w-3" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discussion List */}
      {filteredDiscussions.length > 0 ? (
        <div className="space-y-3">
          {filteredDiscussions.map((post) => (
            <Link
              key={post.slug}
              href={`/community/discussions/${post.slug}`}
            >
              <Card className="group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300 mb-3">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                      {post.author.avatar && (
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      )}
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {post.isPinned && (
                          <Pin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        )}
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        {post.isResolved && (
                          <Badge variant="success" className="text-[10px] shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-xs text-muted-foreground">
                          {post.author.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {post.category}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(post.date)}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Load More */}
          <div className="flex justify-center pt-4">
            <Button variant="outline">Load More Discussions</Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No discussions found"
          description="Try adjusting your search or filters, or start a new discussion to get the conversation going."
        >
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Start a Discussion
          </Button>
        </EmptyState>
      )}
    </div>
  );
}

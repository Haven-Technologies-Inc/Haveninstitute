'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
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
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: DiscussionAuthor;
  category: string;
  categoryId?: string;
  date: string;
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

// ── Static config ───────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  All: MessageSquare,
  General: MessageSquare,
  'NCLEX Tips': Brain,
  'Study Groups': Users,
  Pharmacology: Pill,
  'Management of Care': Shield,
  Clinical: Stethoscope,
};

const STATIC_CATEGORIES: Category[] = [
  { name: 'All', icon: MessageSquare, count: 0 },
  { name: 'General', icon: MessageSquare, count: 0 },
  { name: 'NCLEX Tips', icon: Brain, count: 0 },
  { name: 'Study Groups', icon: Users, count: 0 },
  { name: 'Pharmacology', icon: Pill, count: 0 },
  { name: 'Management of Care', icon: Shield, count: 0 },
  { name: 'Clinical', icon: Stethoscope, count: 0 },
];

const sortOptions: SortOption[] = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
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

  // Data state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch discussions from API
  const fetchDiscussions = useCallback(
    async (append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        if (sortBy) params.set('sort', sortBy);
        if (debouncedSearch) params.set('search', debouncedSearch);
        params.set('limit', '20');
        if (append && discussions.length > 0) {
          params.set('offset', String(discussions.length));
        }

        const res = await fetch(`/api/discussions?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          const posts = Array.isArray(json.data)
            ? json.data
            : json.data.posts ?? json.data.discussions ?? json.data.items ?? [];

          // Normalize the data
          const normalized: Discussion[] = posts.map((p: any) => ({
            id: p.id,
            slug: p.slug || p.id,
            title: p.title || '',
            excerpt: p.excerpt || p.content?.slice(0, 200) || '',
            content: p.content,
            author: {
              name: p.author?.fullName || p.author?.name || p.authorName || 'Unknown',
              avatar: p.author?.avatarUrl || p.author?.avatar || p.authorAvatar || null,
            },
            category: typeof p.category === 'object' ? p.category?.name : (p.category || p.categoryName || ''),
            categoryId: p.categoryId,
            date: p.date || p.createdAt || p.created_at || new Date().toISOString(),
            replies: p.replies ?? p.replyCount ?? p.commentCount ?? p._count?.comments ?? 0,
            likes: p.likes ?? p.likeCount ?? p._count?.reactions ?? 0,
            views: p.views ?? p.viewCount ?? 0,
            isPinned: p.isPinned ?? p.pinned ?? false,
            isResolved: p.isResolved ?? p.resolved ?? false,
            tags: p.tags ?? [],
          }));

          if (append) {
            setDiscussions((prev) => [...prev, ...normalized]);
          } else {
            setDiscussions(normalized);
          }

          // Determine if there are more to load
          const total = json.data.total ?? json.data.totalCount;
          if (total !== undefined) {
            const newTotal = append ? discussions.length + normalized.length : normalized.length;
            setHasMore(newTotal < total);
          } else {
            setHasMore(normalized.length >= 20);
          }
        }
      } catch (err) {
        console.error('Failed to fetch discussions:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, sortBy, debouncedSearch, discussions.length],
  );

  // Fetch on filter/sort/search change
  useEffect(() => {
    fetchDiscussions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, debouncedSearch]);

  // Compute stats from loaded discussions
  const totalReplies = discussions.reduce((sum, d) => sum + d.replies, 0);
  const popularCount = discussions.filter((d) => d.likes >= 50).length;

  // Build category counts from loaded data
  const categories: Category[] = STATIC_CATEGORIES.map((cat) => ({
    ...cat,
    count:
      cat.name === 'All'
        ? discussions.length
        : discussions.filter((d) => d.category === cat.name).length,
  }));

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostCategory || !newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          categoryId: newPostCategory,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDialogOpen(false);
        setNewPostTitle('');
        setNewPostCategory('');
        setNewPostContent('');
        // Refresh discussions list
        fetchDiscussions(false);
      } else {
        console.error('Create discussion failed:', json);
      }
    } catch (err) {
      console.error('Failed to create discussion:', err);
    } finally {
      setIsSubmitting(false);
    }
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
                    {STATIC_CATEGORIES
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
          change="Loaded"
          icon={FileText}
          iconColor="text-indigo-500"
        />
        <StatCard
          label="Categories"
          value={categories.filter((c) => c.name !== 'All' && c.count > 0).length}
          change="Active"
          icon={MessageSquare}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Replies"
          value={totalReplies}
          change="Total replies"
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
      {loading ? (
        <CardSkeleton count={5} />
      ) : discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((post) => (
            <Link
              key={post.id || post.slug}
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
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchDiscussions(true)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  'Load More Discussions'
                )}
              </Button>
            </div>
          )}
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

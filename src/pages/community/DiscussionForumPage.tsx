/**
 * Discussion Forum Page - Browse and interact with NCLEX community discussions
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
  Eye,
  MessageCircle,
  CheckCircle2,
  Pin,
  Lock,
  Clock,
  TrendingUp,
  Bookmark,
  Filter,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Megaphone
} from 'lucide-react';
import {
  useForumCategories,
  useForumPosts,
  useTrendingTags,
  useCreatePost,
  useToggleReaction,
  useToggleBookmark
} from '../../services/hooks/useForum';
import { ForumPost, ForumCategory } from '../../services/api/forum.api';

const POST_TYPE_ICONS: Record<string, any> = {
  question: HelpCircle,
  discussion: MessageSquare,
  tip: Lightbulb,
  resource: BookOpen,
  announcement: Megaphone
};

const POST_TYPE_COLORS: Record<string, string> = {
  question: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  discussion: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  tip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  resource: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  announcement: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
};

export default function DiscussionForumPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create post form state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'question' | 'discussion' | 'tip' | 'resource'>('discussion');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostTags, setNewPostTags] = useState('');

  const categoryId = searchParams.get('category') || undefined;
  const sortBy = (searchParams.get('sort') as 'latest' | 'popular' | 'active') || 'latest';

  const { data: categories, isLoading: loadingCategories } = useForumCategories();
  const { data: postsData, isLoading: loadingPosts } = useForumPosts({
    categoryId,
    sortBy,
    limit: 20
  });
  const { data: trendingTags } = useTrendingTags(10);

  const createPostMutation = useCreatePost();
  const toggleReactionMutation = useToggleReaction();
  const toggleBookmarkMutation = useToggleBookmark();

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) return;

    try {
      const post = await createPostMutation.mutateAsync({
        categoryId: newPostCategory,
        title: newPostTitle,
        content: newPostContent,
        type: newPostType,
        tags: newPostTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowCreateModal(false);
      navigate(`/app/forum/${post.slug}`);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleReactionMutation.mutateAsync({ type: 'like', postId });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleBookmarkMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const PostCard = ({ post }: { post: ForumPost }) => {
    const TypeIcon = POST_TYPE_ICONS[post.type] || MessageSquare;
    
    return (
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer border-l-4"
        style={{ borderLeftColor: post.category?.color || '#3b82f6' }}
        onClick={() => navigate(`/app/forum/${post.slug}`)}
      >
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            {/* Vote/Like section */}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <button 
                onClick={(e) => handleLike(post.id, e)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ThumbsUp className={`size-5 ${post.likeCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
              </button>
              <span className="font-semibold text-gray-900 dark:text-white">{post.likeCount}</span>
              <span className="text-xs text-gray-500">likes</span>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="size-3" />
                    Pinned
                  </Badge>
                )}
                {post.isLocked && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="size-3" />
                    Locked
                  </Badge>
                )}
                {post.status === 'resolved' && (
                  <Badge className="bg-green-500 gap-1">
                    <CheckCircle2 className="size-3" />
                    Resolved
                  </Badge>
                )}
                <Badge className={POST_TYPE_COLORS[post.type]}>
                  <TypeIcon className="size-3 mr-1" />
                  {post.type}
                </Badge>
                {post.category && (
                  <Badge 
                    variant="outline" 
                    style={{ borderColor: post.category.color, color: post.category.color }}
                  >
                    {post.category.name}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="size-4" />
                    {post.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    {post.commentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleBookmark(post.id, e)}
                    className="p-1 hover:text-blue-600 transition-colors"
                  >
                    <Bookmark className="size-4" />
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    by {post.author?.firstName} {post.author?.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discussion Forum</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions, share tips, and connect with NCLEX students
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      navigate(`/app/forum?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="size-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <button
                onClick={() => setSearchParams({})}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !categoryId ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All Categories
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    categoryId === cat.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span 
                      className="size-3 rounded-full" 
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    {cat.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">{cat.postCount}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Trending Tags */}
          {trendingTags && trendingTags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map(({ tag, count }) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => navigate(`/app/forum?tags=${tag}`)}
                    >
                      #{tag} ({count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sort options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            {(['latest', 'popular', 'active'] as const).map(sort => (
              <Button
                key={sort}
                size="sm"
                variant={sortBy === sort ? 'default' : 'outline'}
                onClick={() => setSearchParams(prev => {
                  prev.set('sort', sort);
                  return prev;
                })}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            ))}
          </div>

          {/* Posts list */}
          {loadingPosts ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : postsData?.posts?.length ? (
            <div className="space-y-4">
              {postsData.posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No discussions yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to start a conversation!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="size-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Post Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['question', 'discussion', 'tip', 'resource'] as const).map(type => {
                    const Icon = POST_TYPE_ICONS[type];
                    return (
                      <Button
                        key={type}
                        size="sm"
                        variant={newPostType === type ? 'default' : 'outline'}
                        onClick={() => setNewPostType(type)}
                        className="gap-1"
                      >
                        <Icon className="size-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Category *
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Select a category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Title *
                </label>
                <Input
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="What's your question or topic?"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Content *
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-gray-800 dark:border-gray-700 min-h-[200px]"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Provide details, context, or your thoughts..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Tags (comma-separated)
                </label>
                <Input
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="e.g., pharmacology, cardiac, nclex-tips"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory || createPostMutation.isPending}
                  className="flex-1"
                >
                  {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Discussion Detail Page - View individual post and comments
 * Mobile-first responsive design for NCLEX nursing students
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ThumbsUp, MessageCircle, Bookmark, Share2, MoreHorizontal,
  CheckCircle2, Clock, Eye, Send, Flag, Pin, Lock, Edit2, Trash2,
  HelpCircle, Lightbulb, FileText, ClipboardList, Sparkles, Award
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { cn } from '../../components/ui/utils';
import type { DiscussionPost, DiscussionComment, PostType } from '../../types/discussions';

// Post type config
const POST_TYPES: Record<PostType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  question: { label: 'Question', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  discussion: { label: 'Discussion', icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  'study-tip': { label: 'Study Tip', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100' },
  resource: { label: 'Resource', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'case-study': { label: 'Case Study', icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-100' },
  mnemonics: { label: 'Mnemonic', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-100' },
};

// Mock data
const MOCK_POST: DiscussionPost = {
  id: '1', slug: 'best-way-to-memorize-lab-values',
  title: 'Best way to memorize lab values for NCLEX?',
  content: `I'm preparing for my NCLEX exam and struggling with memorizing all the normal lab values. There are so many to remember!

**What I've tried so far:**
- Flashcards (helps but takes too long)
- Writing them out repeatedly
- Quizlet

Does anyone have good **mnemonics** or **memory tricks** for remembering lab values like:
- Potassium (3.5-5.0 mEq/L)
- Sodium (136-145 mEq/L)
- BUN (10-20 mg/dL)
- Creatinine (0.7-1.3 mg/dL)

Any help would be greatly appreciated! 🙏`,
  excerpt: "I'm struggling to remember all the normal lab values.",
  type: 'question', status: 'answered',
  author: { id: '1', firstName: 'Sarah', lastName: 'Johnson', displayName: 'Sarah J.', role: 'student', isVerified: true, badges: [{ id: '1', name: 'Top Contributor', icon: 'Award', color: '#f59e0b', description: '' }], stats: { postsCount: 12, helpfulCount: 45, reputation: 320 } },
  categoryId: '1', category: { id: '1', name: 'Lab Values', slug: 'lab-values', description: '', icon: 'TestTube', color: '#ec4899', postCount: 45, isNclexCategory: true, createdAt: '', updatedAt: '' },
  tags: ['lab-values', 'study-tips', 'nclex-rn', 'mnemonics'], nclexTopics: ['Physiological Adaptation'],
  isPinned: false, isLocked: false, isFeatured: false,
  viewCount: 342, likeCount: 24, commentCount: 8, bookmarkCount: 15, shareCount: 3,
  hasAcceptedAnswer: true, acceptedAnswerId: '1',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: '', lastActivityAt: ''
};

const MOCK_COMMENTS: DiscussionComment[] = [
  {
    id: '1', content: `Great question! Here are some mnemonics that helped me pass my NCLEX:

**For Potassium (3.5-5.0):**
"K+ is 3.5 to 5, keeps your heart alive!"

**For Sodium (136-145):**
"Salt starts at 136, ends at 145 - that's the mix!"

**For BUN/Creatinine:**
"BUN is 10-20, Creatinine's less than 1.3 plenty"

Also, I recommend creating a **one-page cheat sheet** with all critical values and reviewing it every morning for a week. It really sticks!`,
    postId: '1', isAcceptedAnswer: true, isInstructorResponse: false,
    author: { id: '2', firstName: 'Mike', lastName: 'Chen', displayName: 'Mike C.', role: 'student', isVerified: true, badges: [], stats: { postsCount: 45, helpfulCount: 234, reputation: 890 } },
    likeCount: 18, replyCount: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: ''
  },
  {
    id: '2', content: `Adding to Mike's excellent answer - here's another approach:

**Group related values together by system:**

**Cardiac Panel:**
- Troponin: <0.04 ng/mL
- BNP: <100 pg/mL
- CK-MB: 0-3%

**Electrolytes:**
- K+: 3.5-5.0 (think "3.5 to 5 to stay alive")
- Na+: 136-145
- Ca++: 8.5-10.5 ("8.5 to 10.5, calcium's fine")

This **systems-based approach** helped me tremendously on NCLEX!`,
    postId: '1', isAcceptedAnswer: false, isInstructorResponse: true,
    author: { id: '3', firstName: 'Dr. Emily', lastName: 'Roberts', displayName: 'Dr. Emily R.', role: 'instructor', isVerified: true, badges: [{ id: '2', name: 'Verified Instructor', icon: 'Shield', color: '#3b82f6', description: '' }], stats: { postsCount: 89, helpfulCount: 567, reputation: 2400 } },
    likeCount: 32, replyCount: 1,
    createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: ''
  },
  {
    id: '3', content: `Thank you both! The mnemonics are super helpful. I'm going to make flashcards with these and practice daily. 📚`,
    postId: '1', isAcceptedAnswer: false, isInstructorResponse: false,
    author: MOCK_POST.author,
    likeCount: 5, replyCount: 0,
    createdAt: new Date(Date.now() - 21600000).toISOString(), updatedAt: ''
  },
];

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Comment Component
function CommentCard({ comment, isOP }: { comment: DiscussionComment; isOP: boolean }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className={cn(
      'p-3 sm:p-4 rounded-lg border',
      comment.isAcceptedAnswer && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      comment.isInstructorResponse && !comment.isAcceptedAnswer && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      !comment.isAcceptedAnswer && !comment.isInstructorResponse && 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    )}>
      {/* Header badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {comment.isAcceptedAnswer && (
          <Badge className="bg-green-500 text-white text-[10px] h-5 gap-0.5">
            <CheckCircle2 className="size-3" />Accepted Answer
          </Badge>
        )}
        {comment.isInstructorResponse && (
          <Badge className="bg-blue-500 text-white text-[10px] h-5 gap-0.5">
            <Award className="size-3" />Instructor
          </Badge>
        )}
        {isOP && (
          <Badge variant="outline" className="text-[10px] h-5">OP</Badge>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="size-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className={cn(
            'text-white text-xs',
            comment.author.role === 'instructor' ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
          )}>
            {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {comment.author.displayName}
            </span>
            {comment.author.isVerified && (
              <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Flag className="size-4 mr-2" />Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
        {comment.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('h-7 px-2 text-xs gap-1', liked && 'text-blue-600')}
          onClick={() => setLiked(!liked)}
        >
          <ThumbsUp className={cn('size-3.5', liked && 'fill-current')} />
          {comment.likeCount + (liked ? 1 : 0)}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
          <MessageCircle className="size-3.5" />Reply
        </Button>
      </div>
    </div>
  );
}

export function DiscussionDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const post = MOCK_POST;
  const comments = MOCK_COMMENTS;
  const postType = POST_TYPES[post.type];
  const TypeIcon = postType?.icon || MessageCircle;

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    console.log('Submitting reply:', replyContent);
    setReplyContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Discussion
            </h1>
            <p className="text-xs text-gray-500 truncate">{post.category.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit2 className="size-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem><Pin className="size-4 mr-2" />Pin</DropdownMenuItem>
              <DropdownMenuItem><Lock className="size-4 mr-2" />Lock</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Post */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.hasAcceptedAnswer && (
                <Badge className="bg-green-500 text-white text-xs gap-1">
                  <CheckCircle2 className="size-3" />Answered
                </Badge>
              )}
              <Badge className={cn('text-xs gap-1', postType?.bg, postType?.color)}>
                <TypeIcon className="size-3" />{postType?.label}
              </Badge>
              <Badge variant="outline" className="text-xs">{post.category.name}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <Avatar className="size-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {post.author.displayName}
                  </span>
                  {post.author.isVerified && <CheckCircle2 className="size-4 text-blue-500" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{getTimeAgo(post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" />{post.viewCount}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn('gap-1', liked && 'text-blue-600')}
                  onClick={() => setLiked(!liked)}
                >
                  <ThumbsUp className={cn('size-4', liked && 'fill-current')} />
                  <span>{post.likeCount + (liked ? 1 : 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageCircle className="size-4" />{post.commentCount}
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={bookmarked ? 'text-amber-600' : ''}
                  onClick={() => setBookmarked(!bookmarked)}
                >
                  <Bookmark className={cn('size-4', bookmarked && 'fill-current')} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="size-5" />
            {comments.length} Responses
          </h2>
          <div className="space-y-3">
            {comments.map(comment => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                isOP={comment.author.id === post.author.id}
              />
            ))}
          </div>
        </div>

        {/* Reply Box */}
        <Card className="sticky bottom-0 sm:relative">
          <CardContent className="p-3 sm:p-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your response..."
              className="min-h-[80px] mb-3 resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitReply}
                disabled={!replyContent.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Send className="size-4 mr-2" />
                Post Response
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DiscussionDetailPage;

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Flag,
  MoreVertical,
  ThumbsUp,
  Reply,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface PostAuthor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role?: string;
}

interface Reaction {
  id: string;
  userId: string;
  reactionType: string;
}

interface Comment {
  id: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  likeCount: number;
  isBestAnswer: boolean;
  reactions: Reaction[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: PostAuthor;
  category: { id: string; name: string; slug: string; color?: string; icon?: string };
  createdAt: string;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  isResolved: boolean;
  isPinned: boolean;
  tags: string[];
  comments: Comment[];
  reactions: Reaction[];
  bookmarks: { userId: string }[];
}

export default function DiscussionDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const userId = session?.user?.id;

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/discussions?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        setPost(p);
        setLikeCount(p.likeCount ?? 0);
        if (userId) {
          setLiked(p.reactions?.some((r: Reaction) => r.userId === userId && r.reactionType === 'like') ?? false);
          setBookmarked(p.bookmarks?.some((b: { userId: string }) => b.userId === userId) ?? false);
        }
      } else {
        setError(json.error || "Post not found");
      }
    } catch {
      setError("Failed to load discussion");
    } finally {
      setLoading(false);
    }
  }, [slug, userId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleToggleLike = async () => {
    if (!post) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      await fetch(`/api/discussions/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: "like" }),
      });
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleToggleBookmark = async () => {
    if (!post) return;
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    try {
      await fetch(`/api/discussions/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: "bookmark" }),
      });
    } catch {
      setBookmarked(wasBookmarked);
    }
  };

  const handleToggleCommentLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!post) return;
    try {
      await fetch(`/api/discussions/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: "like", commentId }),
      });
      // Refresh post to get updated counts
      fetchPost();
    } catch {
      // ignore
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !post || submittingReply) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyContent("");
        fetchPost();
      }
    } catch {
      // handle error
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Back to Discussions</span>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold mb-2">Discussion Not Found</h2>
            <p className="text-sm text-muted-foreground mb-4">{error || "This discussion may have been removed."}</p>
            <Button asChild>
              <Link href="/community/discussions">Browse Discussions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const comments = post.comments ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Back to Discussions</span>
      </motion.div>

      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card glass>
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-11 w-11 shrink-0">
                {post.author.avatarUrl && (
                  <AvatarImage src={post.author.avatarUrl} alt={post.author.fullName} />
                )}
                <AvatarFallback className="text-sm">{getInitials(post.author.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{post.author.fullName}</span>
                  {post.author.role && (
                    <Badge variant="outline" className="text-[10px]">{post.author.role}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(post.createdAt)}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Title & Tags */}
            <div className="mb-4">
              <div className="flex items-start gap-2 mb-2">
                <h1 className="text-xl font-bold">{post.title}</h1>
                {post.isResolved && (
                  <Badge variant="success" className="text-[10px] shrink-0 mt-1">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                    Resolved
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{post.category?.name}</Badge>
                {(post.tags ?? []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              {post.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="font-semibold mt-3 mb-1">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <div key={i} className="flex gap-2 ml-2 text-sm text-muted-foreground">
                      <span className="text-primary shrink-0">-</span>
                      <span>{line.slice(2)}</span>
                    </div>
                  );
                }
                if (line.trim() === "") return <br key={i} />;
                return (
                  <p key={i} className="text-sm text-foreground/90 leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleToggleLike}
                  className={cn(liked && "bg-pink-500 hover:bg-pink-600")}
                >
                  <Heart className={cn("h-3.5 w-3.5 mr-1.5", liked && "fill-current")} />
                  {likeCount}
                </Button>
                <Button
                  variant={bookmarked ? "secondary" : "ghost"}
                  size="sm"
                  onClick={handleToggleBookmark}
                >
                  <Bookmark className={cn("h-3.5 w-3.5 mr-1.5", bookmarked && "fill-current")} />
                  {bookmarked ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </Button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {comments.length} replies
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
          </h2>
        </div>

        {comments.map((comment, i) => {
          const commentLiked = userId
            ? comment.reactions?.some((r) => r.userId === userId && r.reactionType === 'like')
            : false;

          return (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Card
                glass
                className={cn(
                  comment.isBestAnswer && "border-emerald-500/30 bg-emerald-500/5"
                )}
              >
                <CardContent className="p-5">
                  {comment.isBestAnswer && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Best Answer
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      {comment.author.avatarUrl && (
                        <AvatarImage src={comment.author.avatarUrl} alt={comment.author.fullName} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(comment.author.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Comment Content */}
                  <div className="pl-11 space-y-2">
                    {comment.content.split("\n").map((line, li) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={li} className="text-sm font-semibold mt-2">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (line.trim() === "") return <br key={li} />;
                      return (
                        <p key={li} className="text-sm text-foreground/90 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}

                    {/* Comment Actions */}
                    <div className="flex items-center gap-2 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleToggleCommentLike(comment.id, !!commentLiked)}
                      >
                        <ThumbsUp className={cn("h-3 w-3 mr-1", commentLiked && "fill-current text-primary")} />
                        {comment.likeCount ?? 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Reply Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card glass>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="text-[10px]">
                  {session?.user?.name ? getInitials(session.user.name) : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <textarea
                  placeholder="Write your reply... Share your knowledge or ask a follow-up question."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full min-h-[120px] rounded-lg border border-input bg-background/60 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Supports basic markdown formatting
                  </p>
                  <Button
                    disabled={!replyContent.trim() || submittingReply}
                    size="sm"
                    onClick={handleSubmitReply}
                  >
                    {submittingReply ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-3.5 w-3.5" />
                    )}
                    Post Reply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Back to top */}
      <div className="flex justify-center pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
          Back to top
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

const post = {
  title: "Best way to memorize drug classifications?",
  content: `I've been studying pharmacology for the past few weeks and I'm really struggling with remembering all the different drug classifications, their mechanisms of action, and common side effects.

I've tried making flashcards and reading the textbook, but the information just doesn't seem to stick. There are so many drugs that sound similar and have overlapping side effects.

**Specifically, I'm having trouble with:**
- Distinguishing between different antihypertensive classes (ACE inhibitors vs ARBs vs beta-blockers)
- Remembering which antibiotics cover gram-positive vs gram-negative organisms
- Keeping track of which drugs are safe during pregnancy

Has anyone found effective mnemonics or study techniques that helped them master pharmacology? I'm about 6 weeks out from my NCLEX and really need to improve in this area.

Any help would be greatly appreciated! Thanks in advance.`,
  author: { name: "Sarah Chen", avatar: null, joinDate: "Jan 2026", posts: 12 },
  category: "Pharmacology",
  date: "Feb 20, 2026 at 2:30 PM",
  replies: 24,
  likes: 48,
  views: 312,
  isResolved: true,
  tags: ["pharmacology", "mnemonics", "study-tips"],
  isLiked: false,
  isBookmarked: false,
};

const comments = [
  {
    id: 1,
    author: { name: "Emily Rodriguez", avatar: null },
    content: `Great question! Here are some mnemonics that saved me:

**ACE Inhibitors** (end in "-pril"): Remember "CAPTOPRIL" - Cough, Angioedema, Pregnancy contraindicated, Taste changes, hyPotension, Renal issues, Increased potassium, Low BP on first dose

**Beta Blockers** (end in "-olol"): "BETA" - Bradycardia, Exercise intolerance, Tiredness, Asthma exacerbation

The key is to focus on suffixes first, then associate side effects with the mechanism. Once you know HOW the drug works, the side effects make logical sense.`,
    date: "2h ago",
    likes: 32,
    isLiked: false,
    isBestAnswer: true,
  },
  {
    id: 2,
    author: { name: "Marcus Johnson", avatar: null },
    content: `I second Emily's approach! For antibiotics, I found this helpful:

**Gram-positive coverage**: Think "PVC Pipe" - Penicillin, Vancomycin, Cephalosporins (1st gen)
**Gram-negative coverage**: "Aminoglycosides and the 3rd gen Cephalosporins"

Also, creating drug classification tables really helped me. I'd organize them by class, prototype drug, mechanism, and the most tested side effects. Sometimes visual organization works better than mnemonics.`,
    date: "1h 45m ago",
    likes: 18,
    isLiked: false,
    isBestAnswer: false,
  },
  {
    id: 3,
    author: { name: "David Kim", avatar: null },
    content: `For pregnancy safety, remember "Category X means X that drug out!" - drugs like Warfarin, Methotrexate, and most statins are Category X.

I also recommend the Haven Institute AI Tutor for pharmacology review - it adapts to your weak areas and quizzes you on the specific drugs you keep getting wrong. That's what finally made it click for me.`,
    date: "1h 30m ago",
    likes: 24,
    isLiked: true,
    isBestAnswer: false,
  },
  {
    id: 4,
    author: { name: "Jessica Park", avatar: null },
    content: `Don't forget about Quizlet! I made a pharmacology deck with over 200 cards and shared it with our study group. You can also use the spaced repetition feature to focus on the drugs you struggle with most.

Also, try teaching the material to someone else or explaining it out loud. If you can explain why an ACE inhibitor causes a cough (buildup of bradykinin), you'll never forget it!`,
    date: "55m ago",
    likes: 11,
    isLiked: false,
    isBestAnswer: false,
  },
];

export default function DiscussionDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [replyContent, setReplyContent] = useState("");
  const [liked, setLiked] = useState(post.isLiked);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [likeCount, setLikeCount] = useState(post.likes);

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
                <AvatarFallback className="text-sm">{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{post.author.name}</span>
                  <Badge variant="outline" className="text-[10px]">{post.author.posts} posts</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.date}
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
                <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                {post.tags.map((tag) => (
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
                  onClick={() => {
                    setLiked(!liked);
                    setLikeCount((c) => (liked ? c - 1 : c + 1));
                  }}
                  className={cn(liked && "bg-pink-500 hover:bg-pink-600")}
                >
                  <Heart className={cn("h-3.5 w-3.5 mr-1.5", liked && "fill-current")} />
                  {likeCount}
                </Button>
                <Button
                  variant={bookmarked ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
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
                  {post.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.replies} replies
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
            {comments.length} Replies
          </h2>
        </div>

        {comments.map((comment, i) => (
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
                    <AvatarFallback className="text-[10px]">
                      {getInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
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
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <ThumbsUp className={cn("h-3 w-3 mr-1", comment.isLiked && "fill-current text-primary")} />
                      {comment.likes}
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
        ))}
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
                  <Button disabled={!replyContent.trim()} size="sm">
                    <Send className="mr-2 h-3.5 w-3.5" />
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

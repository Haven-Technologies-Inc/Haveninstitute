"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Users,
  Send,
  Settings,
  Crown,
  Shield,
  MoreVertical,
  Reply,
  Pencil,
  Trash2,
  X,
  MessageSquare,
  PanelRightOpen,
  PanelRightClose,
  Check,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface ReplyTo {
  id: string;
  content: string;
  isDeleted?: boolean;
  user: { id?: string; fullName: string };
}

interface Message {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  messageType: string;
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  replyTo: ReplyTo | null;
  _optimistic?: boolean;
  _failed?: boolean;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  maxMembers: number;
  memberCount: number;
  ownerId: string;
  createdAt: string;
}

interface Member {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActiveAt: string | null;
  user: User;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 2000;
const POLL_INTERVAL_MS = 3000;
const MESSAGES_PER_PAGE = 50;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GroupDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  // State
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const currentUserId = session?.user?.id;

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}`);
      const data = await res.json();
      if (data.success) {
        setGroup(data.data);
      } else {
        setError(data.error || "Failed to load group");
      }
    } catch {
      setError("Failed to load group");
    }
  }, [groupId]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}/members`);
      const data = await res.json();
      if (data.success) {
        const memberList = Array.isArray(data.data) ? data.data : data.data?.members ?? [];
        setMembers(memberList);
      }
    } catch {
      // Members are non-critical; silently fail
    }
  }, [groupId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/study-groups/${groupId}/messages?limit=${MESSAGES_PER_PAGE}`
      );
      const data = await res.json();
      if (data.success) {
        const payload = data.data;
        const msgs: Message[] = payload.messages ?? payload;
        setMessages(msgs);
        setHasMore(payload.hasMore ?? false);
        setNextCursor(payload.nextCursor ?? null);
        if (msgs.length > 0) {
          lastMessageTimeRef.current = msgs[msgs.length - 1].createdAt;
        }
      } else {
        setError(data.error || "Failed to load messages");
      }
    } catch {
      setError("Failed to load messages");
    }
  }, [groupId]);

  const fetchOlderMessages = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/study-groups/${groupId}/messages?cursor=${nextCursor}&limit=${MESSAGES_PER_PAGE}`
      );
      const data = await res.json();
      if (data.success) {
        const payload = data.data;
        const olderMsgs: Message[] = payload.messages ?? payload;
        setMessages((prev) => [...olderMsgs, ...prev]);
        setHasMore(payload.hasMore ?? false);
        setNextCursor(payload.nextCursor ?? null);
      }
    } catch {
      toast.error("Failed to load older messages");
    } finally {
      setIsLoadingMore(false);
    }
  }, [groupId, nextCursor, isLoadingMore]);

  // Poll for new messages
  const pollNewMessages = useCallback(async () => {
    if (!lastMessageTimeRef.current) return;
    try {
      const res = await fetch(
        `/api/study-groups/${groupId}/messages?after=${encodeURIComponent(
          lastMessageTimeRef.current
        )}`
      );
      const data = await res.json();
      if (data.success) {
        const newMsgs: Message[] = Array.isArray(data.data) ? data.data : [];
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = newMsgs.filter((m) => !existingIds.has(m.id));
            if (unique.length === 0) return prev;
            return [...prev.filter((m) => !m._optimistic), ...unique];
          });
          lastMessageTimeRef.current =
            newMsgs[newMsgs.length - 1].createdAt;
        }
      }
    } catch {
      // Polling failure is silent
    }
  }, [groupId]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Initial data load
  useEffect(() => {
    if (!groupId) return;
    setIsLoading(true);
    Promise.all([fetchGroup(), fetchMembers(), fetchMessages()]).finally(() => {
      setIsLoading(false);
    });
  }, [groupId, fetchGroup, fetchMembers, fetchMessages]);

  // Polling interval
  useEffect(() => {
    pollingRef.current = setInterval(pollNewMessages, POLL_INTERVAL_MS);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pollNewMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track scroll position to decide auto-scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 100;
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [messageInput]);

  // ---------------------------------------------------------------------------
  // Message actions
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(async () => {
    const content = messageInput.trim();
    if (!content || isSending || !currentUserId) return;

    const optimisticId = `opt-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      groupId,
      userId: currentUserId,
      content,
      messageType: "text",
      replyToId: replyTo?.id ?? null,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: currentUserId,
        fullName: session?.user?.name ?? "You",
        avatarUrl: session?.user?.image ?? null,
      },
      replyTo: replyTo
        ? {
            id: replyTo.id,
            content: replyTo.content,
            user: { id: replyTo.user.id, fullName: replyTo.user.fullName },
          }
        : null,
      _optimistic: true,
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageInput("");
    setReplyTo(null);
    shouldAutoScrollRef.current = true;
    setIsSending(true);

    try {
      const res = await fetch(`/api/study-groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, replyToId: replyTo?.id }),
      });
      const data = await res.json();
      if (data.success) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? data.data : m))
        );
        lastMessageTimeRef.current = data.data.createdAt;
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, _failed: true, _optimistic: false } : m
          )
        );
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, _failed: true, _optimistic: false } : m
        )
      );
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [messageInput, isSending, currentUserId, groupId, replyTo, session]);

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const prev = messages;
      setMessages((msgs) => msgs.filter((m) => m.id !== messageId));

      try {
        const res = await fetch(`/api/study-groups/${groupId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, action: "delete" }),
        });
        const data = await res.json();
        if (!data.success) {
          setMessages(prev);
          toast.error(data.error || "Failed to delete message");
        }
      } catch {
        setMessages(prev);
        toast.error("Failed to delete message");
      }
    },
    [groupId, messages]
  );

  const saveEdit = useCallback(async () => {
    if (!editingMessage || !editContent.trim()) return;
    const prevMessages = messages;
    setMessages((msgs) =>
      msgs.map((m) =>
        m.id === editingMessage.id
          ? { ...m, content: editContent.trim(), isEdited: true }
          : m
      )
    );
    setEditingMessage(null);
    setEditContent("");

    try {
      const res = await fetch(`/api/study-groups/${groupId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: editingMessage.id,
          action: "edit",
          content: editContent.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessages(prevMessages);
        toast.error(data.error || "Failed to edit message");
      }
    } catch {
      setMessages(prevMessages);
      toast.error("Failed to edit message");
    }
  }, [editingMessage, editContent, groupId, messages]);

  const retryFailedMessage = useCallback(
    (msg: Message) => {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      setMessageInput(msg.content);
      if (msg.replyTo) {
        setReplyTo({
          ...msg,
          user: msg.replyTo.user as User,
        } as unknown as Message);
      }
      textareaRef.current?.focus();
    },
    []
  );

  const removeFailedMessage = useCallback((msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }, []);

  // ---------------------------------------------------------------------------
  // Key handlers
  // ---------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveEdit();
      }
      if (e.key === "Escape") {
        setEditingMessage(null);
        setEditContent("");
      }
    },
    [saveEdit]
  );

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const isRecentlyActive = (lastActive: string | null) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  const onlineMemberCount = members.filter((m) =>
    isRecentlyActive(m.lastActiveAt)
  ).length;

  const getRoleBadge = (role: string) => {
    if (role === "owner")
      return (
        <Badge
          variant="default"
          className="text-[9px] px-1.5 h-4 bg-amber-500/90 hover:bg-amber-500"
        >
          <Crown className="h-2.5 w-2.5 mr-0.5" />
          Owner
        </Badge>
      );
    if (role === "admin")
      return (
        <Badge variant="default" className="text-[9px] px-1.5 h-4">
          <Shield className="h-2.5 w-2.5 mr-0.5" />
          Admin
        </Badge>
      );
    return null;
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header skeleton */}
        <div className="shrink-0 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        {/* Messages skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn("flex gap-3", i % 3 === 0 && "flex-row-reverse")}>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className={cn("space-y-2 max-w-[60%]", i % 3 === 0 && "items-end")}>
                <Skeleton className="h-3 w-24" />
                <Skeleton
                  className="h-12 rounded-2xl"
                  style={{ width: `${150 + Math.random() * 200}px` }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Input skeleton */}
        <div className="shrink-0 p-4 border-t border-border/50">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <div className="text-center space-y-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold">Unable to load group</h2>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* ----------------------------------------------------------------- */}
        {/* GROUP HEADER */}
        {/* ----------------------------------------------------------------- */}
        <Card glass className="shrink-0 rounded-b-none border-b-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-base font-bold truncate">
                  {group?.name ?? "Study Group"}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {members.length} members
                  </span>
                  {onlineMemberCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {onlineMemberCount} online
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      {sidebarOpen ? (
                        <PanelRightClose className="h-4 w-4" />
                      ) : (
                        <PanelRightOpen className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sidebarOpen ? "Hide members" : "Show members"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        router.push(
                          `/community/groups/${groupId}/settings`
                        )
                      }
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Group settings</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------------------------------------------- */}
        {/* MAIN AREA: Chat + Sidebar */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-1 min-h-0 relative">
          {/* ---- CHAT AREA ---- */}
          <Card glass className="flex-1 flex flex-col rounded-none border-t-0 min-w-0">
            {/* Message list */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1"
              onScroll={handleScroll}
            >
              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center pb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchOlderMessages}
                    disabled={isLoadingMore}
                    className="text-xs text-muted-foreground"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load older messages"
                    )}
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">
                    No messages yet
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Be the first to say something! Start a conversation with
                    your study group.
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => {
                const isOwn = msg.userId === currentUserId;
                const showAvatar =
                  i === 0 || messages[i - 1].userId !== msg.userId;
                const showName =
                  !isOwn &&
                  (i === 0 || messages[i - 1].userId !== msg.userId);
                const isConsecutive =
                  i > 0 && messages[i - 1].userId === msg.userId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "group flex gap-2 sm:gap-3",
                      isOwn && "flex-row-reverse",
                      isConsecutive ? "mt-0.5" : "mt-3",
                      i === 0 && "mt-0"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 shrink-0">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.user.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(msg.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={cn(
                        "max-w-[75%] sm:max-w-[65%]",
                        isOwn && "text-right"
                      )}
                    >
                      {/* Name + time */}
                      {showName && (
                        <div className="flex items-center gap-2 mb-0.5 px-1">
                          <span className="text-xs font-medium">
                            {msg.user.fullName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      {isOwn && showAvatar && (
                        <div className="flex items-center gap-2 mb-0.5 px-1 justify-end">
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      {/* Reply quote */}
                      {msg.replyTo && (
                        <div
                          className={cn(
                            "flex items-start gap-1.5 mb-1 px-1",
                            isOwn && "justify-end"
                          )}
                        >
                          <div className="text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5 max-w-full border-l-2 border-primary/40">
                            <span className="font-medium">
                              {msg.replyTo.user.fullName}
                            </span>
                            <p className="truncate mt-0.5">
                              {msg.replyTo.isDeleted
                                ? "Message deleted"
                                : msg.replyTo.content}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Editing mode */}
                      {editingMessage?.id === msg.id ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full min-h-[60px] max-h-[120px] rounded-xl border border-primary/50 bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                          />
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingMessage(null);
                                setEditContent("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={saveEdit}
                              disabled={
                                !editContent.trim() ||
                                editContent.trim() === editingMessage.content
                              }
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative inline-flex items-start gap-1">
                          <div
                            className={cn(
                              "inline-block px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted/60 rounded-bl-md",
                              msg._optimistic && "opacity-70",
                              msg._failed &&
                                "opacity-70 bg-destructive/20 border border-destructive/30"
                            )}
                          >
                            {msg.content}
                            {msg.isEdited && (
                              <span className="ml-1.5 text-[10px] opacity-60">
                                (edited)
                              </span>
                            )}
                          </div>

                          {/* Failed message controls */}
                          {msg._failed && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-destructive">
                                Failed
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px] text-destructive"
                                onClick={() => retryFailedMessage(msg)}
                              >
                                Retry
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px] text-muted-foreground"
                                onClick={() => removeFailedMessage(msg.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}

                          {/* Message actions (hover) */}
                          {!msg._optimistic && !msg._failed && (
                            <div
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity absolute top-0",
                                isOwn ? "-left-8" : "-right-8"
                              )}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full bg-background shadow-sm border border-border/50"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align={isOwn ? "start" : "end"}>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setReplyTo(msg);
                                      textareaRef.current?.focus();
                                    }}
                                  >
                                    <Reply className="h-3.5 w-3.5 mr-2" />
                                    Reply
                                  </DropdownMenuItem>
                                  {isOwn && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingMessage(msg);
                                          setEditContent(msg.content);
                                        }}
                                      >
                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => deleteMessage(msg.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp for consecutive messages without header */}
                      {!showAvatar && !isOwn && (
                        <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      )}
                      {!showAvatar && isOwn && (
                        <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <Separator />

            {/* ---- MESSAGE INPUT ---- */}
            <div className="shrink-0 p-3 sm:p-4">
              {/* Reply preview */}
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-muted/40 rounded-lg border-l-2 border-primary/40">
                  <Reply className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-primary">
                      Replying to {replyTo.user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {replyTo.content}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setReplyTo(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="w-full min-h-[40px] max-h-[120px] rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    disabled={isSending}
                  />
                  {/* Character limit indicator */}
                  {messageInput.length > MAX_MESSAGE_LENGTH * 0.8 && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 right-2 text-[10px]",
                        messageInput.length > MAX_MESSAGE_LENGTH
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {messageInput.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  )}
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-xl shrink-0"
                      disabled={
                        !messageInput.trim() ||
                        isSending ||
                        messageInput.length > MAX_MESSAGE_LENGTH
                      }
                      onClick={sendMessage}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>

              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                Press Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </Card>

          {/* ---- MEMBER SIDEBAR ---- */}

          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <Card
            glass
            className={cn(
              "shrink-0 w-72 border-t-0 border-l rounded-none flex-col overflow-hidden",
              // Desktop: normal flow
              "hidden lg:flex",
              // Mobile: fixed overlay
              sidebarOpen &&
                "!flex fixed right-0 top-0 bottom-0 z-40 rounded-l-xl border-l lg:relative lg:right-auto lg:top-auto lg:bottom-auto lg:z-auto lg:rounded-none"
            )}
          >
            <div className="p-3 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Members ({members.length})
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {/* Online members */}
                {members.filter((m) => isRecentlyActive(m.lastActiveAt))
                  .length > 0 && (
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Online -{" "}
                      {
                        members.filter((m) =>
                          isRecentlyActive(m.lastActiveAt)
                        ).length
                      }
                    </p>
                  </div>
                )}
                {members
                  .filter((m) => isRecentlyActive(m.lastActiveAt))
                  .map((member) => (
                    <MemberItem
                      key={member.id}
                      member={member}
                      isOnline={true}
                      isCurrentUser={member.userId === currentUserId}
                      getRoleBadge={getRoleBadge}
                    />
                  ))}

                {/* Offline members */}
                {members.filter((m) => !isRecentlyActive(m.lastActiveAt))
                  .length > 0 && (
                  <div className="px-2 py-1.5 mt-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Offline -{" "}
                      {
                        members.filter(
                          (m) => !isRecentlyActive(m.lastActiveAt)
                        ).length
                      }
                    </p>
                  </div>
                )}
                {members
                  .filter((m) => !isRecentlyActive(m.lastActiveAt))
                  .map((member) => (
                    <MemberItem
                      key={member.id}
                      member={member}
                      isOnline={false}
                      isCurrentUser={member.userId === currentUserId}
                      getRoleBadge={getRoleBadge}
                    />
                  ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: MemberItem
// ---------------------------------------------------------------------------

function MemberItem({
  member,
  isOnline,
  isCurrentUser,
  getRoleBadge,
}: {
  member: Member;
  isOnline: boolean;
  isCurrentUser: boolean;
  getRoleBadge: (role: string) => React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7">
          <AvatarImage src={member.user.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[10px] bg-muted">
            {getInitials(member.user.fullName)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
            isOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium truncate",
              !isOnline && "text-muted-foreground"
            )}
          >
            {member.user.fullName}
            {isCurrentUser && (
              <span className="text-muted-foreground font-normal">
                {" "}
                (you)
              </span>
            )}
          </span>
          {getRoleBadge(member.role)}
        </div>
      </div>
    </div>
  );
}

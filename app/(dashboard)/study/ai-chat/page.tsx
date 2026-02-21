'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { useUser } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send,
  Sparkles,
  Brain,
  Pill,
  Heart,
  Shield,
  Stethoscope,
  Loader2,
  RotateCcw,
  BookOpen,
  GraduationCap,
  User,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedTopic {
  label: string;
  prompt: string;
  icon: React.ElementType;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUGGESTED_TOPICS: SuggestedTopic[] = [
  {
    label: 'Pharmacology',
    prompt: 'Can you explain the key drug classifications I need to know for the NCLEX?',
    icon: Pill,
    color: 'from-pink-500 to-rose-600',
  },
  {
    label: 'Priority & Delegation',
    prompt: 'Help me understand how to approach delegation and prioritization questions on the NCLEX.',
    icon: Shield,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    label: 'Lab Values',
    prompt: 'What are the critical lab values I need to memorize for the NCLEX exam?',
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Cardiac Nursing',
    prompt: 'Explain the different types of heart rhythms and how to identify them.',
    icon: Heart,
    color: 'from-red-500 to-pink-600',
  },
  {
    label: 'Study Strategies',
    prompt: 'What are the most effective study strategies for passing the NCLEX on the first attempt?',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
  },
  {
    label: 'Test-Taking Tips',
    prompt: 'What are your best tips for answering NCLEX-style select all that apply (SATA) questions?',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
  },
];

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hello! I'm your Haven Institute NCLEX Tutor. I can help you with nursing concepts, explain complex topics, quiz you on key material, and provide study strategies. What would you like to learn about today?",
  timestamp: new Date(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let messageCounter = 0;
function generateId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasConversation = messages.length > 1;

  // Auto-scroll to bottom when messages change or while loading
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            conversationHistory: messages
              .filter((m) => m.id !== 'greeting')
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errMsg =
            errData?.error ||
            'I had trouble getting a response. Please try again in a moment.';
          throw new Error(errMsg);
        }

        const json = await response.json();
        const data = json.data ?? json;

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            data.content ??
            data.response ??
            data.message ??
            'I apologize, but I was unable to process your request. Please try again.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        const fallbackMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            err?.message && !err.message.includes('fetch')
              ? err.message
              : "I'm having a little trouble connecting right now. Please try again in a moment. If this keeps happening, your daily message limit may have been reached.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, messages],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleTopicClick(prompt: string) {
    sendMessage(prompt);
  }

  function handleResetChat() {
    setMessages([INITIAL_GREETING]);
    setInput('');
    inputRef.current?.focus();
  }

  const userName = user?.name ?? 'Student';
  const userInitials = getInitials(userName);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.12))]">
      {/* Header */}
      <div className="shrink-0 pb-4">
        <PageHeader
          title="AI Tutor"
          description="Get personalized help with NCLEX topics and nursing concepts"
        >
          {hasConversation && (
            <Button variant="outline" size="sm" onClick={handleResetChat}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </PageHeader>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-sm">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 max-w-3xl',
                message.role === 'user'
                  ? 'ml-auto flex-row-reverse'
                  : '',
              )}
            >
              {/* Avatar */}
              {message.role === 'assistant' ? (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              ) : (
                <Avatar className="h-9 w-9 shrink-0 mt-0.5 shadow-sm">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                    {userInitials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Bubble */}
              <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
                {/* Sender label */}
                <span
                  className={cn(
                    'text-[11px] font-medium mb-1 px-1',
                    message.role === 'user'
                      ? 'text-right text-muted-foreground'
                      : 'text-indigo-600 dark:text-indigo-400',
                  )}
                >
                  {message.role === 'assistant' ? 'Haven AI Tutor' : userName}
                </span>

                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-muted/80 border border-border/50 rounded-tl-md',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-2',
                      message.role === 'user'
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium mb-1 px-1 text-indigo-600 dark:text-indigo-400">
                  Haven AI Tutor
                </span>
                <div className="rounded-2xl rounded-tl-md bg-muted/80 border border-border/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                      <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs ml-1">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Topics (when no conversation yet) */}
          {!hasConversation && !isLoading && (
            <div className="pt-4">
              <Separator className="mb-6" />
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Suggested Topics
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose a topic to get started or type your own question below
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {SUGGESTED_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => handleTopicClick(topic.prompt)}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110',
                        topic.color,
                      )}
                    >
                      <topic.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {topic.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {topic.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t bg-background/80 backdrop-blur-sm p-3 sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <Input
              ref={inputRef}
              placeholder="Ask about any NCLEX topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 h-11"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-11 w-11"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI responses are for study purposes only and should not replace professional medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}

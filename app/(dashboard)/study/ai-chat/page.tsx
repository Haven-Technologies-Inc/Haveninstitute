'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import { useUser } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Bot,
  Sparkles,
  Brain,
  Pill,
  Heart,
  Shield,
  Stethoscope,
  Loader2,
  RotateCcw,
  BookOpen,
  MessageSquare,
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
    "Hello! I'm your AI NCLEX Tutor. I can help you with nursing concepts, explain complex topics, quiz you on key material, and provide study strategies. What would you like to learn about today?",
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

  // Auto-scroll to bottom when messages change
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
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const json = await response.json();
        const data = json.data ?? json;

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            data.content ??
            data.message ??
            data.response ??
            'I apologize, but I was unable to process your request. Please try again.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        // Fallback mock response for when API is not yet available
        const fallbackMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            "That's a great question! While I'm currently in demo mode, here's a brief overview: This topic is commonly tested on the NCLEX and involves understanding key nursing concepts, applying clinical judgment, and using the nursing process (ADPIE) to arrive at the best answer. I recommend reviewing your study materials on this subject and practicing with NCLEX-style questions to strengthen your understanding. Would you like me to explain any specific aspect in more detail?",
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
                message.role === 'user' ? 'ml-auto flex-row-reverse' : '',
              )}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                {message.role === 'assistant' ? (
                  <>
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="bg-muted text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              {/* Bubble */}
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md',
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
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
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
        <div className="shrink-0 border-t bg-background/80 backdrop-blur-sm p-4">
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
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0"
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

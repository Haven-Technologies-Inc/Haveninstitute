"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Brain,
  BookOpen,
  Pill,
  Calculator,
  HeartPulse,
  Baby,
  Shield,
  Clock,
  Plus,
  ChevronRight,
  Bot,
  User,
  Loader2,
  Trash2,
  History,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
  messageCount: number;
}

const suggestedPrompts = [
  {
    icon: Pill,
    text: "Explain pharmacokinetics",
    description: "Drug absorption, distribution, metabolism, excretion",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Calculator,
    text: "Help with dosage calculations",
    description: "IV drip rates, weight-based dosing, conversions",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: HeartPulse,
    text: "Cardiac rhythm interpretation",
    description: "ECG reading, arrhythmias, interventions",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Baby,
    text: "Maternal-newborn nursing concepts",
    description: "Labor stages, fetal monitoring, postpartum care",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Shield,
    text: "Infection control precautions",
    description: "Standard, contact, droplet, airborne isolation",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Brain,
    text: "Prioritization strategies for NCLEX",
    description: "ABCs, Maslow's hierarchy, nursing process",
    color: "from-amber-500 to-orange-600",
  },
];

const chatHistory: ChatSession[] = [
  {
    id: "ch1",
    title: "Pharmacokinetics Discussion",
    lastMessage: "The four phases of pharmacokinetics are...",
    date: "Today",
    messageCount: 12,
  },
  {
    id: "ch2",
    title: "Dosage Calculations Help",
    lastMessage: "To calculate the IV drip rate, use the formula...",
    date: "Yesterday",
    messageCount: 8,
  },
  {
    id: "ch3",
    title: "Cardiac Rhythms Review",
    lastMessage: "Atrial fibrillation is characterized by...",
    date: "2 days ago",
    messageCount: 15,
  },
  {
    id: "ch4",
    title: "Lab Values Interpretation",
    lastMessage: "Normal BUN ranges from 7-20 mg/dL...",
    date: "3 days ago",
    messageCount: 6,
  },
  {
    id: "ch5",
    title: "Delegation & Prioritization",
    lastMessage: "When delegating to an LPN, remember...",
    date: "1 week ago",
    messageCount: 10,
  },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your NCLEX AI Tutor. I'm here to help you understand nursing concepts, practice clinical reasoning, and prepare for your exam. What would you like to study today?",
    timestamp: new Date(),
  },
];

export default function AITutorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("pharmacokinetics") || lower.includes("pharmacology")) {
      return "Pharmacokinetics describes how the body processes a drug through four key phases:\n\n**1. Absorption** - The drug moves from the site of administration into the bloodstream. Factors affecting absorption include route of administration, blood flow, and drug formulation.\n\n**2. Distribution** - The drug travels through the bloodstream to various tissues. Protein binding and blood-brain barrier affect distribution.\n\n**3. Metabolism** - Primarily occurs in the liver through cytochrome P450 enzymes. The drug is converted into metabolites.\n\n**4. Excretion** - The drug and its metabolites are eliminated, primarily through the kidneys.\n\nRemember the mnemonic **ADME** for the NCLEX! Would you like me to go deeper into any of these phases?";
    }
    if (lower.includes("dosage") || lower.includes("calculation")) {
      return "Let me walk you through the key dosage calculation formulas for NCLEX:\n\n**Basic Formula:**\nDose Desired / Dose on Hand x Quantity = Amount to Administer\n\n**IV Drip Rate:**\nTotal Volume (mL) / Time (hours) = mL/hour\n\n**Drops per Minute:**\n(Volume x Drop Factor) / Time in minutes = gtts/min\n\n**Weight-Based Dosing:**\nDose (mg/kg) x Weight (kg) = Total Dose\n\nWould you like me to work through a practice problem with you?";
    }
    if (lower.includes("cardiac") || lower.includes("rhythm") || lower.includes("ecg")) {
      return "Great question! Here are the key cardiac rhythms to know for NCLEX:\n\n**Normal Sinus Rhythm:** Regular rate 60-100 bpm, P wave before every QRS\n\n**Atrial Fibrillation:** Irregularly irregular, no distinct P waves, variable rate\n\n**Ventricular Tachycardia:** Wide QRS, rate >150 bpm, life-threatening\n\n**Ventricular Fibrillation:** Chaotic, no identifiable waves, requires immediate defibrillation\n\n**Asystole:** Flat line, no electrical activity, begin CPR immediately\n\nThe NCLEX loves to test your ability to identify rhythms and prioritize interventions. Want me to quiz you on rhythm recognition?";
    }
    if (lower.includes("priorit") || lower.includes("delegation")) {
      return "Prioritization is a crucial NCLEX concept! Here are the key frameworks:\n\n**ABCs (Airway, Breathing, Circulation)**\nAlways address in this order. Airway problems take priority over everything else.\n\n**Maslow's Hierarchy**\n1. Physiological needs (oxygen, food, water)\n2. Safety needs\n3. Love/belonging\n4. Self-esteem\n5. Self-actualization\n\n**Nursing Process**\nAssessment -> Diagnosis -> Planning -> Implementation -> Evaluation\nAlways assess before intervening!\n\n**Delegation Rules:**\n- RN: Assessment, planning, evaluation, teaching, unstable patients\n- LPN: Data collection, medication administration, stable patients\n- UAP: ADLs, vital signs, hygiene, ambulation\n\nWould you like practice questions on prioritization?";
    }
    return "That's a great topic to explore! Here's what you should know:\n\nThis concept appears frequently on the NCLEX, especially in questions related to patient safety and clinical judgment. The key points to remember are:\n\n1. Always apply the nursing process (ADPIE) when approaching clinical scenarios\n2. Consider patient safety as the top priority\n3. Use evidence-based practice to guide your decision-making\n\nWould you like me to provide more detail on any specific aspect, or shall we try some practice questions on this topic?";
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: simulateResponse(messageText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat History Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "w-72 shrink-0 flex-col gap-3 hidden lg:flex"
        )}
      >
        <Button
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm flex-1 overflow-hidden">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Chat History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1 overflow-y-auto">
            {chatHistory.map((chat, i) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {chat.date}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        &middot;
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {chat.messageCount} messages
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AI Tutor</h1>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-muted-foreground">Online &middot; Ready to help</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-1.5" />
            History
          </Button>
        </motion.div>

        {/* Messages Area */}
        <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, i) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/80 border border-border rounded-bl-md"
                  )}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content.split("\n").map((line, li) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={li} className="font-bold mt-2 first:mt-0">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (line.startsWith("**")) {
                        const parts = line.split("**");
                        return (
                          <p key={li} className="mt-1">
                            {parts.map((part, pi) =>
                              pi % 2 === 1 ? (
                                <strong key={pi}>{part}</strong>
                              ) : (
                                <span key={pi}>{part}</span>
                              )
                            )}
                          </p>
                        );
                      }
                      if (line.trim() === "") {
                        return <br key={li} />;
                      }
                      return <p key={li}>{line}</p>;
                    })}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] mt-1.5",
                      message.role === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted/80 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 pb-4"
            >
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                Suggested Topics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button
                    key={prompt.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted/80 hover:border-primary/30 transition-all text-left group"
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                        prompt.color
                      )}
                    >
                      <prompt.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {prompt.text}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {prompt.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about nursing or NCLEX prep..."
                  className="w-full h-11 px-4 pr-12 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className={cn(
                    "absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg",
                    input.trim()
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  )}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              AI Tutor provides educational guidance. Always verify clinical information with authoritative sources.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

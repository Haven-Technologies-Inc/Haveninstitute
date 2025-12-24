import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  HelpCircle, 
  Zap, 
  RotateCcw,
  Settings,
  Trash2,
  ChevronDown,
  GraduationCap,
  Stethoscope,
  Pill,
  Heart,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../auth/AuthContext';
import { ChatMessage } from './ChatMessage';
import aiApi from '../../services/api/aiApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ChatMode = 'tutor' | 'quiz' | 'clinical';

const QUICK_PROMPTS = [
  { 
    icon: Lightbulb, 
    label: 'Explain a concept',
    prompt: 'Explain the difference between heart failure and myocardial infarction in simple terms.',
    color: 'from-yellow-500 to-orange-500'
  },
  { 
    icon: HelpCircle, 
    label: 'Practice question',
    prompt: 'Give me an NCLEX-style practice question about medication administration.',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: Brain, 
    label: 'Study strategy',
    prompt: 'What are effective strategies for studying pharmacology for NCLEX?',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    icon: Zap, 
    label: 'Quick review',
    prompt: 'Give me a quick review of the nursing process (ADPIE).',
    color: 'from-green-500 to-emerald-500'
  },
];

const TOPIC_CATEGORIES = [
  { icon: Heart, label: 'Cardiovascular', topic: 'cardiovascular nursing' },
  { icon: Activity, label: 'Respiratory', topic: 'respiratory nursing' },
  { icon: Pill, label: 'Pharmacology', topic: 'pharmacology' },
  { icon: Stethoscope, label: 'Assessment', topic: 'health assessment' },
  { icon: GraduationCap, label: 'Fundamentals', topic: 'nursing fundamentals' },
];

export function AITutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>('tutor');
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋\n\nI'm your **AI NCLEX Tutor**, here to help you succeed on your nursing exam. I can:\n\n• **Explain concepts** in simple, memorable terms\n• **Generate practice questions** tailored to your needs\n• **Analyze clinical scenarios** using the Clinical Judgment Model\n• **Create study plans** based on your weak areas\n• **Provide rationales** for correct and incorrect answers\n\nWhat would you like to study today?`,
        timestamp: new Date()
      }]);
    }
  }, [user?.fullName, messages.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setStreamingContent('');

    try {
      // Try streaming first
      let fullResponse = '';
      let newSessionId = sessionId;

      for await (const chunk of aiApi.chatStream(content, sessionId || undefined)) {
        if (chunk.sessionId && !newSessionId) {
          newSessionId = chunk.sessionId;
          setSessionId(chunk.sessionId);
        }
        fullResponse += chunk.chunk;
        setStreamingContent(fullResponse);
        
        if (chunk.done) break;
      }

      // Add complete assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch (err) {
      console.error('Chat error:', err);
      
      // Fallback to non-streaming
      try {
        const response = await aiApi.chat(content, sessionId || undefined);
        setSessionId(response.sessionId);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (fallbackErr) {
        setError('Unable to connect to AI tutor. Please check your connection and try again.');
        console.error('Fallback error:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const clearChat = () => {
    if (sessionId) {
      aiApi.clearSession(sessionId).catch(console.error);
    }
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">AI NCLEX Tutor</h1>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Your personal study assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {[
                { id: 'tutor', label: 'Tutor', icon: BookOpen },
                { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                { id: 'clinical', label: 'Clinical', icon: Stethoscope },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id as ChatMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    mode === id 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Quick Prompts - Show only at start */}
        {messages.length <= 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick start:</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {QUICK_PROMPTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.prompt}</p>
                  </button>
                );
              })}
            </div>
            
            {/* Topic Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Topics:</span>
              {TOPIC_CATEGORIES.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.label}
                    onClick={() => handleQuickPrompt(`Help me study ${topic.topic}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}

        {/* Streaming Message */}
        {streamingContent && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-300 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'tutor' ? "Ask me anything about nursing or NCLEX..." :
                mode === 'quiz' ? "Request practice questions on any topic..." :
                "Describe a clinical scenario for analysis..."
              }
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
          AI responses are for educational purposes. Always verify clinical information with authoritative sources.
        </p>
      </div>
    </div>
  );
}

export default AITutor;

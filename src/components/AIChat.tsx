import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Sparkles, 
  Send, 
  Upload, 
  FileText, 
  Brain,
  BookOpen,
  Zap,
  Copy,
  Lightbulb,
  HelpCircle,
  List,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Menu,
  X,
  ChevronDown,
  Check,
  MessageCircle
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import * as aiApi from '../services/api/ai.api';

type ChatMode = 'tutor' | 'questions' | 'clinical';
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'questions' | 'summary' | 'document' | 'error';
  isStreaming?: boolean;
};

export function AIChat() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ChatMode>('tutor');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your **NCLEX AI Tutor**, here to help you succeed on your nursing exam.\n\n**I can help you with:**\n\n• **Tutor Mode**: Ask questions about nursing concepts, get detailed explanations, and receive study guidance\n• **Questions Mode**: Generate practice NCLEX-style questions on any topic\n• **Clinical Mode**: Analyze clinical scenarios using the Clinical Judgment Model\n\n**How can I assist you today?**`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [user?.name]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message to AI backend
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      let response: string;

      if (mode === 'tutor') {
        // Use AI chat endpoint
        const result = await aiApi.chat({
          message: currentInput,
          sessionId: sessionId || undefined
        });
        setSessionId(result.sessionId);
        response = result.response;
      } else if (mode === 'questions') {
        // Generate questions based on topic
        const result = await aiApi.generateQuestions({
          topic: currentInput,
          category: 'physiological_basic',
          difficulty: 'medium',
          count: 3
        });
        response = formatQuestionsResponse(result.questions);
      } else {
        // Clinical analysis
        const result = await aiApi.analyzeClinicalScenario({
          scenario: currentInput
        });
        response = result.analysis;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: mode === 'questions' ? 'questions' : 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('AI Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your request. ${err.response?.data?.message || err.message || 'Please try again.'}`,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format questions into readable response
  const formatQuestionsResponse = (questions: aiApi.GeneratedQuestion[]): string => {
    if (!questions || questions.length === 0) {
      return 'I was unable to generate questions for that topic. Please try a different nursing topic.';
    }

    let response = `📝 **Generated ${questions.length} NCLEX-Style Questions**\n\n`;
    
    questions.forEach((q, idx) => {
      response += `**Question ${idx + 1}:** ${q.text}\n\n`;
      q.options.forEach(opt => {
        response += `${opt.id.toUpperCase()}) ${opt.text}\n`;
      });
      response += `\n**Correct Answer:** ${q.correctAnswers.join(', ').toUpperCase()}\n`;
      response += `**Rationale:** ${q.explanation}\n`;
      response += `**Category:** ${q.category} | **Difficulty:** ${q.difficulty}\n\n---\n\n`;
    });

    response += 'Would you like more questions on this topic or a different area?';
    return response;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowUploadZone(false);

      const uploadMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `📄 Uploaded: ${file.name}`,
        timestamp: new Date(),
        type: 'document'
      };
      setMessages(prev => [...prev, uploadMessage]);

      // For now, show options - actual file processing would need backend support
      const processMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Document received: **${file.name}** (${(file.size / 1024).toFixed(2)} KB)\n\nWhat would you like me to do with this content?\n\n• Type "summarize" to get a summary\n• Type "generate questions" to create practice questions\n• Or ask me any specific questions about the content`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, processMessage]);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await aiApi.generateQuestions({
        topic: 'nursing fundamentals',
        category: 'safe_effective_care',
        difficulty: 'medium',
        count: 5
      });
      
      const questionsMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: formatQuestionsResponse(result.questions),
        timestamp: new Date(),
        type: 'questions'
      };
      setMessages(prev => [...prev, questionsMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    try {
      const result = await aiApi.summarizeContent({
        content: `Content from file: ${uploadedFile.name}`,
        topic: 'nursing'
      });

      const summaryMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📄 **Summary**\n\n${result.summary}\n\n**Key Points:**\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`,
        timestamp: new Date(),
        type: 'summary'
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      label: 'Explain a concept', 
      icon: Lightbulb, 
      prompt: 'Explain the difference between heart failure and cardiac arrest, including nursing interventions for each.' 
    },
    { 
      label: 'Pharmacology help', 
      icon: Brain, 
      prompt: 'Explain the mechanism of action, nursing implications, and patient teaching for beta-blockers.' 
    },
    { 
      label: 'Practice questions', 
      icon: HelpCircle, 
      prompt: 'Generate 3 NCLEX-style questions about fluid and electrolyte balance.' 
    },
    { 
      label: 'Clinical scenario', 
      icon: Zap, 
      prompt: 'A patient presents with chest pain, diaphoresis, and shortness of breath. Walk me through the clinical judgment process.' 
    },
  ];

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearSession = () => {
    setSessionId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Session cleared. How can I help you with your NCLEX preparation?`,
      timestamp: new Date(),
      type: 'text'
    }]);
    setError(null);
  };

  const modeConfig = {
    tutor: { icon: BookOpen, label: 'Tutor', color: 'blue', emoji: '📚', desc: 'Ask questions about nursing concepts' },
    questions: { icon: HelpCircle, label: 'Questions', color: 'purple', emoji: '📝', desc: 'Generate NCLEX-style practice questions' },
    clinical: { icon: Brain, label: 'Clinical', color: 'green', emoji: '🏥', desc: 'Analyze clinical scenarios' }
  };

  const currentMode = modeConfig[mode];
  const ModeIcon = currentMode.icon;

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-180px)] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 md:p-5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="bg-white/20 p-2 md:p-3 rounded-xl shrink-0">
              <Sparkles className="size-5 md:size-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-semibold text-white truncate">AI Study Assistant</h2>
              <p className="text-xs md:text-sm text-blue-100 hidden sm:block">Powered by advanced AI</p>
            </div>
          </div>

          {/* Mode Toggle - Desktop */}
          <div className="hidden md:flex gap-1 bg-white/10 p-1 rounded-lg">
            {(Object.entries(modeConfig) as [ChatMode, typeof currentMode][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    mode === key
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{config.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode Toggle - Mobile Dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-all"
            >
              <ModeIcon className="size-4" />
              <span className="text-sm font-medium">{currentMode.label}</span>
              <ChevronDown className={`size-4 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showModeMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden z-50 min-w-[180px]">
                  {(Object.entries(modeConfig) as [ChatMode, typeof currentMode][]).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => { setMode(key); setShowModeMenu(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          mode === key 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="size-5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{config.desc}</p>
                        </div>
                        {mode === key && <Check className="size-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Clear Session Button */}
          <button 
            onClick={clearSession} 
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <RefreshCw className="size-4 md:size-5" />
          </button>
        </div>

        {/* Mode Description - Compact on Mobile */}
        <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 text-white text-xs md:text-sm flex items-center gap-2">
          <span>{currentMode.emoji}</span>
          <span className="font-medium">{currentMode.label}:</span>
          <span className="opacity-90 truncate">{currentMode.desc}</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
          {/* Quick Actions - Mobile Optimized */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="p-3 md:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg shrink-0">
                        <Icon className="size-4 md:size-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{action.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{action.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Messages List */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[90%] md:max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-md'
                } p-3 md:p-4 shadow-sm`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                      <Sparkles className="size-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI Assistant</span>
                  </div>
                )}

                {/* Message Content with Better Formatting */}
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words">
                  {message.content.split('\n').map((line, i) => {
                    // Bold text handling
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <span key={i}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </span>
                    );
                  })}
                </div>

                {message.type === 'document' && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-300">Document uploaded</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/30 dark:border-gray-600/30">
                  <span className="text-[10px] md:text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                      title="Copy message"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md p-3 md:p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-center animate-in fade-in duration-300">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>Connection error. Please try again.</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar (when document uploaded) - Mobile Optimized */}
        {uploadedFile && (
          <div className="px-3 md:px-6 py-2 md:py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="size-4 md:size-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs md:text-sm text-blue-900 dark:text-blue-200 truncate">{uploadedFile.name}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="outline"
                  onClick={handleGenerateQuestions}
                  className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-xs md:text-sm px-2 md:px-3 py-1 h-8"
                  disabled={isLoading}
                >
                  <List className="size-3 md:size-4 mr-1 md:mr-2" />
                  Questions
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateSummary}
                  className="flex-1 sm:flex-none border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs md:text-sm px-2 md:px-3 py-1 h-8"
                  disabled={isLoading}
                >
                  <FileText className="size-3 md:size-4 mr-1 md:mr-2" />
                  Summary
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area - Mobile Optimized */}
        <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
          {showUploadZone ? (
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-4 md:p-8 bg-blue-50/50 dark:bg-blue-900/20 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                aria-label="Upload document"
              />
              <Upload className="size-8 md:size-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-gray-900 dark:text-white text-sm md:text-base font-medium mb-1 md:mb-2">Upload a Document</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
                PDF, Word, or text files
              </p>
              <div className="flex gap-2 md:gap-3 justify-center">
                <Button onClick={() => fileInputRef.current?.click()} size="sm" className="text-xs md:text-sm">
                  <Upload className="size-3 md:size-4 mr-1 md:mr-2" />
                  Choose File
                </Button>
                <Button variant="outline" onClick={() => setShowUploadZone(false)} size="sm" className="text-xs md:text-sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 md:gap-3 items-end">
              {/* Upload Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowUploadZone(true)}
                title="Upload document"
                className="shrink-0 size-10 md:size-11 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors"
              >
                <Upload className="size-4 md:size-5 text-gray-600 dark:text-gray-400" />
              </Button>

              {/* Input Field */}
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={
                    mode === 'tutor'
                      ? 'Ask about nursing concepts...'
                      : mode === 'questions'
                      ? 'Enter a topic for practice questions...'
                      : 'Describe a clinical scenario...'
                  }
                  className="w-full h-10 md:h-11 pr-4 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  disabled={isLoading}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="shrink-0 size-10 md:size-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send className="size-4 md:size-5" />
              </Button>
            </div>
          )}

          {/* Disclaimer - Hidden on very small screens */}
          <p className="hidden sm:block text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            AI responses are for study purposes only. Always verify critical information.
          </p>
        </div>
      </div>
    </div>
  );
}

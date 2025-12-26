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
  AlertCircle
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Sparkles className="size-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl text-white">AI Study Assistant</h2>
              <p className="text-blue-100">Powered by advanced AI technology</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setMode('tutor')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                mode === 'tutor'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>Tutor</span>
              </div>
            </button>
            <button
              onClick={() => setMode('questions')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                mode === 'questions'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4" />
                <span>Questions</span>
              </div>
            </button>
            <button
              onClick={() => setMode('clinical')}
              className={`px-3 py-2 rounded-lg transition-all text-sm ${
                mode === 'clinical'
                  ? 'bg-white text-green-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="size-4" />
                <span>Clinical</span>
              </div>
            </button>
          </div>
          <Button onClick={clearSession} variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <RefreshCw className="size-4" />
          </Button>
        </div>

        {/* Mode Description */}
        <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
          {mode === 'tutor' && (
            <p>📚 <strong>Tutor Mode:</strong> Ask questions about nursing concepts, get detailed NCLEX explanations</p>
          )}
          {mode === 'questions' && (
            <p>📝 <strong>Questions Mode:</strong> Generate practice NCLEX-style questions on any topic</p>
          )}
          {mode === 'clinical' && (
            <p>🏥 <strong>Clinical Mode:</strong> Analyze clinical scenarios using the Clinical Judgment Model</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <Icon className="size-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.prompt}</p>
                  </button>
                );
              })}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-2xl p-4 shadow-sm`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-blue-600" />
                    <span className="text-xs text-gray-600">AI Assistant</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.type === 'document' && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg">
                    <FileText className="size-4 text-blue-600" />
                    <span className="text-sm text-blue-800">Document uploaded</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Copy message"
                    >
                      <Copy className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-600 animate-pulse" />
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                <AlertCircle className="size-4" />
                <span>Connection error. Please try again.</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar (when document uploaded) */}
        {uploadedFile && (
          <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
            <div className="flex items-center gap-3">
              <FileCheck className="size-5 text-blue-600" />
              <span className="text-sm text-blue-900">Document ready: {uploadedFile.name}</span>
              <div className="flex-1"></div>
              <Button
                variant="outline"
                onClick={handleGenerateQuestions}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm px-3 py-1 h-8"
                disabled={isLoading}
              >
                <List className="size-4 mr-2" />
                Generate Questions
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateSummary}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-sm px-3 py-1 h-8"
                disabled={isLoading}
              >
                <FileText className="size-4 mr-2" />
                Create Summary
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {showUploadZone ? (
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 bg-blue-50/50 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <Upload className="size-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">Upload a Document</h3>
              <p className="text-gray-600 text-sm mb-4">
                Drag and drop or click to upload PDF, Word, or text files
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-4 mr-2" />
                  Choose File
                </Button>
                <Button variant="outline" onClick={() => setShowUploadZone(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowUploadZone(true)}
                title="Upload document"
              >
                <Upload className="size-5" />
              </Button>

              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  mode === 'study'
                    ? 'Ask a question or request an explanation...'
                    : 'Request practice questions or exercises...'
                }
                className="flex-1"
              />

              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Send className="size-5" />
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are for study purposes only. Always verify critical information.
          </p>
        </div>
      </div>
    </div>
  );
}

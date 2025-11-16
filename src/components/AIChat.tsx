import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Sparkles, 
  Send, 
  Upload, 
  FileText, 
  Brain,
  BookOpen,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Download,
  Copy,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  List,
  FileCheck
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

type ChatMode = 'study' | 'learn';
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'questions' | 'summary' | 'document';
};

export function AIChat() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ChatMode>('study');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user?.name}! 👋 I'm your AI study assistant. I can help you with:\n\n• Study Mode: Get explanations, clarifications, and study tips\n• Learn Mode: Interactive learning with questions and exercises\n• Upload documents to generate questions and summaries\n\nHow can I help you today?`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, mode);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, currentMode: ChatMode): Message => {
    const lowerQuery = query.toLowerCase();

    // Study Mode responses
    if (currentMode === 'study') {
      if (lowerQuery.includes('cardiac') || lowerQuery.includes('heart')) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great question about cardiac care! 🫀\n\n**Key Points:**\n\n1. **Cardiac Cycle**: Understand systole (contraction) and diastole (relaxation)\n2. **Common Conditions**: MI, CHF, Arrhythmias\n3. **Critical Meds**: Beta-blockers, ACE inhibitors, Anticoagulants\n4. **Assessment**: Vital signs, heart sounds, ECG monitoring\n\n**NCLEX Tip**: Focus on priority interventions - remember ABCs (Airway, Breathing, Circulation)!\n\nWould you like me to generate practice questions on this topic?`,
          timestamp: new Date(),
          type: 'text'
        };
      }

      if (lowerQuery.includes('pharmacology') || lowerQuery.includes('medication')) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Let's break down pharmacology! 💊\n\n**Study Strategy:**\n\n1. **Drug Classifications**: Group medications by class (e.g., beta-blockers)\n2. **Mechanism of Action**: How the drug works\n3. **Key Side Effects**: What to monitor\n4. **Nursing Implications**: Assessment & patient teaching\n\n**Memory Tip**: Use suffix patterns:\n• -olol = Beta-blockers (propranolol)\n• -pril = ACE inhibitors (lisinopril)\n• -sartan = ARBs (losartan)\n\nWhat specific drug class would you like to focus on?`,
          timestamp: new Date(),
          type: 'text'
        };
      }
    }

    // Learn Mode responses
    if (currentMode === 'learn') {
      if (lowerQuery.includes('quiz') || lowerQuery.includes('question')) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Perfect! Let me create a mini-quiz for you:\n\n**Question 1:** A client with heart failure is prescribed furosemide (Lasix). Which assessment finding is most important to report?\n\nA) Blood pressure 128/82 mmHg\nB) Serum potassium 2.8 mEq/L\nC) Urine output 50 mL/hour\nD) Heart rate 76 bpm\n\n**Correct Answer:** B) Serum potassium 2.8 mEq/L\n\n**Rationale:** Furosemide is a loop diuretic that causes potassium loss. A K+ of 2.8 is below normal (3.5-5.0) and can lead to dangerous arrhythmias.\n\nWould you like more practice questions?`,
          timestamp: new Date(),
          type: 'questions'
        };
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: mode === 'study' 
        ? `I understand you're asking about "${query}". Let me help you with that!\n\nIn Study Mode, I can:\n• Explain complex concepts simply\n• Provide mnemonics and memory tips\n• Break down difficult topics\n• Offer study strategies\n\nCould you be more specific about what you'd like to learn?`
        : `Great! In Learn Mode, I can create interactive content for "${query}".\n\nI can:\n• Generate practice questions\n• Create flashcards\n• Design case studies\n• Provide hands-on exercises\n\nWhat would you like to do first?`,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowUploadZone(false);

      // Add message about file upload
      const uploadMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Uploaded: ${file.name}`,
        timestamp: new Date(),
        type: 'document'
      };

      setMessages(prev => [...prev, uploadMessage]);
      setIsTyping(true);

      // Simulate processing
      setTimeout(() => {
        const processMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Document processed successfully!\n\n**File:** ${file.name}\n**Size:** ${(file.size / 1024).toFixed(2)} KB\n\nWhat would you like me to do?\n\n1. **Generate Questions** - Create practice questions from this content\n2. **Create Summary** - Get a concise summary of key points\n3. **Extract Concepts** - Identify main topics and definitions\n\nClick a button below or type your choice!`,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, processMessage]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleGenerateQuestions = () => {
    setIsTyping(true);

    setTimeout(() => {
      const questionsMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📝 **Generated 5 Questions from Document**\n\n**Question 1:** What is the primary function of the cardiovascular system?\nA) Digestion\nB) Transport of oxygen and nutrients\nC) Hormone production\nD) Temperature regulation\n\n**Question 2:** Which chamber of the heart receives oxygenated blood from the lungs?\nA) Right atrium\nB) Right ventricle\nC) Left atrium\nD) Left ventricle\n\n**Question 3:** What is the normal range for adult heart rate?\nA) 40-60 bpm\nB) 60-100 bpm\nC) 100-120 bpm\nD) 120-140 bpm\n\n**Question 4:** Which blood vessel carries blood away from the heart?\nA) Vein\nB) Artery\nC) Capillary\nD) Venule\n\n**Question 5:** What is the term for high blood pressure?\nA) Hypotension\nB) Hypertension\nC) Tachycardia\nD) Bradycardia\n\n**Answers:** 1-B, 2-C, 3-B, 4-B, 5-B\n\nWould you like explanations for these answers?`,
        timestamp: new Date(),
        type: 'questions'
      };
      setMessages(prev => [...prev, questionsMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleGenerateSummary = () => {
    setIsTyping(true);

    setTimeout(() => {
      const summaryMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📄 **Document Summary**\n\n**Main Topics Covered:**\n\n1. **Cardiovascular Anatomy**\n   • Four chambers: atria and ventricles\n   • Major vessels: aorta, vena cava, pulmonary arteries/veins\n   • Valves: mitral, tricuspid, aortic, pulmonary\n\n2. **Cardiac Physiology**\n   • Cardiac cycle: systole and diastole\n   • Blood flow pathway through the heart\n   • Electrical conduction system\n\n3. **Common Disorders**\n   • Hypertension (elevated blood pressure)\n   • Myocardial infarction (heart attack)\n   • Heart failure (pump dysfunction)\n   • Arrhythmias (irregular rhythms)\n\n4. **Nursing Assessment**\n   • Vital signs monitoring\n   • Heart sounds auscultation\n   • ECG interpretation basics\n   • Patient symptoms evaluation\n\n**Key Takeaway:** Understanding cardiovascular function is essential for NCLEX success and safe patient care.\n\nWould you like me to expand on any of these topics?`,
        timestamp: new Date(),
        type: 'summary'
      };
      setMessages(prev => [...prev, summaryMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const quickActions = [
    { 
      label: 'Explain a concept', 
      icon: Lightbulb, 
      prompt: 'Can you explain the difference between heart failure and cardiac arrest?' 
    },
    { 
      label: 'Study tips', 
      icon: Brain, 
      prompt: 'What are the best strategies for studying pharmacology?' 
    },
    { 
      label: 'Practice questions', 
      icon: HelpCircle, 
      prompt: 'Give me practice questions on cardiac nursing' 
    },
    { 
      label: 'Mnemonics', 
      icon: Zap, 
      prompt: 'What are some helpful mnemonics for remembering vital signs?' 
    },
  ];

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
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
          <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setMode('study')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'study'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>Study Mode</span>
              </div>
            </button>
            <button
              onClick={() => setMode('learn')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'learn'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="size-4" />
                <span>Learn Mode</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Description */}
        <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
          {mode === 'study' ? (
            <p>📚 <strong>Study Mode:</strong> Get explanations, clarifications, and study strategies for NCLEX topics</p>
          ) : (
            <p>🎯 <strong>Learn Mode:</strong> Interactive learning with practice questions, quizzes, and exercises</p>
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

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-600 animate-pulse" />
                  <span className="text-gray-600">AI is typing...</span>
                </div>
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
                size="sm"
                variant="outline"
                onClick={handleGenerateQuestions}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <List className="size-4 mr-2" />
                Generate Questions
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateSummary}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
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

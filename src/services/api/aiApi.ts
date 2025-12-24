import api from '../api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  provider: string;
}

export interface TutoringSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface GeneratedQuestion {
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category: string;
  difficulty: string;
  bloomLevel: string;
  tags: string[];
  irtDifficulty: number;
}

export interface StudyPlan {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyPlans: any[];
  recommendations: string[];
  milestones: any[];
}

export const aiApi = {
  // Chat with AI tutor
  async chat(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await api.post('/ai/chat', { message, sessionId });
    return response.data.data;
  },

  // Stream chat response (returns EventSource URL)
  getChatStreamUrl(message: string, sessionId?: string): string {
    const params = new URLSearchParams({ message });
    if (sessionId) params.append('sessionId', sessionId);
    return `${api.defaults.baseURL}/ai/chat/stream?${params.toString()}`;
  },

  // Stream chat with fetch
  async *chatStream(message: string, sessionId?: string): AsyncGenerator<{ chunk: string; done: boolean; sessionId?: string }> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start chat stream');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { chunk: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            yield { chunk: parsed.chunk || '', done: parsed.done || false, sessionId: parsed.sessionId };
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  },

  // Generate NCLEX questions
  async generateQuestions(params: {
    topic: string;
    category: string;
    difficulty: string;
    bloomLevel: string;
    count: number;
    context?: string;
  }): Promise<GeneratedQuestion[]> {
    const response = await api.post('/ai/generate-questions', params);
    return response.data.data;
  },

  // Generate study plan
  async generateStudyPlan(params: {
    currentAbility: number;
    weakAreas: string[];
    availableHoursPerDay: number;
    targetDate?: Date;
    preferredStudyTimes?: string[];
  }): Promise<StudyPlan> {
    const response = await api.post('/ai/study-plan', params);
    return response.data.data;
  },

  // Explain a question
  async explainQuestion(params: {
    questionText: string;
    correctAnswer: string;
    userAnswer?: string;
    topic: string;
  }): Promise<string> {
    const response = await api.post('/ai/explain', params);
    return response.data.data;
  },

  // Analyze clinical scenario
  async analyzeClinicalScenario(scenario: string): Promise<string> {
    const response = await api.post('/ai/clinical-analysis', { scenario });
    return response.data.data;
  },

  // Summarize content
  async summarizeContent(content: string, topic: string): Promise<{
    summary: string;
    keyPoints: string[];
    flashcards: { front: string; back: string }[];
  }> {
    const response = await api.post('/ai/summarize', { content, topic });
    return response.data.data;
  },

  // Get recommendations
  async getRecommendations(performance: {
    overallScore: number;
    categoryScores: Record<string, number>;
    weakTopics: string[];
    recentTrend: 'improving' | 'stable' | 'declining';
  }): Promise<string[]> {
    const response = await api.post('/ai/recommendations', { performance });
    return response.data.data;
  },

  // Get session history
  async getSession(sessionId: string): Promise<TutoringSession | null> {
    const response = await api.get(`/ai/session/${sessionId}`);
    return response.data.data;
  },

  // Clear session
  async clearSession(sessionId: string): Promise<void> {
    await api.delete(`/ai/session/${sessionId}`);
  },
};

export default aiApi;

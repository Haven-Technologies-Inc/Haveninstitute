/**
 * AI Service - NCLEX AI features using multiple providers
 */

import { v4 as uuidv4 } from 'uuid';
import { getProvider } from './providers';
import { SYSTEM_PROMPTS, NCLEX_CATEGORIES } from './prompts';
import {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  QuestionGenerationRequest,
  GeneratedQuestion,
  StudyPlanRequest,
  StudyPlan,
  ExplanationRequest,
  TutoringSession
} from './types';

// In-memory session store (replace with Redis in production)
const tutoringSessions: Map<string, TutoringSession> = new Map();

export class AIService {
  private defaultProvider: AIProvider;

  constructor() {
    this.defaultProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
  }

  /**
   * AI Tutoring Chat
   */
  async chat(
    sessionId: string | null,
    message: string,
    userId: string,
    provider?: AIProvider
  ): Promise<{ sessionId: string; response: string; provider: AIProvider }> {
    const ai = getProvider(provider || this.defaultProvider);
    
    // Get or create session
    let session: TutoringSession;
    if (sessionId && tutoringSessions.has(sessionId)) {
      session = tutoringSessions.get(sessionId)!;
    } else {
      session = {
        sessionId: uuidv4(),
        userId,
        messages: [],
        createdAt: new Date()
      };
      tutoringSessions.set(session.sessionId, session);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Build messages for AI
    const aiMessages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.tutor },
      ...session.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    // Get response
    const result = await ai.chat(aiMessages, {
      temperature: 0.7,
      maxTokens: 2048
    });

    // Add assistant response
    session.messages.push({
      role: 'assistant',
      content: result.content,
      timestamp: new Date()
    });

    return {
      sessionId: session.sessionId,
      response: result.content,
      provider: ai.name
    };
  }

  /**
   * Stream chat response
   */
  async *chatStream(
    sessionId: string | null,
    message: string,
    userId: string,
    provider?: AIProvider
  ): AsyncGenerator<{ chunk: string; done: boolean; sessionId: string }> {
    const ai = getProvider(provider || this.defaultProvider);
    
    // Get or create session
    let session: TutoringSession;
    if (sessionId && tutoringSessions.has(sessionId)) {
      session = tutoringSessions.get(sessionId)!;
    } else {
      session = {
        sessionId: uuidv4(),
        userId,
        messages: [],
        createdAt: new Date()
      };
      tutoringSessions.set(session.sessionId, session);
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Build messages
    const aiMessages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.tutor },
      ...session.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    // Stream response
    let fullResponse = '';
    for await (const chunk of ai.chatStream(aiMessages)) {
      fullResponse += chunk.content;
      yield { chunk: chunk.content, done: chunk.done, sessionId: session.sessionId };
    }

    // Save complete response
    session.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date()
    });
  }

  /**
   * Generate NCLEX questions
   */
  async generateQuestions(
    request: QuestionGenerationRequest,
    provider?: AIProvider
  ): Promise<GeneratedQuestion[]> {
    const ai = getProvider(provider || this.defaultProvider);

    const prompt = `Generate ${request.count} NCLEX-style questions with the following specifications:
- Topic: ${request.topic}
- Category: ${request.category}
- Difficulty: ${request.difficulty}
- Bloom's Level: ${request.bloomLevel}
${request.context ? `- Context: ${request.context}` : ''}

Return ONLY a valid JSON array of questions. Each question must have:
- text (string): The question stem
- options (array): [{id: "a", text: "..."}, {id: "b", text: "..."}, ...]
- correctAnswers (array): ["a"] or ["a", "c"] for SATA
- explanation (string): Detailed rationale
- category (string): "${request.category}"
- difficulty (string): "${request.difficulty}"
- bloomLevel (string): "${request.bloomLevel}"
- tags (array): Related topics
- irtDifficulty (number): -3 to +3 scale`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.questionGenerator },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.8,
      maxTokens: 4096
    });

    // Parse JSON response
    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      
      const questions = JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
      return questions;
    } catch (error) {
      console.error('Failed to parse generated questions:', error);
      throw new Error('Failed to generate valid questions');
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(
    request: StudyPlanRequest,
    provider?: AIProvider
  ): Promise<StudyPlan> {
    const ai = getProvider(provider || this.defaultProvider);

    const targetDate = request.targetDate 
      ? request.targetDate.toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const prompt = `Create a personalized NCLEX study plan with these parameters:
- Current ability level: ${request.currentAbility} (logit scale, 0 = passing threshold)
- Weak areas: ${request.weakAreas.join(', ')}
- Available study time: ${request.availableHoursPerDay} hours per day
- Target exam date: ${targetDate}
- Start date: ${new Date().toISOString().split('T')[0]}
${request.preferredStudyTimes ? `- Preferred study times: ${request.preferredStudyTimes.join(', ')}` : ''}

NCLEX Category distribution:
${NCLEX_CATEGORIES.map(c => `- ${c.name}: ${c.percentage}`).join('\n')}

Create a comprehensive daily plan that:
1. Prioritizes weak areas
2. Maintains category balance
3. Includes variety (questions, flashcards, reading)
4. Builds progressively in difficulty
5. Includes rest days

Return ONLY valid JSON matching this structure:
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "totalDays": number,
  "dailyPlans": [...],
  "recommendations": [...],
  "milestones": [...]
}`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.studyPlanGenerator },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 4096
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found');
      
      return JSON.parse(jsonMatch[0]) as StudyPlan;
    } catch (error) {
      console.error('Failed to parse study plan:', error);
      throw new Error('Failed to generate valid study plan');
    }
  }

  /**
   * Generate question explanation
   */
  async explainQuestion(
    request: ExplanationRequest,
    provider?: AIProvider
  ): Promise<string> {
    const ai = getProvider(provider || this.defaultProvider);

    const prompt = `Explain this NCLEX question:

Question: ${request.questionText}
Correct Answer: ${request.correctAnswer}
${request.userAnswer ? `Student's Answer: ${request.userAnswer}` : ''}
Topic: ${request.topic}

Provide a comprehensive explanation including:
1. Why the correct answer is correct
2. Why other options are incorrect
3. Key nursing concepts
4. Clinical judgment steps
5. Test-taking tips
6. Related topics to review`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.explanationGenerator },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 2048
    });

    return result.content;
  }

  /**
   * Analyze clinical scenario using CJMM
   */
  async analyzeClinicalScenario(
    scenario: string,
    provider?: AIProvider
  ): Promise<string> {
    const ai = getProvider(provider || this.defaultProvider);

    const prompt = `Analyze this clinical scenario using the NCSBN Clinical Judgment Measurement Model:

${scenario}

Walk through each layer of clinical judgment:
1. Recognize Cues - What information is relevant?
2. Analyze Cues - What do these findings mean?
3. Prioritize Hypotheses - What conditions are most likely?
4. Generate Solutions - What interventions are possible?
5. Take Action - What should the nurse do first?
6. Evaluate Outcomes - How to assess effectiveness?`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.clinicalJudgment },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 2048
    });

    return result.content;
  }

  /**
   * Summarize nursing content for flashcards
   */
  async summarizeContent(
    content: string,
    topic: string,
    provider?: AIProvider
  ): Promise<{ summary: string; keyPoints: string[]; flashcards: { front: string; back: string }[] }> {
    const ai = getProvider(provider || this.defaultProvider);

    const prompt = `Summarize this nursing content for NCLEX preparation:

Topic: ${topic}
Content:
${content}

Return JSON with:
{
  "summary": "Brief overview (2-3 sentences)",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "flashcards": [
    {"front": "Question/term", "back": "Answer/definition"},
    ...
  ]
}

Focus on NCLEX-relevant information and clinical applications.`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.contentSummarizer },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 2048
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        summary: result.content,
        keyPoints: [],
        flashcards: []
      };
    }
  }

  /**
   * Get performance recommendations
   */
  async getRecommendations(
    performance: {
      overallScore: number;
      categoryScores: Record<string, number>;
      weakTopics: string[];
      recentTrend: 'improving' | 'stable' | 'declining';
    },
    provider?: AIProvider
  ): Promise<string[]> {
    const ai = getProvider(provider || this.defaultProvider);

    const prompt = `Based on this NCLEX prep performance data, provide personalized study recommendations:

Overall Score: ${performance.overallScore}%
Category Performance:
${Object.entries(performance.categoryScores).map(([cat, score]) => `- ${cat}: ${score}%`).join('\n')}
Weak Topics: ${performance.weakTopics.join(', ')}
Recent Trend: ${performance.recentTrend}

Provide 5-7 specific, actionable recommendations to improve performance.
Return as JSON array of strings.`;

    const result = await ai.chat([
      { role: 'system', content: SYSTEM_PROMPTS.tutor },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.7,
      maxTokens: 1024
    });

    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Parse as text
    }

    return result.content.split('\n').filter(line => line.trim().length > 0);
  }

  /**
   * Get tutoring session
   */
  getSession(sessionId: string): TutoringSession | null {
    return tutoringSessions.get(sessionId) || null;
  }

  /**
   * Clear tutoring session
   */
  clearSession(sessionId: string): boolean {
    return tutoringSessions.delete(sessionId);
  }
}

export const aiService = new AIService();
export default aiService;

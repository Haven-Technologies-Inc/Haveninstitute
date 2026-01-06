/**
 * AI Controller - API endpoints for AI features
 */

import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai';
import { AIProvider } from '../services/ai/types';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  userId?: string;
}

export class AIController {
  /**
   * Chat with AI tutor
   * POST /api/v1/ai/chat
   */
  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { message, sessionId, provider } = req.body;

      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const result = await aiService.chat(
        sessionId || null,
        message,
        userId,
        provider as AIProvider
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: error.message || 'AI service error' });
    }
  }

  /**
   * Stream chat response
   * POST /api/v1/ai/chat/stream
   */
  async chatStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { message, sessionId, provider } = req.body;

      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = aiService.chatStream(
        sessionId || null,
        message,
        userId,
        provider as AIProvider
      );

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('AI stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  /**
   * Generate NCLEX questions
   * POST /api/v1/ai/generate-questions
   */
  async generateQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { topic, category, difficulty, bloomLevel, count, context, provider } = req.body;

      if (!topic || !category) {
        return res.status(400).json({ message: 'Topic and category are required' });
      }

      const questions = await aiService.generateQuestions({
        topic,
        category,
        difficulty: difficulty || 'medium',
        bloomLevel: bloomLevel || 'apply',
        count: count || 5,
        context
      }, provider as AIProvider);

      res.json({ success: true, data: questions });
    } catch (error: any) {
      console.error('Question generation error:', error);
      res.status(500).json({ message: error.message || 'Failed to generate questions' });
    }
  }

  /**
   * Generate personalized study plan
   * POST /api/v1/ai/study-plan
   */
  async generateStudyPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { 
        targetDate, 
        weakAreas, 
        currentAbility, 
        availableHoursPerDay,
        preferredStudyTimes,
        provider 
      } = req.body;

      const plan = await aiService.generateStudyPlan({
        userId,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        weakAreas: weakAreas || [],
        currentAbility: currentAbility || 0,
        availableHoursPerDay: availableHoursPerDay || 2,
        preferredStudyTimes
      }, provider as AIProvider);

      res.json({ success: true, data: plan });
    } catch (error: any) {
      console.error('Study plan generation error:', error);
      res.status(500).json({ message: error.message || 'Failed to generate study plan' });
    }
  }

  /**
   * Get question explanation
   * POST /api/v1/ai/explain
   */
  async explainQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { questionText, correctAnswer, userAnswer, topic, provider } = req.body;

      if (!questionText || !correctAnswer) {
        return res.status(400).json({ message: 'Question text and correct answer are required' });
      }

      const explanation = await aiService.explainQuestion({
        questionText,
        correctAnswer,
        userAnswer,
        topic: topic || 'Nursing'
      }, provider as AIProvider);

      res.json({ success: true, data: explanation });
    } catch (error: any) {
      console.error('Explanation error:', error);
      res.status(500).json({ message: error.message || 'Failed to generate explanation' });
    }
  }

  /**
   * Generate and save explanation for a question by ID
   * POST /api/v1/ai/explain-question/:questionId
   */
  async explainQuestionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { questionId } = req.params;
      const { saveToQuestion, provider } = req.body;

      // Import Question model dynamically to avoid circular deps
      const { Question } = await import('../models');

      // Fetch question from database
      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Build correct answer text from options
      const options = question.options as { id: string; text: string }[];
      const correctAnswers = question.correctAnswers as string[];
      const correctAnswerText = correctAnswers
        .map(id => {
          const opt = options.find(o => o.id === id);
          return opt ? `${id.toUpperCase()}. ${opt.text}` : id;
        })
        .join('; ');

      // Generate explanation
      const explanation = await aiService.explainQuestion({
        questionText: question.text,
        correctAnswer: correctAnswerText,
        topic: question.category || 'Nursing'
      }, provider as AIProvider);

      // Optionally save to question
      if (saveToQuestion) {
        await question.update({ explanation });
      }

      res.json({ 
        success: true, 
        data: {
          explanation,
          saved: saveToQuestion || false
        }
      });
    } catch (error: any) {
      console.error('Explain question by ID error:', error);
      res.status(500).json({ message: error.message || 'Failed to generate explanation' });
    }
  }

  /**
   * Analyze clinical scenario
   * POST /api/v1/ai/clinical-analysis
   */
  async analyzeClinicalScenario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { scenario, provider } = req.body;

      if (!scenario) {
        return res.status(400).json({ message: 'Clinical scenario is required' });
      }

      const analysis = await aiService.analyzeClinicalScenario(
        scenario,
        provider as AIProvider
      );

      res.json({ success: true, data: analysis });
    } catch (error: any) {
      console.error('Clinical analysis error:', error);
      res.status(500).json({ message: error.message || 'Failed to analyze scenario' });
    }
  }

  /**
   * Summarize content for flashcards
   * POST /api/v1/ai/summarize
   */
  async summarizeContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { content, topic, provider } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const result = await aiService.summarizeContent(
        content,
        topic || 'Nursing',
        provider as AIProvider
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Summarization error:', error);
      res.status(500).json({ message: error.message || 'Failed to summarize content' });
    }
  }

  /**
   * Get personalized recommendations
   * POST /api/v1/ai/recommendations
   */
  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { overallScore, categoryScores, weakTopics, recentTrend, provider } = req.body;

      const recommendations = await aiService.getRecommendations({
        overallScore: overallScore || 0,
        categoryScores: categoryScores || {},
        weakTopics: weakTopics || [],
        recentTrend: recentTrend || 'stable'
      }, provider as AIProvider);

      res.json({ success: true, data: recommendations });
    } catch (error: any) {
      console.error('Recommendations error:', error);
      res.status(500).json({ message: error.message || 'Failed to get recommendations' });
    }
  }

  /**
   * Get tutoring session history
   * GET /api/v1/ai/session/:sessionId
   */
  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const session = await aiService.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      res.json({ success: true, data: session });
    } catch (error: any) {
      console.error('Get session error:', error);
      res.status(500).json({ message: error.message || 'Failed to get session' });
    }
  }

  /**
   * Clear tutoring session
   * DELETE /api/v1/ai/session/:sessionId
   */
  async clearSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const session = await aiService.getSession(sessionId);
      if (session && session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await aiService.clearSession(sessionId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Clear session error:', error);
      res.status(500).json({ message: error.message || 'Failed to clear session' });
    }
  }
}

export const aiController = new AIController();
export default aiController;

import { Request, Response, NextFunction } from 'express';
import { catEngine } from '../services/cat.engine';
import { CATSession } from '../models/CATSession';
import { CATResponse } from '../models/CATResponse';
import { Question } from '../models/Question';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/authenticate';

export class CATController {
  /**
   * Start a new CAT session
   * POST /api/v1/cat/start
   */
  async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check for existing in-progress session
      const existingSession = await CATSession.findOne({
        where: {
          userId,
          status: 'in_progress'
        }
      });

      if (existingSession) {
        // Return existing session with current question
        const nextQuestion = await catEngine.selectNextQuestion(
          existingSession.currentAbility,
          existingSession.answeredQuestionIds
        );

        return res.json({
          sessionId: existingSession.id,
          resuming: true,
          questionsAnswered: existingSession.questionsAnswered,
          timeSpent: existingSession.timeSpent,
          timeLimit: existingSession.timeLimit,
          firstQuestion: nextQuestion ? this.formatQuestion(nextQuestion) : null,
          estimatedDuration: 180, // 3 hours average
          minQuestions: 60,
          maxQuestions: 145
        });
      }

      // Create new session
      const session = await catEngine.startSession(userId);

      // Get first question (medium difficulty, average ability = 0)
      const firstQuestion = await catEngine.selectNextQuestion(0, []);

      res.status(201).json({
        sessionId: session.id,
        resuming: false,
        firstQuestion: firstQuestion ? this.formatQuestion(firstQuestion) : null,
        estimatedDuration: 180,
        minQuestions: 60,
        maxQuestions: 145
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit an answer and get next question
   * POST /api/v1/cat/:sessionId/answer
   */
  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const { questionId, answer, timeSpent } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate input
      if (!questionId || !answer || typeof timeSpent !== 'number') {
        return res.status(400).json({ 
          message: 'Missing required fields: questionId, answer, timeSpent' 
        });
      }

      // Get session and verify ownership
      const session = await CATSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (session.status !== 'in_progress') {
        return res.status(400).json({ message: 'Session is no longer active' });
      }

      // Normalize answer to array
      const answerArray = Array.isArray(answer) ? answer : [answer];

      // Process the answer
      const result = await catEngine.processAnswer(
        session,
        questionId,
        answerArray,
        timeSpent
      );

      res.json({
        correct: result.correct,
        explanation: result.explanation,
        currentAbility: result.newAbility,
        confidence: Math.round((1 - result.newSE) * 100),
        questionsAnswered: session.questionsAnswered + 1,
        questionsRemaining: {
          min: Math.max(0, 60 - (session.questionsAnswered + 1)),
          max: 145 - (session.questionsAnswered + 1)
        },
        passingProbability: Math.round(result.passingProbability * 100),
        isComplete: result.shouldStop,
        nextQuestion: result.nextQuestion ? this.formatQuestion(result.nextQuestion) : null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete/end a CAT session
   * POST /api/v1/cat/:sessionId/complete
   */
  async completeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const session = await CATSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // If session not already completed, complete it now
      if (session.status === 'in_progress') {
        await session.update({
          status: 'completed',
          result: session.passingProbability >= 0.5 ? 'pass' : 'fail',
          stopReason: 'user_ended',
          completedAt: new Date()
        });
      }

      // Get detailed result
      const result = await catEngine.getSessionResult(sessionId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get CAT session result
   * GET /api/v1/cat/:sessionId/result
   */
  async getResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const session = await CATSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const result = await catEngine.getSessionResult(sessionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get CAT session state
   * GET /api/v1/cat/:sessionId
   */
  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const session = await CATSession.findByPk(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get current question if session is in progress
      let currentQuestion = null;
      if (session.status === 'in_progress') {
        currentQuestion = await catEngine.selectNextQuestion(
          session.currentAbility,
          session.answeredQuestionIds
        );
      }

      res.json({
        sessionId: session.id,
        status: session.status,
        currentQuestion: currentQuestion ? this.formatQuestion(currentQuestion) : null,
        questionsAnswered: session.questionsAnswered,
        questionsCorrect: session.questionsCorrect,
        currentAbility: session.currentAbility,
        standardError: session.standardError,
        passingProbability: Math.round(session.passingProbability * 100),
        timeSpent: session.timeSpent
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get CAT history for user
   * GET /api/v1/cat/history
   */
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const sessions = await CATSession.findAll({
        where: {
          userId,
          status: { [Op.in]: ['completed', 'abandoned'] }
        },
        order: [['createdAt', 'DESC']],
        limit
      });

      const history = sessions.map(s => ({
        sessionId: s.id,
        score: s.questionsCorrect,
        total: s.questionsAnswered,
        passingProbability: Math.round(s.passingProbability * 100),
        abilityEstimate: s.currentAbility,
        passed: s.result === 'pass',
        date: s.createdAt.toISOString(),
        timeSpent: s.timeSpent
      }));

      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current ability estimate
   * GET /api/v1/cat/ability
   */
  async getAbility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get completed sessions
      const sessions = await CATSession.findAll({
        where: {
          userId,
          status: 'completed'
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      if (sessions.length === 0) {
        return res.json({
          ability: 0,
          confidence: 0,
          trend: 'stable',
          testsCompleted: 0
        });
      }

      const latestAbility = sessions[0].currentAbility;
      const latestConfidence = Math.round((1 - sessions[0].standardError) * 100);

      // Calculate trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (sessions.length >= 3) {
        const recentAvg = sessions.slice(0, 3).reduce((a, s) => a + s.currentAbility, 0) / 3;
        const olderAvg = sessions.slice(-3).reduce((a, s) => a + s.currentAbility, 0) / Math.min(3, sessions.length);
        
        if (recentAvg > olderAvg + 0.3) trend = 'improving';
        else if (recentAvg < olderAvg - 0.3) trend = 'declining';
      }

      res.json({
        ability: latestAbility,
        confidence: latestConfidence,
        trend,
        testsCompleted: sessions.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Format question for API response (hide correct answers)
   */
  private formatQuestion(question: Question) {
    return {
      id: question.id,
      text: question.text,
      options: question.options,
      category: question.category,
      difficulty: question.irtDifficulty,
      type: question.questionType
    };
  }
}

export const catController = new CATController();
export default catController;

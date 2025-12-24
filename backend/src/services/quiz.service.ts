/**
 * Quiz Service - Handles practice quiz sessions
 */

import { Op } from 'sequelize';
import { Question } from '../models/Question';
import { QuizSession } from '../models/QuizSession';
import { QuizResponse } from '../models/QuizResponse';
import { StudyActivity } from '../models/StudyActivity';

export class QuizService {
  /**
   * Start a new quiz session
   */
  async startQuiz(
    userId: string,
    options: {
      category?: string;
      difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
      questionCount?: number;
    } = {}
  ) {
    const { category, difficulty = 'mixed', questionCount = 10 } = options;

    // Build query for questions
    const whereClause: any = { isActive: true };
    if (category) whereClause.category = category;
    if (difficulty !== 'mixed') whereClause.difficulty = difficulty;

    // Get random questions
    const questions = await Question.findAll({
      where: whereClause,
      order: [['id', 'ASC']], // Will shuffle below
      limit: questionCount * 3 // Get more to shuffle from
    });

    if (questions.length < questionCount) {
      throw new Error(`Not enough questions available. Found ${questions.length}, need ${questionCount}`);
    }

    // Shuffle and select
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionCount);
    const questionIds = selectedQuestions.map(q => q.id);

    // Create session
    const session = await QuizSession.create({
      userId,
      status: 'in_progress',
      category: category || 'mixed',
      difficulty,
      questionCount,
      questionIds,
      currentQuestionIndex: 0
    });

    // Return session with first question
    return {
      sessionId: session.id,
      questionCount,
      category: category || 'mixed',
      difficulty,
      firstQuestion: this.formatQuestion(selectedQuestions[0])
    };
  }

  /**
   * Get current question in a session
   */
  async getCurrentQuestion(sessionId: string, userId: string) {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Unauthorized');
    if (session.status !== 'in_progress') throw new Error('Session is not active');

    const questionId = session.questionIds[session.currentQuestionIndex];
    const question = await Question.findByPk(questionId);
    if (!question) throw new Error('Question not found');

    return {
      questionNumber: session.currentQuestionIndex + 1,
      totalQuestions: session.questionCount,
      question: this.formatQuestion(question)
    };
  }

  /**
   * Submit answer for current question
   */
  async submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string[],
    timeSpent: number
  ) {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Unauthorized');
    if (session.status !== 'in_progress') throw new Error('Session is not active');

    // Verify question is current
    const currentQuestionId = session.questionIds[session.currentQuestionIndex];
    if (currentQuestionId !== questionId) throw new Error('Invalid question');

    const question = await Question.findByPk(questionId);
    if (!question) throw new Error('Question not found');

    // Check answer
    const isCorrect = this.checkAnswer(answer, question.correctAnswers, question.questionType);

    // Save response
    await QuizResponse.create({
      sessionId,
      questionId,
      questionNumber: session.currentQuestionIndex + 1,
      userAnswer: answer,
      isCorrect,
      timeSpent
    });

    // Update question stats
    await question.update({
      timesAnswered: question.timesAnswered + 1,
      timesCorrect: question.timesCorrect + (isCorrect ? 1 : 0)
    });

    // Update session
    const newIndex = session.currentQuestionIndex + 1;
    const isComplete = newIndex >= session.questionCount;

    await session.update({
      questionsAnswered: session.questionsAnswered + 1,
      questionsCorrect: session.questionsCorrect + (isCorrect ? 1 : 0),
      timeSpent: session.timeSpent + timeSpent,
      currentQuestionIndex: newIndex,
      ...(isComplete && {
        status: 'completed',
        completedAt: new Date()
      })
    });

    // Log activity if complete
    if (isComplete) {
      await StudyActivity.create({
        userId,
        activityType: 'quiz_completed',
        description: `Completed ${session.category} quiz with ${session.questionsCorrect + (isCorrect ? 1 : 0)}/${session.questionCount} correct`,
        metadata: {
          sessionId,
          score: session.questionsCorrect + (isCorrect ? 1 : 0),
          total: session.questionCount,
          category: session.category,
          timeSpent: session.timeSpent + timeSpent
        },
        pointsEarned: (session.questionsCorrect + (isCorrect ? 1 : 0)) * 10
      });
    }

    // Get next question if not complete
    let nextQuestion = null;
    if (!isComplete) {
      const nextQuestionId = session.questionIds[newIndex];
      const nextQ = await Question.findByPk(nextQuestionId);
      if (nextQ) nextQuestion = this.formatQuestion(nextQ);
    }

    return {
      correct: isCorrect,
      explanation: question.explanation,
      correctAnswers: question.correctAnswers,
      questionsAnswered: session.questionsAnswered + 1,
      questionsCorrect: session.questionsCorrect + (isCorrect ? 1 : 0),
      isComplete,
      nextQuestion
    };
  }

  /**
   * Complete/end a quiz session
   */
  async completeQuiz(sessionId: string, userId: string) {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Unauthorized');

    if (session.status === 'in_progress') {
      await session.update({
        status: 'completed',
        completedAt: new Date()
      });
    }

    return this.getQuizResult(sessionId, userId);
  }

  /**
   * Get quiz result
   */
  async getQuizResult(sessionId: string, userId: string) {
    const session = await QuizSession.findByPk(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.userId !== userId) throw new Error('Unauthorized');

    const responses = await QuizResponse.findAll({
      where: { sessionId },
      include: [Question],
      order: [['questionNumber', 'ASC']]
    });

    const questionDetails = responses.map(r => ({
      questionNumber: r.questionNumber,
      question: r.question.text,
      userAnswer: r.userAnswer,
      correctAnswer: r.question.correctAnswers,
      isCorrect: r.isCorrect,
      explanation: r.question.explanation,
      category: r.question.category,
      timeSpent: r.timeSpent
    }));

    return {
      sessionId: session.id,
      score: session.questionsCorrect,
      total: session.questionsAnswered,
      percentage: session.scorePercentage,
      category: session.category,
      difficulty: session.difficulty,
      timeSpent: session.timeSpent,
      completedAt: session.completedAt,
      questions: questionDetails
    };
  }

  /**
   * Get quiz history for user
   */
  async getHistory(
    userId: string,
    options: { limit?: number; category?: string } = {}
  ) {
    const { limit = 10, category } = options;

    const whereClause: any = {
      userId,
      status: { [Op.in]: ['completed', 'abandoned'] }
    };
    if (category) whereClause.category = category;

    const sessions = await QuizSession.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit
    });

    return sessions.map(s => ({
      sessionId: s.id,
      category: s.category,
      difficulty: s.difficulty,
      score: s.questionsCorrect,
      total: s.questionsAnswered,
      percentage: s.scorePercentage,
      timeSpent: s.timeSpent,
      date: s.createdAt.toISOString()
    }));
  }

  /**
   * Get available quiz categories
   */
  async getCategories() {
    const categories = await Question.findAll({
      attributes: ['category'],
      where: { isActive: true },
      group: ['category']
    });

    const categoryLabels: Record<string, string> = {
      safe_effective_care: 'Safe and Effective Care Environment',
      health_promotion: 'Health Promotion and Maintenance',
      psychosocial: 'Psychosocial Integrity',
      physiological_basic: 'Physiological Integrity: Basic Care',
      physiological_complex: 'Physiological Integrity: Complex Care'
    };

    return categories.map(c => ({
      id: c.category,
      name: categoryLabels[c.category] || c.category
    }));
  }

  /**
   * Check if answer is correct
   */
  private checkAnswer(
    userAnswer: string[],
    correctAnswers: string[],
    questionType: string
  ): boolean {
    if (questionType === 'multiple_choice') {
      return userAnswer.length === 1 && userAnswer[0] === correctAnswers[0];
    }

    if (questionType === 'select_all') {
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every(a => correctAnswers.includes(a));
    }

    if (questionType === 'ordered_response') {
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every((a, i) => a === correctAnswers[i]);
    }

    // Default
    return userAnswer.every(a => correctAnswers.includes(a)) &&
           correctAnswers.every(a => userAnswer.includes(a));
  }

  /**
   * Format question for API response
   */
  private formatQuestion(question: Question) {
    return {
      id: question.id,
      text: question.text,
      options: question.options,
      type: question.questionType,
      category: question.category,
      difficulty: question.difficulty
    };
  }
}

export const quizService = new QuizService();
export default quizService;

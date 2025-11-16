// ============================================================================
// QUIZ SESSION API SERVICE
// ============================================================================
// Manage quiz sessions, CAT sessions, and practice sessions

import { supabase } from '../lib/supabase';
import type {
  QuizSession,
  QuizSessionCreateInput,
  QuizSessionUpdateInput,
  QuizAnswer,
  QuestionUsage
} from '../lib/types';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new quiz session
 */
export const createQuizSession = async (
  input: QuizSessionCreateInput
): Promise<QuizSession> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: input.userId,
        quiz_id: input.quizId || null,
        session_type: input.sessionType,
        status: 'active',
        total_questions: input.totalQuestions,
        time_limit: input.timeLimit,
        passing_score: input.passingScore || 70,
        current_question_index: 0,
        questions_answered: 0,
        correct_answers: 0,
        question_ids: input.questionIds,
        user_answers: [],
        time_elapsed: 0,
        settings: input.settings || {}
      })
      .select()
      .single();

    if (error) throw error;

    return mapSessionFromDb(data);
  } catch (error) {
    console.error('Error creating quiz session:', error);
    throw new Error('Failed to create quiz session');
  }
};

/**
 * Create a CAT (Computer Adaptive Test) session
 */
export const createCATSession = async (
  userId: string,
  initialQuestionIds: string[],
  settings?: Record<string, any>
): Promise<QuizSession> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        quiz_id: null,
        session_type: 'cat',
        status: 'active',
        total_questions: initialQuestionIds.length,
        time_limit: null,
        passing_score: 70,
        current_question_index: 0,
        questions_answered: 0,
        correct_answers: 0,
        question_ids: initialQuestionIds,
        user_answers: [],
        time_elapsed: 0,
        ability_estimate: 0, // Start at neutral
        confidence_level: 0,
        settings: settings || {}
      })
      .select()
      .single();

    if (error) throw error;

    return mapSessionFromDb(data);
  } catch (error) {
    console.error('Error creating CAT session:', error);
    throw new Error('Failed to create CAT session');
  }
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get a quiz session by ID
 */
export const getQuizSessionById = async (id: string): Promise<QuizSession | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data ? mapSessionFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching quiz session:', error);
    return null;
  }
};

/**
 * Get all sessions for a user
 */
export const getUserSessions = async (
  userId: string,
  status?: 'active' | 'paused' | 'completed' | 'abandoned',
  sessionType?: 'quiz' | 'cat' | 'practice' | 'timed_practice',
  limit?: number
): Promise<QuizSession[]> => {
  try {
    let query = supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapSessionFromDb);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
};

/**
 * Get active session for a user
 */
export const getActiveSession = async (userId: string): Promise<QuizSession | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No active session
      throw error;
    }

    return data ? mapSessionFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching active session:', error);
    return null;
  }
};

/**
 * Get recent completed sessions
 */
export const getRecentCompletedSessions = async (
  userId: string,
  limit: number = 10
): Promise<QuizSession[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(mapSessionFromDb);
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update quiz session
 */
export const updateQuizSession = async (
  id: string,
  input: QuizSessionUpdateInput
): Promise<QuizSession | null> => {
  try {
    const updateData: any = {};

    if (input.status !== undefined) updateData.status = input.status;
    if (input.currentQuestionIndex !== undefined) updateData.current_question_index = input.currentQuestionIndex;
    if (input.questionsAnswered !== undefined) updateData.questions_answered = input.questionsAnswered;
    if (input.correctAnswers !== undefined) updateData.correct_answers = input.correctAnswers;
    if (input.userAnswers !== undefined) updateData.user_answers = input.userAnswers;
    if (input.timeElapsed !== undefined) updateData.time_elapsed = input.timeElapsed;
    if (input.abilityEstimate !== undefined) updateData.ability_estimate = input.abilityEstimate;
    if (input.confidenceLevel !== undefined) updateData.confidence_level = input.confidenceLevel;
    if (input.finalScore !== undefined) updateData.final_score = input.finalScore;
    if (input.finalPercentage !== undefined) updateData.final_percentage = input.finalPercentage;
    if (input.passed !== undefined) updateData.passed = input.passed;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;

    const { data, error } = await supabase
      .from('quiz_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? mapSessionFromDb(data) : null;
  } catch (error) {
    console.error('Error updating quiz session:', error);
    return null;
  }
};

/**
 * Submit an answer to the current question
 */
export const submitAnswer = async (
  sessionId: string,
  questionId: string,
  answer: number,
  timeSpent: number
): Promise<QuizSession | null> => {
  try {
    // Get current session
    const session = await getQuizSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    // Validate answer (you'd need to fetch the question to check correctness)
    // For now, we'll assume the client provides isCorrect
    // In production, verify on server-side

    const newAnswer: QuizAnswer = {
      questionId,
      answer,
      isCorrect: false, // Will be validated server-side
      timeSpent,
      answeredAt: new Date()
    };

    const updatedAnswers = [...session.userAnswers, newAnswer];
    const questionsAnswered = session.questionsAnswered + 1;
    const currentQuestionIndex = session.currentQuestionIndex + 1;

    // Update session
    const updateData: QuizSessionUpdateInput = {
      userAnswers: updatedAnswers,
      questionsAnswered,
      currentQuestionIndex,
      timeElapsed: session.timeElapsed + timeSpent
    };

    // Record question usage
    await recordQuestionUsage({
      questionId,
      sessionId,
      userId: session.userId,
      userAnswer: answer,
      isCorrect: newAnswer.isCorrect,
      timeSpent,
      answeredAt: new Date()
    });

    return await updateQuizSession(sessionId, updateData);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return null;
  }
};

/**
 * Complete a quiz session
 */
export const completeSession = async (sessionId: string): Promise<QuizSession | null> => {
  try {
    const session = await getQuizSessionById(sessionId);
    if (!session) throw new Error('Session not found');

    const finalScore = session.correctAnswers;
    const finalPercentage = (session.correctAnswers / session.totalQuestions) * 100;
    const passed = finalPercentage >= (session.passingScore || 70);

    const updateData: QuizSessionUpdateInput = {
      status: 'completed',
      finalScore,
      finalPercentage,
      passed,
      completedAt: new Date()
    };

    return await updateQuizSession(sessionId, updateData);
  } catch (error) {
    console.error('Error completing session:', error);
    return null;
  }
};

/**
 * Pause a quiz session
 */
export const pauseSession = async (sessionId: string): Promise<QuizSession | null> => {
  try {
    return await updateQuizSession(sessionId, { status: 'paused' });
  } catch (error) {
    console.error('Error pausing session:', error);
    return null;
  }
};

/**
 * Resume a paused session
 */
export const resumeSession = async (sessionId: string): Promise<QuizSession | null> => {
  try {
    return await updateQuizSession(sessionId, { status: 'active' });
  } catch (error) {
    console.error('Error resuming session:', error);
    return null;
  }
};

/**
 * Abandon a session
 */
export const abandonSession = async (sessionId: string): Promise<QuizSession | null> => {
  try {
    return await updateQuizSession(sessionId, { status: 'abandoned' });
  } catch (error) {
    console.error('Error abandoning session:', error);
    return null;
  }
};

/**
 * Update CAT ability estimate
 */
export const updateCATAbility = async (
  sessionId: string,
  abilityEstimate: number,
  confidenceLevel: number
): Promise<QuizSession | null> => {
  try {
    return await updateQuizSession(sessionId, {
      abilityEstimate,
      confidenceLevel
    });
  } catch (error) {
    console.error('Error updating CAT ability:', error);
    return null;
  }
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a quiz session
 */
export const deleteQuizSession = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting quiz session:', error);
    return false;
  }
};

// ============================================================================
// QUESTION USAGE TRACKING
// ============================================================================

/**
 * Record question usage
 */
const recordQuestionUsage = async (usage: Omit<QuestionUsage, 'id' | 'presentedAt'>): Promise<void> => {
  try {
    await supabase
      .from('question_usage')
      .insert({
        question_id: usage.questionId,
        session_id: usage.sessionId,
        user_id: usage.userId,
        user_answer: usage.userAnswer,
        is_correct: usage.isCorrect,
        time_spent: usage.timeSpent,
        answered_at: usage.answeredAt
      });
  } catch (error) {
    console.error('Error recording question usage:', error);
  }
};

/**
 * Get question usage for a session
 */
export const getSessionQuestionUsage = async (sessionId: string): Promise<QuestionUsage[]> => {
  try {
    const { data, error } = await supabase
      .from('question_usage')
      .select('*')
      .eq('session_id', sessionId)
      .order('presented_at', { ascending: true });

    if (error) throw error;

    return data.map((usage: any) => ({
      id: usage.id,
      questionId: usage.question_id,
      sessionId: usage.session_id,
      userId: usage.user_id,
      userAnswer: usage.user_answer,
      isCorrect: usage.is_correct,
      timeSpent: usage.time_spent,
      presentedAt: new Date(usage.presented_at),
      answeredAt: usage.answered_at ? new Date(usage.answered_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching question usage:', error);
    return [];
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get session statistics for a user
 */
export const getUserSessionStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    const sessions = data.map(mapSessionFromDb);

    return {
      totalSessions: sessions.length,
      averageScore: sessions.reduce((sum, s) => sum + (s.finalPercentage || 0), 0) / sessions.length,
      passRate: (sessions.filter(s => s.passed).length / sessions.length) * 100,
      totalTimeSpent: sessions.reduce((sum, s) => sum + s.timeElapsed, 0),
      totalQuestions: sessions.reduce((sum, s) => sum + s.totalQuestions, 0),
      sessionsByType: {
        quiz: sessions.filter(s => s.sessionType === 'quiz').length,
        cat: sessions.filter(s => s.sessionType === 'cat').length,
        practice: sessions.filter(s => s.sessionType === 'practice').length,
        timedPractice: sessions.filter(s => s.sessionType === 'timed_practice').length
      }
    };
  } catch (error) {
    console.error('Error fetching user session stats:', error);
    return null;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database session to QuizSession type
 */
const mapSessionFromDb = (data: any): QuizSession => {
  return {
    id: data.id,
    userId: data.user_id,
    quizId: data.quiz_id,
    sessionType: data.session_type,
    status: data.status,
    totalQuestions: data.total_questions,
    timeLimit: data.time_limit,
    passingScore: data.passing_score,
    currentQuestionIndex: data.current_question_index,
    questionsAnswered: data.questions_answered,
    correctAnswers: data.correct_answers,
    questionIds: data.question_ids,
    userAnswers: data.user_answers || [],
    startedAt: new Date(data.started_at),
    lastActivityAt: new Date(data.last_activity_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    timeElapsed: data.time_elapsed,
    abilityEstimate: data.ability_estimate,
    confidenceLevel: data.confidence_level,
    finalScore: data.final_score,
    finalPercentage: data.final_percentage,
    passed: data.passed,
    settings: data.settings || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const quizSessionApi = {
  // Create
  createQuizSession,
  createCATSession,

  // Read
  getQuizSessionById,
  getUserSessions,
  getActiveSession,
  getRecentCompletedSessions,

  // Update
  updateQuizSession,
  submitAnswer,
  completeSession,
  pauseSession,
  resumeSession,
  abandonSession,
  updateCATAbility,

  // Delete
  deleteQuizSession,

  // Tracking
  getSessionQuestionUsage,

  // Analytics
  getUserSessionStats
};

export default quizSessionApi;

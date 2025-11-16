// ============================================================================
// QUESTION API SERVICE
// ============================================================================
// CRUD operations for the question bank

import { supabase } from '../lib/supabase';
import type {
  Question,
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionFilters,
  QuestionStats
} from '../lib/types';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new question
 */
export const createQuestion = async (
  input: QuestionCreateInput,
  userId: string
): Promise<Question> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        question: input.question,
        options: JSON.stringify(input.options),
        correct_answer: input.correctAnswer,
        explanation: input.explanation,
        rationales: input.rationales,
        category: input.category,
        subcategory: input.subcategory,
        difficulty: input.difficulty,
        discrimination: input.discrimination,
        tags: input.tags || [],
        question_type: input.questionType || 'multiple_choice',
        created_by: userId,
        is_public: input.isPublic ?? true,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return mapQuestionFromDb(data);
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question');
  }
};

/**
 * Create multiple questions in bulk
 */
export const createQuestionsBulk = async (
  inputs: QuestionCreateInput[],
  userId: string
): Promise<Question[]> => {
  try {
    const questions = inputs.map(input => ({
      question: input.question,
      options: JSON.stringify(input.options),
      correct_answer: input.correctAnswer,
      explanation: input.explanation,
      rationales: input.rationales,
      category: input.category,
      subcategory: input.subcategory,
      difficulty: input.difficulty,
      discrimination: input.discrimination,
      tags: input.tags || [],
      question_type: input.questionType || 'multiple_choice',
      created_by: userId,
      is_public: input.isPublic ?? true,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();

    if (error) throw error;

    return data.map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error creating questions in bulk:', error);
    throw new Error('Failed to create questions in bulk');
  }
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get a question by ID
 */
export const getQuestionById = async (id: string): Promise<Question | null> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data ? mapQuestionFromDb(data) : null;
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
};

/**
 * Get multiple questions by IDs
 */
export const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    return data.map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

/**
 * Get all questions with optional filters
 */
export const getQuestions = async (
  filters?: QuestionFilters,
  limit?: number,
  offset?: number
): Promise<{ questions: Question[]; total: number }> => {
  try {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .eq('is_active', filters?.isActive ?? true);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters?.searchTerm) {
      query = query.or(`question.ilike.%${filters.searchTerm}%,explanation.ilike.%${filters.searchTerm}%`);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      questions: data.map(mapQuestionFromDb),
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { questions: [], total: 0 };
  }
};

/**
 * Get questions by category
 */
export const getQuestionsByCategory = async (
  category: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  limit?: number
): Promise<Question[]> => {
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    return [];
  }
};

/**
 * Get random questions based on criteria
 */
export const getRandomQuestions = async (
  count: number,
  category?: string,
  difficulty?: 'easy' | 'medium' | 'hard',
  excludeIds?: string[]
): Promise<Question[]> => {
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (excludeIds && excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Shuffle and take random questions
    const shuffled = data.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    return [];
  }
};

/**
 * Get questions for CAT (Computer Adaptive Testing)
 * Based on ability estimate and discrimination parameters
 */
export const getCATQuestions = async (
  abilityEstimate: number,
  count: number,
  category?: string,
  excludeIds?: string[]
): Promise<Question[]> => {
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .not('discrimination', 'is', null);

    if (category) {
      query = query.eq('category', category);
    }
    if (excludeIds && excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Sort questions by how well they match the ability estimate
    // Questions closest to ability level are most informative
    const sortedByAbility = data.sort((a, b) => {
      const difficultyScore = { easy: -1, medium: 0, hard: 1 };
      const aDiff = Math.abs(difficultyScore[a.difficulty as keyof typeof difficultyScore] - abilityEstimate);
      const bDiff = Math.abs(difficultyScore[b.difficulty as keyof typeof difficultyScore] - abilityEstimate);
      return aDiff - bDiff;
    });

    return sortedByAbility.slice(0, count).map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error fetching CAT questions:', error);
    return [];
  }
};

/**
 * Get all unique categories
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = [...new Set(data.map(q => q.category))];
    return categories.sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update a question
 */
export const updateQuestion = async (
  id: string,
  input: QuestionUpdateInput
): Promise<Question | null> => {
  try {
    const updateData: any = {};

    if (input.question !== undefined) updateData.question = input.question;
    if (input.options !== undefined) updateData.options = JSON.stringify(input.options);
    if (input.correctAnswer !== undefined) updateData.correct_answer = input.correctAnswer;
    if (input.explanation !== undefined) updateData.explanation = input.explanation;
    if (input.rationales !== undefined) updateData.rationales = input.rationales;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.subcategory !== undefined) updateData.subcategory = input.subcategory;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.discrimination !== undefined) updateData.discrimination = input.discrimination;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.questionType !== undefined) updateData.question_type = input.questionType;
    if (input.isPublic !== undefined) updateData.is_public = input.isPublic;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data ? mapQuestionFromDb(data) : null;
  } catch (error) {
    console.error('Error updating question:', error);
    return null;
  }
};

/**
 * Soft delete a question (mark as inactive)
 */
export const deactivateQuestion = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deactivating question:', error);
    return false;
  }
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Permanently delete a question
 */
export const deleteQuestion = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    return false;
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get question statistics
 */
export const getQuestionStats = async (questionId: string): Promise<QuestionStats | null> => {
  try {
    const { data, error } = await supabase
      .from('question_stats')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching question stats:', error);
    return null;
  }
};

/**
 * Get questions with low success rates (for review)
 */
export const getDifficultQuestions = async (
  category?: string,
  limit: number = 20
): Promise<Question[]> => {
  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .not('success_rate', 'is', null)
      .lte('success_rate', 50)
      .order('success_rate', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return data.map(mapQuestionFromDb);
  } catch (error) {
    console.error('Error fetching difficult questions:', error);
    return [];
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map database question to Question type
 */
const mapQuestionFromDb = (data: any): Question => {
  return {
    id: data.id,
    question: data.question,
    options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
    correctAnswer: data.correct_answer,
    explanation: data.explanation,
    rationales: data.rationales,
    category: data.category,
    subcategory: data.subcategory,
    difficulty: data.difficulty,
    discrimination: data.discrimination,
    tags: data.tags,
    questionType: data.question_type,
    createdBy: data.created_by,
    isPublic: data.is_public,
    isActive: data.is_active,
    usageCount: data.usage_count,
    successRate: data.success_rate,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const questionApi = {
  // Create
  createQuestion,
  createQuestionsBulk,

  // Read
  getQuestionById,
  getQuestionsByIds,
  getQuestions,
  getQuestionsByCategory,
  getRandomQuestions,
  getCATQuestions,
  getCategories,

  // Update
  updateQuestion,
  deactivateQuestion,

  // Delete
  deleteQuestion,

  // Analytics
  getQuestionStats,
  getDifficultQuestions
};

export default questionApi;

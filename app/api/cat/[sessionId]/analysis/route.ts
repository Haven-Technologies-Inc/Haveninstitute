import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { probability3PL, passingProbability } from '@/lib/irt';

/**
 * AI-Powered CAT Session Analysis
 * Provides deep insights, performance prediction, and personalized recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await requireAuth();
    const { sessionId } = await params;

    // Get the completed CAT session with full response data
    const catSession = await prisma.cATSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
      include: {
        responses: {
          orderBy: { questionNumber: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                difficulty: true,
                explanation: true,
                rationale: true,
                subject: true,
                discipline: true,
                category: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
    });

    if (!catSession) {
      return errorResponse('CAT session not found', 404);
    }

    // Get user's historical performance
    const allSessions = await prisma.cATSession.findMany({
      where: {
        userId: session.user.id,
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        currentAbility: true,
        passingProbability: true,
        questionsAnswered: true,
        questionsCorrect: true,
        categoryPerformance: true,
        completedAt: true,
        result: true,
      },
    });

    // --- PERFORMANCE ANALYSIS ---

    // 1. Category breakdown with accuracy
    const categoryPerf = catSession.categoryPerformance as Record<string, { correct: number; total: number }> || {};
    const categories = await prisma.nCLEXCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });
    const categoryMap = new Map(categories.map(c => [String(c.id), c]));

    const categoryAnalysis = Object.entries(categoryPerf).map(([catId, perf]) => {
      const cat = categoryMap.get(catId);
      const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
      let proficiency: 'mastered' | 'proficient' | 'developing' | 'needs_improvement';
      if (accuracy >= 85) proficiency = 'mastered';
      else if (accuracy >= 70) proficiency = 'proficient';
      else if (accuracy >= 50) proficiency = 'developing';
      else proficiency = 'needs_improvement';

      return {
        categoryId: catId,
        categoryName: cat?.name || 'Unknown',
        categoryCode: cat?.code || '',
        correct: perf.correct,
        total: perf.total,
        accuracy: Math.round(accuracy),
        proficiency,
      };
    });

    // 2. Difficulty progression analysis
    const responses = catSession.responses;
    const difficultyProgression = responses.map((r, i) => ({
      questionNumber: i + 1,
      difficulty: Number(r.irtDifficulty),
      isCorrect: r.isCorrect ?? false,
      abilityAfter: Number(r.abilityAfter),
      category: r.question.category?.name || '',
    }));

    // 3. Question type performance
    const typePerf: Record<string, { correct: number; total: number }> = {};
    for (const r of responses) {
      const t = r.question.questionType;
      if (!typePerf[t]) typePerf[t] = { correct: 0, total: 0 };
      typePerf[t].total++;
      if (r.isCorrect) typePerf[t].correct++;
    }
    const questionTypeAnalysis = Object.entries(typePerf).map(([type, perf]) => ({
      type,
      correct: perf.correct,
      total: perf.total,
      accuracy: perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0,
    }));

    // 4. Time analysis
    const timePerQuestion = responses.map(r => r.timeSpentSeconds ?? 0);
    const avgTime = timePerQuestion.length > 0
      ? Math.round(timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length)
      : 0;
    const fastestTime = Math.min(...timePerQuestion.filter(t => t > 0));
    const slowestTime = Math.max(...timePerQuestion);

    // Identify questions where they spent too long (>90s) and got wrong
    const timeStruggles = responses
      .filter(r => (r.timeSpentSeconds ?? 0) > 90 && !r.isCorrect)
      .map(r => ({
        questionNumber: r.questionNumber,
        category: r.question.category?.name || '',
        timeSpent: r.timeSpentSeconds,
      }));

    // 5. Ability trend from historical sessions
    const abilityTrend = allSessions
      .filter(s => s.completedAt)
      .reverse()
      .map(s => ({
        date: s.completedAt?.toISOString(),
        ability: Number(s.currentAbility),
        passingProbability: Number(s.passingProbability) * 100,
        accuracy: s.questionsAnswered > 0
          ? Math.round((s.questionsCorrect / s.questionsAnswered) * 100)
          : 0,
      }));

    // 6. NCLEX Readiness Score (0-100)
    const ability = Number(catSession.currentAbility);
    const se = Number(catSession.standardError);
    const passProb = Number(catSession.passingProbability);

    // Composite readiness score based on multiple factors
    const accuracyScore = catSession.questionsAnswered > 0
      ? (catSession.questionsCorrect / catSession.questionsAnswered) * 100
      : 0;
    const consistencyScore = calculateConsistencyScore(responses);
    const difficultyScore = calculateDifficultyScore(difficultyProgression);

    const readinessScore = Math.round(
      passProb * 40 +
      (accuracyScore / 100) * 25 +
      (consistencyScore / 100) * 20 +
      (difficultyScore / 100) * 15
    );

    let readinessLevel: string;
    let readinessMessage: string;
    if (readinessScore >= 85) {
      readinessLevel = 'exam_ready';
      readinessMessage = 'You are performing at a level that strongly predicts NCLEX success. Consider scheduling your exam soon.';
    } else if (readinessScore >= 70) {
      readinessLevel = 'nearly_ready';
      readinessMessage = 'You are close to exam readiness. Focus on your weak areas to push your score higher.';
    } else if (readinessScore >= 55) {
      readinessLevel = 'developing';
      readinessMessage = 'You are making progress but need more preparation. Target your low-scoring categories.';
    } else {
      readinessLevel = 'needs_preparation';
      readinessMessage = 'Continue building your knowledge base. Focus on understanding core concepts before attempting the exam.';
    }

    // 7. AI-generated improvement recommendations
    const weakCategories = categoryAnalysis
      .filter(c => c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);

    const strongCategories = categoryAnalysis
      .filter(c => c.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy);

    const recommendations = generateRecommendations(
      weakCategories,
      strongCategories,
      questionTypeAnalysis,
      avgTime,
      readinessScore,
      ability,
      difficultyProgression
    );

    // 8. Subject and discipline breakdown
    const subjectPerf: Record<string, { correct: number; total: number }> = {};
    for (const r of responses) {
      const subject = r.question.subject || 'General';
      if (!subjectPerf[subject]) subjectPerf[subject] = { correct: 0, total: 0 };
      subjectPerf[subject].total++;
      if (r.isCorrect) subjectPerf[subject].correct++;
    }

    // 9. Predicted NCLEX performance
    const predictedPerformance = {
      passingProbability: Math.round(passProb * 100),
      confidenceInterval: {
        lower: Math.round(Math.max(0, (passProb - 1.96 * se * 0.3)) * 100),
        upper: Math.round(Math.min(100, (passProb + 1.96 * se * 0.3)) * 100),
      },
      estimatedQuestionsOnRealExam: estimateNCLEXQuestions(ability, se),
      predictedResult: passProb >= 0.5 ? 'PASS' : 'FAIL',
      confidence: se < 0.3 ? 'high' : se < 0.5 ? 'moderate' : 'low',
    };

    return successResponse({
      sessionId: catSession.id,
      overallResult: catSession.result,
      totalQuestions: catSession.questionsAnswered,
      totalCorrect: catSession.questionsCorrect,
      accuracy: accuracyScore,
      ability,
      standardError: se,

      readiness: {
        score: readinessScore,
        level: readinessLevel,
        message: readinessMessage,
      },

      predictedPerformance,

      categoryAnalysis,
      questionTypeAnalysis,
      difficultyProgression,

      timeAnalysis: {
        averagePerQuestion: avgTime,
        fastest: fastestTime,
        slowest: slowestTime,
        totalTime: catSession.timeSpentSeconds,
        timeStruggles,
      },

      subjectBreakdown: Object.entries(subjectPerf).map(([subject, perf]) => ({
        subject,
        correct: perf.correct,
        total: perf.total,
        accuracy: perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0,
      })),

      abilityTrend,
      recommendations,
      historicalSessionCount: allSessions.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// --- Helper Functions ---

function calculateConsistencyScore(
  responses: Array<{ isCorrect: boolean | null; abilityAfter: any }>
): number {
  if (responses.length < 5) return 50;

  // Check for stable performance in the last half of the test
  const lastHalf = responses.slice(Math.floor(responses.length / 2));
  const correctInLastHalf = lastHalf.filter(r => r.isCorrect).length;
  const accuracyLastHalf = correctInLastHalf / lastHalf.length;

  // Check for ability stabilization
  const lastAbilities = lastHalf.map(r => Number(r.abilityAfter));
  const abilityVariance = calculateVariance(lastAbilities);
  const stabilityBonus = Math.max(0, 100 - abilityVariance * 200);

  return Math.round(accuracyLastHalf * 60 + stabilityBonus * 0.4);
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

function calculateDifficultyScore(
  progression: Array<{ difficulty: number; isCorrect: boolean }>
): number {
  if (progression.length === 0) return 50;

  // Higher score for correctly answering harder questions
  let score = 0;
  for (const p of progression) {
    if (p.isCorrect) {
      // Bonus for getting harder questions right
      score += 50 + p.difficulty * 30;
    } else {
      score += Math.max(0, 30 - p.difficulty * 10);
    }
  }
  return Math.min(100, Math.round(score / progression.length));
}

function estimateNCLEXQuestions(ability: number, se: number): { min: number; max: number } {
  // NCLEX range is 75-145 (RN) or 85-205 (PN)
  // Higher ability + low SE = fewer questions (confident pass)
  // Lower ability + low SE = fewer questions (confident fail)
  // High SE = more questions needed

  if (se < 0.25) {
    // High confidence - test would end early
    return ability > 0 ? { min: 75, max: 90 } : { min: 75, max: 85 };
  } else if (se < 0.4) {
    return { min: 85, max: 115 };
  } else {
    return { min: 100, max: 145 };
  }
}

function generateRecommendations(
  weakCategories: Array<{ categoryName: string; accuracy: number; total: number }>,
  strongCategories: Array<{ categoryName: string; accuracy: number }>,
  questionTypes: Array<{ type: string; accuracy: number }>,
  avgTime: number,
  readinessScore: number,
  ability: number,
  difficultyProgression: Array<{ difficulty: number; isCorrect: boolean }>
): Array<{ priority: 'high' | 'medium' | 'low'; category: string; title: string; description: string }> {
  const recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
  }> = [];

  // Weak category recommendations (HIGH priority)
  for (const cat of weakCategories.slice(0, 3)) {
    recommendations.push({
      priority: 'high',
      category: 'content',
      title: `Strengthen ${cat.categoryName}`,
      description: `Your accuracy in ${cat.categoryName} is ${cat.accuracy}% (${cat.total} questions). Focus on reviewing core concepts, practicing NCLEX-style questions in this area, and using the AI Tutor for personalized explanations.`,
    });
  }

  // Question type weaknesses
  const weakTypes = questionTypes.filter(t => t.accuracy < 60);
  for (const t of weakTypes) {
    const typeNames: Record<string, string> = {
      multiple_choice: 'Multiple Choice',
      multiple_response: 'Select All That Apply (SATA)',
      ordered_response: 'Ordered Response (Drag & Drop)',
      fill_blank: 'Fill in the Blank',
      hot_spot: 'Hot Spot',
      bow_tie: 'Bow-Tie',
      case_study: 'Case Study',
      cloze_dropdown: 'Cloze/Drop-Down',
      matrix: 'Matrix/Grid',
      highlight: 'Highlight Text',
    };
    recommendations.push({
      priority: 'high',
      category: 'question_type',
      title: `Practice ${typeNames[t.type] || t.type} Questions`,
      description: `You scored ${t.accuracy}% on ${typeNames[t.type] || t.type} questions. These are critical NextGen NCLEX formats. Use the practice quiz mode filtered by this question type.`,
    });
  }

  // Time management
  if (avgTime > 90) {
    recommendations.push({
      priority: 'medium',
      category: 'strategy',
      title: 'Improve Time Management',
      description: `Your average response time is ${avgTime}s per question. On the NCLEX, aim for 60-75 seconds per standard question. Practice with timed quizzes to build speed while maintaining accuracy.`,
    });
  }

  // Difficulty adaptation
  const lastQuarter = difficultyProgression.slice(-Math.ceil(difficultyProgression.length / 4));
  const avgLastDifficulty = lastQuarter.reduce((s, p) => s + p.difficulty, 0) / Math.max(lastQuarter.length, 1);
  if (avgLastDifficulty < -0.3) {
    recommendations.push({
      priority: 'medium',
      category: 'difficulty',
      title: 'Challenge Yourself with Harder Questions',
      description: 'The algorithm is serving you easier questions. Build up your knowledge base in weak areas, then attempt harder difficulty levels to raise your ability estimate.',
    });
  }

  // Study strategy based on readiness
  if (readinessScore < 55) {
    recommendations.push({
      priority: 'high',
      category: 'strategy',
      title: 'Build a Structured Study Plan',
      description: 'Create a comprehensive study plan using the Study Planner. Focus on 2-3 categories per week, review rationales thoroughly, and take full-length CAT simulations weekly to track progress.',
    });
  } else if (readinessScore < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'strategy',
      title: 'Focus on High-Weight Categories',
      description: 'Prioritize Management of Care (17-23%) and Pharmacological Therapies (12-18%) as they carry the most weight on the NCLEX. These areas have the biggest impact on your score.',
    });
  }

  // Celebrate strengths
  if (strongCategories.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'strength',
      title: `Maintain Strength in ${strongCategories[0].categoryName}`,
      description: `Great job! You scored ${strongCategories[0].accuracy}% in ${strongCategories[0].categoryName}. Keep reviewing this area periodically to maintain your proficiency.`,
    });
  }

  // Spaced repetition recommendation
  recommendations.push({
    priority: 'medium',
    category: 'study_method',
    title: 'Use Flashcards for Weak Areas',
    description: 'Create or study flashcard decks focused on your lowest-scoring categories. Spaced repetition is proven to improve long-term retention of critical nursing concepts.',
  });

  return recommendations.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    return pOrder[a.priority] - pOrder[b.priority];
  });
}

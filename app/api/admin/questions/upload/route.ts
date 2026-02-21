import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

interface QuestionImport {
  questionText: string;
  questionType?: string;
  categoryCode: string;
  difficulty?: string;
  subject?: string;
  discipline?: string;
  nclexVersion?: string;
  options?: any;
  correctAnswers?: any;
  correctOrder?: any;
  hotSpotData?: any;
  explanation?: string;
  rationale?: string;
  references?: string;
  tags?: string[];
  bloomLevel?: string;
  clinicalPearl?: string;
  scenario?: string;
  sourceReference?: string;
  discrimination?: number;
  difficultyIrt?: number;
  guessing?: number;
}

// All NextGen NCLEX question types
const VALID_QUESTION_TYPES = [
  'multiple_choice', 'multiple_response', 'fill_blank', 'ordered_response',
  'hot_spot', 'select_all', 'cloze_dropdown', 'matrix', 'highlight',
  'bow_tie', 'case_study',
];

// Standard NCLEX subjects
const VALID_SUBJECTS = [
  'Adult Health', 'Pediatrics', 'Maternity', 'Mental Health',
  'Community Health', 'Leadership/Management', 'Pharmacology',
  'Fundamentals', 'Critical Care', 'Emergency', 'Gerontology',
  'Perioperative', 'Oncology', 'Endocrine', 'Cardiovascular',
  'Respiratory', 'Neurology', 'Gastrointestinal', 'Renal/Urinary',
  'Musculoskeletal', 'Integumentary', 'Immunology', 'Hematology',
  'Nutrition', 'Fluid & Electrolytes', 'Infection Control',
];

// Standard NCLEX disciplines
const VALID_DISCIPLINES = [
  'Nursing Process', 'Clinical Judgment', 'Patient Safety',
  'Evidence-Based Practice', 'Quality Improvement', 'Informatics',
  'Interprofessional Collaboration', 'Ethical/Legal',
  'Cultural Competency', 'Health Promotion', 'Disease Prevention',
  'Pathophysiology', 'Pharmacokinetics', 'Delegation',
];

const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];
const VALID_BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

const IRT_DIFF_MAP: Record<string, number> = {
  easy: -1.0,
  medium: 0.0,
  hard: 1.0,
};

// Bulk upload questions - supports up to 500 at a time with batch processing
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { questions, format } = body;

    if (!questions || !Array.isArray(questions)) {
      return errorResponse('Questions array is required');
    }

    if (questions.length > 500) {
      return errorResponse('Maximum 500 questions per upload');
    }

    // Get category map for fast lookups
    const categories = await prisma.nCLEXCategory.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
    });
    const categoryMap = new Map<string, string>();
    for (const c of categories) {
      categoryMap.set(c.code.toUpperCase(), c.id);
      categoryMap.set(c.name.toUpperCase(), c.id);
    }

    const results = {
      total: questions.length,
      created: 0,
      errors: [] as { index: number; error: string }[],
    };

    // Validate all questions first, then batch insert valid ones
    const validQuestions: Array<{
      index: number;
      data: any;
    }> = [];

    for (let i = 0; i < questions.length; i++) {
      const q: QuestionImport = questions[i];

      // Validate required fields
      if (!q.questionText?.trim()) {
        results.errors.push({ index: i, error: 'Missing questionText' });
        continue;
      }

      // Resolve category
      const catLookup = (q.categoryCode || '').toUpperCase();
      const categoryId = categoryMap.get(catLookup);
      if (!categoryId) {
        results.errors.push({ index: i, error: `Unknown category: ${q.categoryCode}` });
        continue;
      }

      // Validate question type
      const qType = q.questionType || 'multiple_choice';
      if (!VALID_QUESTION_TYPES.includes(qType)) {
        results.errors.push({ index: i, error: `Invalid questionType: ${qType}. Valid: ${VALID_QUESTION_TYPES.join(', ')}` });
        continue;
      }

      // Validate options based on type
      if (['multiple_choice', 'multiple_response', 'select_all'].includes(qType)) {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          results.errors.push({ index: i, error: 'Multiple choice/select all needs at least 2 options' });
          continue;
        }
      }

      if (qType === 'ordered_response' && (!q.correctOrder || !Array.isArray(q.correctOrder))) {
        results.errors.push({ index: i, error: 'Ordered response requires correctOrder array' });
        continue;
      }

      if (qType === 'fill_blank' && !q.correctAnswers) {
        results.errors.push({ index: i, error: 'Fill in the blank requires correctAnswers' });
        continue;
      }

      if (qType === 'hot_spot' && !q.hotSpotData) {
        results.errors.push({ index: i, error: 'Hot spot requires hotSpotData' });
        continue;
      }

      if (qType === 'bow_tie') {
        if (!q.options || typeof q.options !== 'object') {
          results.errors.push({ index: i, error: 'Bow-tie requires structured options (causes, interventions, effects)' });
          continue;
        }
      }

      if (qType === 'matrix') {
        if (!q.options || typeof q.options !== 'object') {
          results.errors.push({ index: i, error: 'Matrix requires structured options (rows and columns)' });
          continue;
        }
      }

      if (!q.correctAnswers && !q.correctOrder && qType !== 'hot_spot') {
        results.errors.push({ index: i, error: 'Missing correctAnswers or correctOrder' });
        continue;
      }

      // Validate difficulty
      const difficulty = (q.difficulty || 'medium').toLowerCase();
      if (!VALID_DIFFICULTY.includes(difficulty)) {
        results.errors.push({ index: i, error: `Invalid difficulty: ${q.difficulty}. Valid: ${VALID_DIFFICULTY.join(', ')}` });
        continue;
      }

      // Validate bloom level if provided
      if (q.bloomLevel && !VALID_BLOOM_LEVELS.includes(q.bloomLevel.toLowerCase())) {
        results.errors.push({ index: i, error: `Invalid bloomLevel: ${q.bloomLevel}. Valid: ${VALID_BLOOM_LEVELS.join(', ')}` });
        continue;
      }

      const defaultIrtDiff = IRT_DIFF_MAP[difficulty] ?? 0.0;

      validQuestions.push({
        index: i,
        data: {
          questionText: q.questionText.trim(),
          questionType: qType as any,
          categoryId,
          difficulty: difficulty as any,
          subject: q.subject || null,
          discipline: q.discipline || null,
          nclexVersion: q.nclexVersion || 'NGN',
          options: q.options ?? undefined,
          correctAnswers: q.correctAnswers ?? undefined,
          correctOrder: q.correctOrder ?? undefined,
          hotSpotData: q.hotSpotData ?? undefined,
          explanation: q.explanation || null,
          rationale: q.rationale || null,
          references: q.references || null,
          tags: q.tags ?? undefined,
          bloomLevel: q.bloomLevel ? (q.bloomLevel.toLowerCase() as any) : null,
          clinicalPearl: q.clinicalPearl || null,
          scenario: q.scenario || null,
          sourceReference: q.sourceReference || null,
          discrimination: q.discrimination ?? 1.0,
          difficultyIrt: q.difficultyIrt ?? defaultIrtDiff,
          guessing: q.guessing ?? (qType === 'multiple_choice' ? 0.25 : 0.0),
          createdBy: session.user.id,
          isActive: true,
          isVerified: false,
        },
      });
    }

    // Batch insert in chunks of 50 using transactions for performance
    const BATCH_SIZE = 50;
    for (let batchStart = 0; batchStart < validQuestions.length; batchStart += BATCH_SIZE) {
      const batch = validQuestions.slice(batchStart, batchStart + BATCH_SIZE);

      try {
        await prisma.$transaction(
          batch.map((q) =>
            prisma.question.create({ data: q.data })
          )
        );
        results.created += batch.length;
      } catch (batchErr: any) {
        // If batch fails, try individual inserts to identify specific failures
        for (const q of batch) {
          try {
            await prisma.question.create({ data: q.data });
            results.created++;
          } catch (err: any) {
            results.errors.push({ index: q.index, error: err.message || 'Database error' });
          }
        }
      }
    }

    return successResponse(results, results.errors.length > 0 ? 207 : 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET endpoint to return valid question types, subjects, disciplines for the upload form
export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.nCLEXCategory.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true, parentId: true },
      orderBy: { displayOrder: 'asc' },
    });

    return successResponse({
      questionTypes: VALID_QUESTION_TYPES.map(t => ({
        value: t,
        label: t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      })),
      subjects: VALID_SUBJECTS,
      disciplines: VALID_DISCIPLINES,
      difficultyLevels: VALID_DIFFICULTY.map(d => ({
        value: d,
        label: d.charAt(0).toUpperCase() + d.slice(1),
      })),
      bloomLevels: VALID_BLOOM_LEVELS.map(b => ({
        value: b,
        label: b.charAt(0).toUpperCase() + b.slice(1),
      })),
      categories: categories.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        parentId: c.parentId,
      })),
      nclexVersions: [
        { value: 'NGN', label: 'Next Generation NCLEX (NGN)' },
        { value: 'Classic', label: 'Classic NCLEX' },
        { value: 'Both', label: 'Both Formats' },
      ],
      maxBatchSize: 500,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

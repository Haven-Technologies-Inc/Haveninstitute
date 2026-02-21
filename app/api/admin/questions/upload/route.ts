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

// Standard NCLEX subjects and disciplines for validation
const VALID_SUBJECTS = [
  'Adult Health', 'Pediatrics', 'Maternity', 'Mental Health',
  'Community Health', 'Leadership/Management', 'Pharmacology',
  'Fundamentals', 'Critical Care', 'Emergency', 'Gerontology',
  'Perioperative', 'Oncology', 'Endocrine', 'Cardiovascular',
  'Respiratory', 'Neurology', 'Gastrointestinal', 'Renal/Urinary',
  'Musculoskeletal', 'Integumentary', 'Immunology', 'Hematology',
  'Nutrition', 'Fluid & Electrolytes', 'Infection Control',
];

const VALID_DISCIPLINES = [
  'Nursing Process', 'Clinical Judgment', 'Patient Safety',
  'Evidence-Based Practice', 'Quality Improvement', 'Informatics',
  'Interprofessional Collaboration', 'Ethical/Legal',
  'Cultural Competency', 'Health Promotion', 'Disease Prevention',
  'Pathophysiology', 'Pharmacokinetics', 'Delegation',
];

// Bulk upload questions
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

    // Get category map
    const categories = await prisma.nCLEXCategory.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
    });
    const categoryMap = new Map(categories.map(c => [c.code.toUpperCase(), c.id]));
    // Also map by name for flexibility
    for (const c of categories) {
      categoryMap.set(c.name.toUpperCase(), c.id);
    }

    const results = {
      total: questions.length,
      created: 0,
      errors: [] as { index: number; error: string }[],
    };

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
      const validTypes = [
        'multiple_choice', 'multiple_response', 'fill_blank', 'ordered_response',
        'hot_spot', 'select_all', 'cloze_dropdown', 'matrix', 'highlight',
        'bow_tie', 'case_study',
      ];
      const qType = q.questionType || 'multiple_choice';
      if (!validTypes.includes(qType)) {
        results.errors.push({ index: i, error: `Invalid questionType: ${qType}` });
        continue;
      }

      // Validate options based on type
      if (['multiple_choice', 'multiple_response', 'select_all'].includes(qType)) {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          results.errors.push({ index: i, error: 'Multiple choice needs at least 2 options' });
          continue;
        }
      }

      if (!q.correctAnswers && !q.correctOrder && qType !== 'hot_spot') {
        results.errors.push({ index: i, error: 'Missing correctAnswers or correctOrder' });
        continue;
      }

      // Validate subject if provided
      if (q.subject && !VALID_SUBJECTS.includes(q.subject)) {
        // Allow custom subjects, just normalize
      }

      // Calculate IRT difficulty from difficulty level if not provided
      const irtDiffMap: Record<string, number> = {
        easy: -1.0,
        medium: 0.0,
        hard: 1.0,
      };
      const defaultIrtDiff = irtDiffMap[(q.difficulty || 'medium').toLowerCase()] ?? 0.0;

      try {
        await prisma.question.create({
          data: {
            questionText: q.questionText.trim(),
            questionType: qType as any,
            categoryId,
            difficulty: (q.difficulty as any) || 'medium',
            subject: q.subject ?? null,
            discipline: q.discipline ?? null,
            nclexVersion: q.nclexVersion ?? 'NGN',
            options: q.options ?? null,
            correctAnswers: q.correctAnswers ?? null,
            correctOrder: q.correctOrder ?? null,
            hotSpotData: q.hotSpotData ?? null,
            explanation: q.explanation ?? null,
            rationale: q.rationale ?? null,
            references: q.references ?? null,
            tags: q.tags ?? null,
            bloomLevel: q.bloomLevel as any ?? null,
            clinicalPearl: q.clinicalPearl ?? null,
            scenario: q.scenario ?? null,
            sourceReference: q.sourceReference ?? null,
            discrimination: q.discrimination ?? 1.0,
            difficultyIrt: q.difficultyIrt ?? defaultIrtDiff,
            guessing: q.guessing ?? (qType === 'multiple_choice' ? 0.25 : 0.0),
            createdBy: session.user.id,
            isActive: true,
            isVerified: false,
          },
        });
        results.created++;
      } catch (err: any) {
        results.errors.push({ index: i, error: err.message || 'Database error' });
      }
    }

    return successResponse(results, results.errors.length > 0 ? 207 : 201);
  } catch (error) {
    return handleApiError(error);
  }
}

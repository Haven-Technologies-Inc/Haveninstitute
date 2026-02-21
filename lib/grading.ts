/**
 * Answer grading engine for all NextGen NCLEX question types
 */

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'select_all'
  | 'fill_blank'
  | 'ordered_response'
  | 'hot_spot'
  | 'cloze_dropdown'
  | 'matrix'
  | 'highlight'
  | 'bow_tie'
  | 'case_study';

export interface GradingResult {
  isCorrect: boolean;
  score: number;      // 0-1 partial credit
  feedback?: string;
}

export function gradeAnswer(
  questionType: QuestionType,
  userAnswer: any,
  correctAnswers: any,
  correctOrder?: any,
  hotSpotData?: any
): GradingResult {
  switch (questionType) {
    case 'multiple_choice':
      return gradeMultipleChoice(userAnswer, correctAnswers);
    case 'multiple_response':
    case 'select_all':
      return gradeMultipleResponse(userAnswer, correctAnswers);
    case 'fill_blank':
      return gradeFillBlank(userAnswer, correctAnswers);
    case 'ordered_response':
      return gradeOrderedResponse(userAnswer, correctOrder || correctAnswers);
    case 'hot_spot':
      return gradeHotSpot(userAnswer, hotSpotData);
    case 'cloze_dropdown':
      return gradeClozeDropdown(userAnswer, correctAnswers);
    case 'matrix':
      return gradeMatrix(userAnswer, correctAnswers);
    case 'highlight':
      return gradeHighlight(userAnswer, correctAnswers);
    case 'bow_tie':
      return gradeBowTie(userAnswer, correctAnswers);
    case 'case_study':
      return gradeCaseStudy(userAnswer, correctAnswers);
    default:
      return { isCorrect: false, score: 0 };
  }
}

function gradeMultipleChoice(userAnswer: string, correctAnswers: any): GradingResult {
  const correct = Array.isArray(correctAnswers) ? correctAnswers[0] : correctAnswers;
  const isCorrect = userAnswer === correct;
  return { isCorrect, score: isCorrect ? 1 : 0 };
}

function gradeMultipleResponse(userAnswer: string[], correctAnswers: string[]): GradingResult {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswers)) {
    return { isCorrect: false, score: 0 };
  }

  const userSet = new Set(userAnswer);
  const correctSet = new Set(correctAnswers);

  // NCLEX SATA: all-or-nothing scoring (must select ALL correct and NONE incorrect)
  const allCorrectSelected = correctAnswers.every(a => userSet.has(a));
  const noIncorrectSelected = userAnswer.every(a => correctSet.has(a));
  const isCorrect = allCorrectSelected && noIncorrectSelected;

  // Partial credit: proportion of correct selections minus incorrect
  const correctHits = userAnswer.filter(a => correctSet.has(a)).length;
  const incorrectHits = userAnswer.filter(a => !correctSet.has(a)).length;
  const score = Math.max(0, (correctHits - incorrectHits) / correctAnswers.length);

  return { isCorrect, score: isCorrect ? 1 : score };
}

function gradeFillBlank(userAnswer: string, correctAnswers: any): GradingResult {
  const acceptable = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  const normalized = (userAnswer || '').trim().toLowerCase();
  const isCorrect = acceptable.some(
    (a: string) => normalized === (a || '').trim().toLowerCase()
  );
  return { isCorrect, score: isCorrect ? 1 : 0 };
}

function gradeOrderedResponse(userAnswer: string[], correctOrder: string[]): GradingResult {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctOrder)) {
    return { isCorrect: false, score: 0 };
  }

  if (userAnswer.length !== correctOrder.length) {
    return { isCorrect: false, score: 0 };
  }

  let correctPositions = 0;
  for (let i = 0; i < userAnswer.length; i++) {
    if (userAnswer[i] === correctOrder[i]) correctPositions++;
  }

  const isCorrect = correctPositions === correctOrder.length;
  return { isCorrect, score: correctPositions / correctOrder.length };
}

function gradeHotSpot(
  userAnswer: { x: number; y: number },
  hotSpotData: { regions: { x: number; y: number; width: number; height: number }[] }
): GradingResult {
  if (!userAnswer || !hotSpotData?.regions) {
    return { isCorrect: false, score: 0 };
  }

  const isCorrect = hotSpotData.regions.some(
    (region: { x: number; y: number; width: number; height: number }) =>
      userAnswer.x >= region.x &&
      userAnswer.x <= region.x + region.width &&
      userAnswer.y >= region.y &&
      userAnswer.y <= region.y + region.height
  );

  return { isCorrect, score: isCorrect ? 1 : 0 };
}

function gradeClozeDropdown(
  userAnswer: Record<string, string>,
  correctAnswers: Record<string, string>
): GradingResult {
  if (!userAnswer || !correctAnswers) {
    return { isCorrect: false, score: 0 };
  }

  const keys = Object.keys(correctAnswers);
  let correct = 0;
  for (const key of keys) {
    if (userAnswer[key] === correctAnswers[key]) correct++;
  }

  const isCorrect = correct === keys.length;
  return { isCorrect, score: keys.length > 0 ? correct / keys.length : 0 };
}

function gradeMatrix(
  userAnswer: Record<string, string>,
  correctAnswers: Record<string, string>
): GradingResult {
  if (!userAnswer || !correctAnswers) {
    return { isCorrect: false, score: 0 };
  }

  const keys = Object.keys(correctAnswers);
  let correct = 0;
  for (const key of keys) {
    if (userAnswer[key] === correctAnswers[key]) correct++;
  }

  const isCorrect = correct === keys.length;
  return { isCorrect, score: keys.length > 0 ? correct / keys.length : 0 };
}

function gradeHighlight(userAnswer: string[], correctAnswers: string[]): GradingResult {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswers)) {
    return { isCorrect: false, score: 0 };
  }

  const userSet = new Set(userAnswer.map(s => s.trim().toLowerCase()));
  const correctSet = new Set(correctAnswers.map(s => s.trim().toLowerCase()));

  const hits = [...userSet].filter(s => correctSet.has(s)).length;
  const misses = [...userSet].filter(s => !correctSet.has(s)).length;
  const score = Math.max(0, (hits - misses) / correctSet.size);
  const isCorrect = hits === correctSet.size && misses === 0;

  return { isCorrect, score: isCorrect ? 1 : score };
}

function gradeBowTie(
  userAnswer: { causes: string[]; actions: string[]; parameters: string[] },
  correctAnswers: { causes: string[]; actions: string[]; parameters: string[] }
): GradingResult {
  if (!userAnswer || !correctAnswers) {
    return { isCorrect: false, score: 0 };
  }

  let totalParts = 0;
  let correctParts = 0;

  // Grade causes
  const causeResult = gradeMultipleResponse(
    userAnswer.causes || [],
    correctAnswers.causes || []
  );
  totalParts++;
  correctParts += causeResult.score;

  // Grade actions
  const actionResult = gradeMultipleResponse(
    userAnswer.actions || [],
    correctAnswers.actions || []
  );
  totalParts++;
  correctParts += actionResult.score;

  // Grade parameters
  const paramResult = gradeMultipleResponse(
    userAnswer.parameters || [],
    correctAnswers.parameters || []
  );
  totalParts++;
  correctParts += paramResult.score;

  const score = correctParts / totalParts;
  const isCorrect = causeResult.isCorrect && actionResult.isCorrect && paramResult.isCorrect;

  return { isCorrect, score };
}

function gradeCaseStudy(
  userAnswer: Record<string, any>,
  correctAnswers: Record<string, any>
): GradingResult {
  if (!userAnswer || !correctAnswers) {
    return { isCorrect: false, score: 0 };
  }

  // Case study has multiple sub-questions
  const subQuestions = Object.keys(correctAnswers);
  let totalScore = 0;
  let allCorrect = true;

  for (const key of subQuestions) {
    const subType = correctAnswers[key].type || 'multiple_choice';
    const subResult = gradeAnswer(
      subType,
      userAnswer[key],
      correctAnswers[key].answer,
      correctAnswers[key].order,
      correctAnswers[key].hotSpotData
    );
    totalScore += subResult.score;
    if (!subResult.isCorrect) allCorrect = false;
  }

  return {
    isCorrect: allCorrect,
    score: subQuestions.length > 0 ? totalScore / subQuestions.length : 0,
  };
}

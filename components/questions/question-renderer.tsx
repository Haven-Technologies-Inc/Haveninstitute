'use client';

import { MultipleChoice } from './types/multiple-choice';
import { MultipleResponse } from './types/multiple-response';
import { OrderedResponse } from './types/ordered-response';
import { FillBlank } from './types/fill-blank';
import { HotSpot } from './types/hot-spot';
import { ClozeDropdown } from './types/cloze-dropdown';
import { MatrixQuestion } from './types/matrix-question';
import { HighlightText } from './types/highlight-text';
import { BowTieQuestion } from './types/bow-tie';
import { CaseStudy } from './types/case-study';

export interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  scenario?: string;
  difficulty?: string;
  categoryName?: string;
  hotSpotData?: any;
}

interface QuestionRendererProps {
  question: QuestionData;
  userAnswer: any;
  onAnswerChange: (answer: any) => void;
  showResult?: boolean;
  correctAnswers?: any;
  correctOrder?: any;
  explanation?: string;
  rationale?: string;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers,
  correctOrder,
  explanation,
  rationale,
  disabled = false,
}: QuestionRendererProps) {
  const renderQuestion = () => {
    const commonProps = {
      options: question.options,
      userAnswer,
      onAnswerChange,
      showResult,
      correctAnswers,
      disabled,
    };

    switch (question.questionType) {
      case 'multiple_choice':
        return <MultipleChoice {...commonProps} />;
      case 'multiple_response':
      case 'select_all':
        return <MultipleResponse {...commonProps} />;
      case 'ordered_response':
        return <OrderedResponse {...commonProps} correctOrder={correctOrder} />;
      case 'fill_blank':
        return <FillBlank {...commonProps} />;
      case 'hot_spot':
        return <HotSpot {...commonProps} hotSpotData={question.hotSpotData} />;
      case 'cloze_dropdown':
        return <ClozeDropdown {...commonProps} />;
      case 'matrix':
        return <MatrixQuestion {...commonProps} />;
      case 'highlight':
        return <HighlightText {...commonProps} questionText={question.questionText} />;
      case 'bow_tie':
        return <BowTieQuestion {...commonProps} />;
      case 'case_study':
        return <CaseStudy {...commonProps} scenario={question.scenario} />;
      default:
        return <MultipleChoice {...commonProps} />;
    }
  };

  return (
    <div className="space-y-4">
      {question.scenario && question.questionType !== 'case_study' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Scenario</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{question.scenario}</p>
        </div>
      )}

      {question.questionType !== 'highlight' && (
        <div className="text-base font-medium leading-relaxed">
          {question.questionText}
        </div>
      )}

      <div className="mt-4">{renderQuestion()}</div>

      {showResult && (explanation || rationale) && (
        <div className="mt-6 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          {explanation && (
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Explanation</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">{explanation}</p>
            </div>
          )}
          {rationale && (
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Rationale</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">{rationale}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

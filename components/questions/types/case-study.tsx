'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MultipleChoice } from './multiple-choice';
import { MultipleResponse } from './multiple-response';
import { OrderedResponse } from './ordered-response';
import { FillBlank } from './fill-blank';
import { ClozeDropdown } from './cloze-dropdown';
import { MatrixQuestion } from './matrix-question';
import { HighlightText } from './highlight-text';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  correctAnswers?: any;
  correctOrder?: any;
}

interface CaseStudyProps {
  options?: {
    scenario?: string;
    tabs?: { id: string; title: string; content: string }[];
    subQuestions: SubQuestion[];
  };
  scenario?: string;
  userAnswer: Record<string, any> | null;
  onAnswerChange: (answer: Record<string, any>) => void;
  showResult?: boolean;
  correctAnswers?: Record<string, any>;
  disabled?: boolean;
}

export function CaseStudy({
  options,
  scenario,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = {},
  disabled = false,
}: CaseStudyProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubQ, setActiveSubQ] = useState(0);
  const answer = userAnswer || {};
  const tabs = options?.tabs || [];
  const subQuestions = options?.subQuestions || [];
  const caseScenario = options?.scenario || scenario || '';

  const handleSubAnswer = (subId: string, subAnswer: any) => {
    onAnswerChange({ ...answer, [subId]: subAnswer });
  };

  const currentSub = subQuestions[activeSubQ];

  const renderSubQuestion = (sq: SubQuestion) => {
    const props = {
      options: sq.options,
      userAnswer: answer[sq.id],
      onAnswerChange: (a: any) => handleSubAnswer(sq.id, a),
      showResult,
      correctAnswers: correctAnswers[sq.id]?.answer || sq.correctAnswers,
      correctOrder: correctAnswers[sq.id]?.order || sq.correctOrder,
      disabled,
    };

    switch (sq.questionType) {
      case 'multiple_choice': return <MultipleChoice {...props} />;
      case 'multiple_response':
      case 'select_all': return <MultipleResponse {...props} />;
      case 'ordered_response': return <OrderedResponse {...props} />;
      case 'fill_blank': return <FillBlank {...props} />;
      case 'cloze_dropdown': return <ClozeDropdown {...props} />;
      case 'matrix': return <MatrixQuestion {...props} />;
      case 'highlight': return <HighlightText {...props} questionText={sq.questionText} />;
      default: return <MultipleChoice {...props} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Case scenario */}
      {caseScenario && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Clinical Scenario
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
            {caseScenario}
          </p>
        </div>
      )}

      {/* Tabs for additional info (labs, vitals, etc.) */}
      {tabs.length > 0 && (
        <div>
          <div className="flex border-b">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  'px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                  activeTab === idx
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="rounded-b-lg border border-t-0 p-3 text-sm bg-muted/30">
            {tabs[activeTab]?.content}
          </div>
        </div>
      )}

      {/* Sub-questions */}
      {subQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Question {activeSubQ + 1} of {subQuestions.length}
            </p>
            <div className="flex gap-1">
              {subQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSubQ(idx)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    idx === activeSubQ ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>

          {currentSub && (
            <div>
              <p className="text-base font-medium mb-3">{currentSub.questionText}</p>
              {renderSubQuestion(currentSub)}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSubQ(Math.max(0, activeSubQ - 1))}
              disabled={activeSubQ === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSubQ(Math.min(subQuestions.length - 1, activeSubQ + 1))}
              disabled={activeSubQ === subQuestions.length - 1}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

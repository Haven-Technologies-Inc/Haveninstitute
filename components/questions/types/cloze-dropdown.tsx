'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface ClozeDropdownProps {
  options?: {
    text: string;
    blanks: { id: string; choices: string[]; position?: number }[];
  };
  userAnswer: Record<string, string> | null;
  onAnswerChange: (answer: Record<string, string>) => void;
  showResult?: boolean;
  correctAnswers?: Record<string, string>;
  disabled?: boolean;
}

export function ClozeDropdown({
  options,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = {},
  disabled = false,
}: ClozeDropdownProps) {
  const answer = userAnswer || {};
  const blanks = options?.blanks || [];
  const text = options?.text || '';

  const handleChange = (blankId: string, value: string) => {
    if (disabled) return;
    onAnswerChange({ ...answer, [blankId]: value });
  };

  // Parse text and replace blank markers with dropdowns
  const renderTextWithBlanks = () => {
    if (!text || blanks.length === 0) {
      // Fallback: render blanks as a list
      return (
        <div className="space-y-3">
          {blanks.map((blank, idx) => (
            <div key={blank.id} className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground min-w-[70px]">
                Blank {idx + 1}:
              </span>
              {renderDropdown(blank)}
            </div>
          ))}
        </div>
      );
    }

    // Split text by blank markers like {1}, {2}, etc.
    const parts = text.split(/(\{(\d+)\})/g);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      const match = parts[i]?.match(/^\{(\d+)\}$/);
      if (match) {
        const blankIdx = parseInt(match[1]) - 1;
        const blank = blanks[blankIdx];
        if (blank) {
          elements.push(
            <span key={`blank-${i}`} className="inline-block align-middle mx-1">
              {renderDropdown(blank)}
            </span>
          );
        }
        i++; // skip the capture group
      } else if (parts[i] && !parts[i].match(/^\d+$/)) {
        elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
      }
    }

    return <p className="text-sm leading-relaxed">{elements}</p>;
  };

  const renderDropdown = (blank: { id: string; choices: string[] }) => {
    const isCorrect = showResult && answer[blank.id] === correctAnswers[blank.id];
    const isWrong = showResult && answer[blank.id] && answer[blank.id] !== correctAnswers[blank.id];

    return (
      <span className="relative inline-flex items-center">
        <select
          value={answer[blank.id] || ''}
          onChange={(e) => handleChange(blank.id, e.target.value)}
          disabled={disabled}
          className={cn(
            'rounded-md border-2 px-3 py-1.5 text-sm bg-background appearance-none pr-8',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            !showResult && 'border-muted hover:border-primary/50',
            isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
            isWrong && 'border-red-500 bg-red-50 dark:bg-red-950'
          )}
        >
          <option value="">Select...</option>
          {blank.choices.map((choice) => (
            <option key={choice} value={choice}>{choice}</option>
          ))}
        </select>
        {showResult && (
          <span className="absolute right-2">
            {isCorrect ? <Check className="h-3 w-3 text-emerald-500" /> : isWrong ? <X className="h-3 w-3 text-red-500" /> : null}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Select the correct option for each blank
      </p>
      {renderTextWithBlanks()}
      {showResult && Object.keys(correctAnswers).length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground">
          {Object.entries(correctAnswers).map(([key, val]) => {
            const isWrong = answer[key] !== val;
            return isWrong ? (
              <p key={key}>
                Blank &quot;{key}&quot; correct answer: <span className="font-medium text-emerald-600">{val}</span>
              </p>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

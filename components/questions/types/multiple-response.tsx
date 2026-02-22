'use client';

import { cn } from '@/lib/utils';
import { Check, Square, CheckSquare } from 'lucide-react';

interface Option {
  id: string;
  text: string;
}

interface MultipleResponseProps {
  options: Option[];
  userAnswer: string[] | null;
  onAnswerChange: (answer: string[]) => void;
  showResult?: boolean;
  correctAnswers?: string[];
  disabled?: boolean;
}

export function MultipleResponse({
  options = [],
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = [],
  disabled = false,
}: MultipleResponseProps) {
  const selected = userAnswer || [];
  const correctSet = new Set(correctAnswers);

  const toggle = (id: string) => {
    if (disabled) return;
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id];
    onAnswerChange(next);
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Select all that apply
      </p>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrect = showResult && correctSet.has(option.id);
          const isWrongSelect = showResult && isSelected && !correctSet.has(option.id);
          const isMissed = showResult && !isSelected && correctSet.has(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              disabled={disabled}
              className={cn(
                'w-full flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                'hover:border-primary/50 hover:bg-accent/50',
                isSelected && !showResult && 'border-primary bg-primary/10',
                !isSelected && !showResult && 'border-muted',
                isCorrect && isSelected && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                isCorrect && !isSelected && 'border-amber-500 bg-amber-50 dark:bg-amber-950',
                isWrongSelect && 'border-red-500 bg-red-50 dark:bg-red-950',
                isMissed && 'border-amber-500 bg-amber-50 dark:bg-amber-950',
                disabled && 'cursor-default opacity-80'
              )}
            >
              <span className="shrink-0 mt-0.5">
                {isSelected ? (
                  <CheckSquare className={cn(
                    'h-5 w-5',
                    showResult && isCorrect ? 'text-emerald-500' :
                    showResult && isWrongSelect ? 'text-red-500' :
                    'text-primary'
                  )} />
                ) : (
                  <Square className={cn(
                    'h-5 w-5',
                    showResult && isMissed ? 'text-amber-500' : 'text-muted-foreground/40'
                  )} />
                )}
              </span>
              <span className="flex-1 text-sm">{option.text}</span>
              {showResult && isCorrect && (
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

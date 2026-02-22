'use client';

import { cn } from '@/lib/utils';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceProps {
  options: Option[];
  userAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  showResult?: boolean;
  correctAnswers?: any;
  disabled?: boolean;
}

export function MultipleChoice({
  options = [],
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers,
  disabled = false,
}: MultipleChoiceProps) {
  const correct = Array.isArray(correctAnswers) ? correctAnswers[0] : correctAnswers;

  return (
    <div className="space-y-2">
      {options.map((option, idx) => {
        const isSelected = userAnswer === option.id;
        const isCorrect = showResult && option.id === correct;
        const isWrong = showResult && isSelected && option.id !== correct;
        const letter = String.fromCharCode(65 + idx);

        return (
          <button
            key={option.id}
            onClick={() => !disabled && onAnswerChange(option.id)}
            disabled={disabled}
            className={cn(
              'w-full flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
              'hover:border-primary/50 hover:bg-accent/50',
              isSelected && !showResult && 'border-primary bg-primary/10',
              !isSelected && !showResult && 'border-muted',
              isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
              isWrong && 'border-red-500 bg-red-50 dark:bg-red-950',
              disabled && 'cursor-default opacity-80'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                isSelected && !showResult && 'border-primary bg-primary text-primary-foreground',
                !isSelected && !showResult && 'border-muted-foreground/30',
                isCorrect && 'border-emerald-500 bg-emerald-500 text-white',
                isWrong && 'border-red-500 bg-red-500 text-white'
              )}
            >
              {letter}
            </span>
            <span className="flex-1 text-sm pt-0.5">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

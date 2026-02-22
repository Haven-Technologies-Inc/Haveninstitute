'use client';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface FillBlankProps {
  options?: any;
  userAnswer: string | null;
  onAnswerChange: (answer: string) => void;
  showResult?: boolean;
  correctAnswers?: string[];
  disabled?: boolean;
}

export function FillBlank({
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = [],
  disabled = false,
}: FillBlankProps) {
  const acceptable = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  const isCorrect = showResult && acceptable.some(
    a => (userAnswer || '').trim().toLowerCase() === (a || '').trim().toLowerCase()
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Type your answer below
      </p>
      <div className="relative">
        <Input
          value={userAnswer || ''}
          onChange={(e) => !disabled && onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your answer..."
          className={cn(
            'text-base pr-10',
            showResult && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
            showResult && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950'
          )}
        />
        {showResult && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCorrect ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </span>
        )}
      </div>
      {showResult && !isCorrect && (
        <p className="text-sm text-muted-foreground">
          Correct answer: <span className="font-medium text-emerald-600">{acceptable[0]}</span>
        </p>
      )}
    </div>
  );
}

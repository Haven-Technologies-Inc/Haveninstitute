'use client';

import { cn } from '@/lib/utils';

interface HighlightTextProps {
  options?: { sentences: string[] };
  questionText: string;
  userAnswer: string[] | null;
  onAnswerChange: (answer: string[]) => void;
  showResult?: boolean;
  correctAnswers?: string[];
  disabled?: boolean;
}

export function HighlightText({
  options,
  questionText,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = [],
  disabled = false,
}: HighlightTextProps) {
  const selected = userAnswer || [];
  const sentences = options?.sentences || questionText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const correctSet = new Set(correctAnswers.map(s => s.trim().toLowerCase()));

  const toggleSentence = (sentence: string) => {
    if (disabled) return;
    const next = selected.includes(sentence)
      ? selected.filter(s => s !== sentence)
      : [...selected, sentence];
    onAnswerChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Click to highlight the relevant sentence(s)
      </p>
      <div className="rounded-lg border p-4 leading-relaxed text-sm">
        {sentences.map((sentence, idx) => {
          const isSelected = selected.includes(sentence);
          const isCorrect = showResult && correctSet.has(sentence.trim().toLowerCase());
          const isWrongSelect = showResult && isSelected && !correctSet.has(sentence.trim().toLowerCase());
          const isMissed = showResult && !isSelected && correctSet.has(sentence.trim().toLowerCase());

          return (
            <span
              key={idx}
              onClick={() => toggleSentence(sentence)}
              className={cn(
                'cursor-pointer rounded px-0.5 py-0.5 transition-all inline',
                'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
                isSelected && !showResult && 'bg-yellow-200 dark:bg-yellow-800/50',
                isSelected && isCorrect && 'bg-emerald-200 dark:bg-emerald-800/50',
                isWrongSelect && 'bg-red-200 dark:bg-red-800/50',
                isMissed && 'bg-amber-200 dark:bg-amber-800/50 underline decoration-dashed',
                disabled && 'cursor-default'
              )}
            >
              {sentence}{' '}
            </span>
          );
        })}
      </div>
      {showResult && (
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-200 dark:bg-emerald-800" /> Correct
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-red-200 dark:bg-red-800" /> Incorrect
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-amber-200 dark:bg-amber-800" /> Missed
          </span>
        </div>
      )}
    </div>
  );
}

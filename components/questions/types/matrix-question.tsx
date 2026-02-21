'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface MatrixQuestionProps {
  options?: {
    rows: { id: string; text: string }[];
    columns: { id: string; text: string }[];
  };
  userAnswer: Record<string, string> | null;
  onAnswerChange: (answer: Record<string, string>) => void;
  showResult?: boolean;
  correctAnswers?: Record<string, string>;
  disabled?: boolean;
}

export function MatrixQuestion({
  options,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers = {},
  disabled = false,
}: MatrixQuestionProps) {
  const answer = userAnswer || {};
  const rows = options?.rows || [];
  const columns = options?.columns || [];

  const handleSelect = (rowId: string, colId: string) => {
    if (disabled) return;
    onAnswerChange({ ...answer, [rowId]: colId });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Select the correct option for each row
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left border-b min-w-[140px]"></th>
              {columns.map((col) => (
                <th key={col.id} className="p-2 text-center border-b font-medium min-w-[90px]">
                  {col.text}
                </th>
              ))}
              {showResult && <th className="p-2 w-8 border-b"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isCorrect = showResult && answer[row.id] === correctAnswers[row.id];
              const isWrong = showResult && answer[row.id] && answer[row.id] !== correctAnswers[row.id];

              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b last:border-b-0',
                    isCorrect && 'bg-emerald-50 dark:bg-emerald-950/30',
                    isWrong && 'bg-red-50 dark:bg-red-950/30'
                  )}
                >
                  <td className="p-2 font-medium">{row.text}</td>
                  {columns.map((col) => {
                    const isSelected = answer[row.id] === col.id;
                    const isCorrectCell = showResult && correctAnswers[row.id] === col.id;

                    return (
                      <td key={col.id} className="p-2 text-center">
                        <button
                          onClick={() => handleSelect(row.id, col.id)}
                          disabled={disabled}
                          className={cn(
                            'h-6 w-6 rounded-full border-2 mx-auto flex items-center justify-center transition-all',
                            isSelected && !showResult && 'border-primary bg-primary',
                            !isSelected && !showResult && 'border-muted-foreground/30 hover:border-primary/50',
                            isSelected && isCorrectCell && 'border-emerald-500 bg-emerald-500',
                            isSelected && showResult && !isCorrectCell && 'border-red-500 bg-red-500',
                            !isSelected && isCorrectCell && 'border-emerald-500 border-dashed',
                            disabled && 'cursor-default'
                          )}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                  {showResult && (
                    <td className="p-2">
                      {isCorrect ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : isWrong ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

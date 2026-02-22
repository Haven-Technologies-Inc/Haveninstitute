'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface Option {
  id: string;
  text: string;
}

interface OrderedResponseProps {
  options: Option[];
  userAnswer: string[] | null;
  onAnswerChange: (answer: string[]) => void;
  showResult?: boolean;
  correctOrder?: string[];
  correctAnswers?: any;
  disabled?: boolean;
}

export function OrderedResponse({
  options = [],
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctOrder = [],
  disabled = false,
}: OrderedResponseProps) {
  const currentOrder = userAnswer || options.map(o => o.id);
  const optionMap = new Map(options.map(o => [o.id, o]));

  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (disabled) return;
      const newOrder = [...currentOrder];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newOrder.length) return;
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      onAnswerChange(newOrder);
    },
    [currentOrder, onAnswerChange, disabled]
  );

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Arrange in the correct order (use arrows to reorder)
      </p>
      <div className="space-y-2">
        {currentOrder.map((id, idx) => {
          const option = optionMap.get(id);
          if (!option) return null;
          const isCorrectPosition = showResult && correctOrder[idx] === id;
          const correctIdx = showResult ? correctOrder.indexOf(id) : -1;

          return (
            <div
              key={id}
              className={cn(
                'flex items-center gap-2 rounded-lg border-2 p-3 transition-all',
                !showResult && 'border-muted bg-card',
                isCorrectPosition && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                showResult && !isCorrectPosition && 'border-red-500 bg-red-50 dark:bg-red-950'
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1 text-sm">{option.text}</span>
              {showResult ? (
                <span className="shrink-0">
                  {isCorrectPosition ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <span className="text-xs text-red-500">#{correctIdx + 1}</span>
                  )}
                </span>
              ) : (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={disabled || idx === 0}
                    className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={disabled || idx === currentOrder.length - 1}
                    className="rounded p-1 hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

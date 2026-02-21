'use client';

import { cn } from '@/lib/utils';
import { CheckSquare, Square, ArrowRight } from 'lucide-react';

interface BowTieQuestionProps {
  options?: {
    causes: { id: string; text: string }[];
    actions: { id: string; text: string }[];
    parameters: { id: string; text: string }[];
    maxCauses?: number;
    maxActions?: number;
    maxParameters?: number;
  };
  userAnswer: { causes: string[]; actions: string[]; parameters: string[] } | null;
  onAnswerChange: (answer: { causes: string[]; actions: string[]; parameters: string[] }) => void;
  showResult?: boolean;
  correctAnswers?: { causes: string[]; actions: string[]; parameters: string[] };
  disabled?: boolean;
}

export function BowTieQuestion({
  options,
  userAnswer,
  onAnswerChange,
  showResult = false,
  correctAnswers,
  disabled = false,
}: BowTieQuestionProps) {
  const answer = userAnswer || { causes: [], actions: [], parameters: [] };
  const causes = options?.causes || [];
  const actions = options?.actions || [];
  const parameters = options?.parameters || [];
  const maxCauses = options?.maxCauses || 2;
  const maxActions = options?.maxActions || 1;
  const maxParameters = options?.maxParameters || 2;

  const toggle = (section: 'causes' | 'actions' | 'parameters', id: string, max: number) => {
    if (disabled) return;
    const current = answer[section];
    let next: string[];
    if (current.includes(id)) {
      next = current.filter(s => s !== id);
    } else {
      next = current.length >= max ? [...current.slice(1), id] : [...current, id];
    }
    onAnswerChange({ ...answer, [section]: next });
  };

  const renderSection = (
    title: string,
    subtitle: string,
    items: { id: string; text: string }[],
    section: 'causes' | 'actions' | 'parameters',
    max: number,
    color: string
  ) => {
    const selectedSet = new Set(answer[section]);
    const correctSet = new Set(correctAnswers?.[section] || []);

    return (
      <div className="flex-1">
        <h4 className={cn('text-sm font-bold mb-1', color)}>{title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{subtitle} (select {max})</p>
        <div className="space-y-1.5">
          {items.map((item) => {
            const isSelected = selectedSet.has(item.id);
            const isCorrect = showResult && correctSet.has(item.id);
            const isWrong = showResult && isSelected && !correctSet.has(item.id);
            const isMissed = showResult && !isSelected && correctSet.has(item.id);

            return (
              <button
                key={item.id}
                onClick={() => toggle(section, item.id, max)}
                disabled={disabled}
                className={cn(
                  'w-full flex items-start gap-2 rounded-md border p-2 text-left text-xs transition-all',
                  isSelected && !showResult && 'border-primary bg-primary/10',
                  !isSelected && !showResult && 'border-muted hover:border-primary/40',
                  isCorrect && isSelected && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                  isMissed && 'border-amber-500 bg-amber-50 dark:bg-amber-950',
                  isWrong && 'border-red-500 bg-red-50 dark:bg-red-950',
                  disabled && 'cursor-default'
                )}
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className="flex-1">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-3">
        Complete the bow-tie by selecting the correct items for each column
      </p>
      <div className="flex items-stretch gap-2">
        {renderSection(
          'Conditions',
          'Contributing factors',
          causes,
          'causes',
          maxCauses,
          'text-blue-600'
        )}
        <div className="flex flex-col items-center justify-center px-1">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
        {renderSection(
          'Actions',
          'Priority nursing actions',
          actions,
          'actions',
          maxActions,
          'text-violet-600'
        )}
        <div className="flex flex-col items-center justify-center px-1">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
        {renderSection(
          'Parameters',
          'Expected outcomes',
          parameters,
          'parameters',
          maxParameters,
          'text-emerald-600'
        )}
      </div>
    </div>
  );
}

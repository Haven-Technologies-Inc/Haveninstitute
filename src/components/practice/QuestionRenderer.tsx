/**
 * NextGen NCLEX Question Renderer
 * Renders all question types with interactive answer selection
 */

import { useState } from 'react';
import { 
  CheckCircle2, 
  CheckSquare,
  GripVertical,
  Highlighter,
  Info
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type {
  NextGenQuestion,
  QuestionAnswer,
  MultipleChoiceQuestion,
  SelectAllQuestion,
  OrderedResponseQuestion,
  ClozeDropdownQuestion,
  MatrixQuestion,
  HighlightQuestion,
  BowTieQuestion,
  HotSpotQuestion,
  CaseStudyQuestion
} from '../../types/nextGenNCLEX';

interface QuestionRendererProps {
  question: NextGenQuestion;
  answer: QuestionAnswer | null;
  onAnswerChange: (answer: QuestionAnswer) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  questionNumber?: number;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  showFeedback = false,
  disabled = false,
  questionNumber
}: QuestionRendererProps) {
  if (!question) {
    return <div className="text-red-500">No question provided</div>;
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceRenderer
            question={question}
            answer={answer?.type === 'multiple-choice' ? answer.answer : null}
            onAnswer={(a) => onAnswerChange({ type: 'multiple-choice', answer: a })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'select-all':
        return (
          <SelectAllRenderer
            question={question}
            answers={answer?.type === 'select-all' ? answer.answers : []}
            onAnswer={(a) => onAnswerChange({ type: 'select-all', answers: a })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'ordered-response':
        return (
          <OrderedResponseRenderer
            question={question}
            order={answer?.type === 'ordered-response' ? answer.order : (question.items?.map((_, i) => i) || [])}
            onAnswer={(o) => onAnswerChange({ type: 'ordered-response', order: o })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'cloze-dropdown':
        return (
          <ClozeDropdownRenderer
            question={question}
            answers={answer?.type === 'cloze-dropdown' ? answer.answers : {}}
            onAnswer={(a) => onAnswerChange({ type: 'cloze-dropdown', answers: a })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'matrix':
        return (
          <MatrixRenderer
            question={question}
            selections={answer?.type === 'matrix' ? answer.selections : []}
            onAnswer={(s) => onAnswerChange({ type: 'matrix', selections: s })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'highlight':
        return (
          <HighlightRenderer
            question={question}
            highlightedIds={answer?.type === 'highlight' ? answer.highlightedIds : []}
            onAnswer={(h) => onAnswerChange({ type: 'highlight', highlightedIds: h })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'bow-tie':
        return (
          <BowTieRenderer
            question={question}
            left={answer?.type === 'bow-tie' ? answer.left : []}
            right={answer?.type === 'bow-tie' ? answer.right : []}
            onAnswer={(l, r) => onAnswerChange({ type: 'bow-tie', left: l, right: r })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      case 'hot-spot':
        return (
          <HotSpotRenderer
            question={question}
            selectedSpots={answer?.type === 'hot-spot' ? answer.selectedSpots : []}
            onAnswer={(spots) => onAnswerChange({ type: 'hot-spot', selectedSpots: spots })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );

      case 'case-study':
        return (
          <CaseStudyRenderer
            question={question}
            subAnswers={answer?.type === 'case-study' ? answer.subAnswers : []}
            onAnswer={(answers) => onAnswerChange({ type: 'case-study', subAnswers: answers })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-300">
            <p className="text-red-800 dark:text-red-200">
              Unknown question type: {(question as any).type || 'undefined'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        {questionNumber && (
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            {questionNumber}
          </span>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {question.difficulty}
            </Badge>
          </div>
          <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
            {question.stem}
          </p>
        </div>
      </div>

      {/* Question Content */}
      <div className="mt-4">
        {renderQuestion()}
      </div>

      {/* Feedback/Rationale */}
      {showFeedback && (
        <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Rationale</p>
                <p className="text-blue-800 dark:text-blue-200 text-sm">{question.rationale}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Multiple Choice Renderer
function MultipleChoiceRenderer({
  question,
  answer,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: MultipleChoiceQuestion;
  answer: number | null;
  onAnswer: (answer: number) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      {question.options.map((option, index) => {
        const isSelected = answer === index;
        const isCorrect = index === question.correctAnswer;
        const showCorrectness = showFeedback && isSelected;
        
        return (
          <button
            key={index}
            onClick={() => !disabled && onAnswer(index)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-blue-300'
            } ${
              showFeedback && isCorrect
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : showFeedback && isSelected && !isCorrect
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              showFeedback && isCorrect
                ? 'border-green-500 bg-green-500'
                : showFeedback && isSelected && !isCorrect
                ? 'border-red-500 bg-red-500'
                : isSelected
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {(isSelected || (showFeedback && isCorrect)) && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <span className={`flex-1 ${
              showFeedback && isCorrect ? 'text-green-700 dark:text-green-300 font-medium' :
              showFeedback && isSelected && !isCorrect ? 'text-red-700 dark:text-red-300' :
              'text-gray-900 dark:text-white'
            }`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Select All That Apply Renderer
function SelectAllRenderer({
  question,
  answers,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: SelectAllQuestion;
  answers: number[];
  onAnswer: (answers: number[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const toggleOption = (index: number) => {
    if (disabled) return;
    const newAnswers = answers.includes(index)
      ? answers.filter(a => a !== index)
      : [...answers, index];
    onAnswer(newAnswers);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        <CheckSquare className="w-4 h-4" />
        Select all that apply
      </p>
      {question.options.map((option, index) => {
        const isSelected = answers.includes(index);
        const isCorrect = question.correctAnswers.includes(index);
        const showAsCorrect = showFeedback && isCorrect;
        const showAsWrong = showFeedback && isSelected && !isCorrect;
        
        return (
          <button
            key={index}
            onClick={() => toggleOption(index)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-blue-300'
            } ${
              showAsCorrect
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : showAsWrong
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              showAsCorrect
                ? 'border-green-500 bg-green-500'
                : showAsWrong
                ? 'border-red-500 bg-red-500'
                : isSelected
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {(isSelected || showAsCorrect) && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <span className={`flex-1 ${
              showAsCorrect ? 'text-green-700 dark:text-green-300 font-medium' :
              showAsWrong ? 'text-red-700 dark:text-red-300' :
              'text-gray-900 dark:text-white'
            }`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Ordered Response (Drag & Drop) Renderer
function OrderedResponseRenderer({
  question,
  order,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: OrderedResponseQuestion;
  order: number[];
  onAnswer: (order: number[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    
    const newOrder = [...order];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);
    setDraggedIndex(index);
    onAnswer(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= order.length) return;
    
    const newOrder = [...order];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    onAnswer(newOrder);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        <GripVertical className="w-4 h-4" />
        Drag to reorder or use arrows
      </p>
      {order.map((itemIndex, positionIndex) => {
        const isCorrectPosition = showFeedback && question.correctOrder[positionIndex] === itemIndex;
        
        return (
          <div
            key={itemIndex}
            draggable={!disabled}
            onDragStart={() => handleDragStart(positionIndex)}
            onDragOver={(e) => handleDragOver(e, positionIndex)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              disabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing'
            } ${
              showFeedback
                ? isCorrectPosition
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : draggedIndex === positionIndex
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-50'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveItem(positionIndex, 'up')}
                disabled={disabled || positionIndex === 0}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(positionIndex, 'down')}
                disabled={disabled || positionIndex === order.length - 1}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <GripVertical className="w-5 h-5 text-gray-400" />
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
              {positionIndex + 1}
            </span>
            <span className="flex-1 text-gray-900 dark:text-white">
              {question.items[itemIndex]}
            </span>
            {showFeedback && (
              <span className={`text-sm ${isCorrectPosition ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrectPosition ? '✓' : `Should be #${question.correctOrder.indexOf(itemIndex) + 1}`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Cloze/Dropdown Renderer
function ClozeDropdownRenderer({
  question,
  answers,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: ClozeDropdownQuestion;
  answers: Record<number, number>;
  onAnswer: (answers: Record<number, number>) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const handleSelect = (blankId: number, optionIndex: number) => {
    if (disabled) return;
    onAnswer({ ...answers, [blankId]: optionIndex });
  };

  // Parse template and insert dropdowns
  const renderTemplate = () => {
    const parts = question.template.split(/\{\{(\d+)\}\}/);
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        return <span key={index}>{part}</span>;
      }
      
      const blankId = parseInt(part);
      const blank = question.blanks.find(b => b.id === blankId);
      if (!blank) return null;
      
      const selectedIndex = answers[blankId];
      const isCorrect = showFeedback && selectedIndex === blank.correctAnswer;
      const isWrong = showFeedback && selectedIndex !== undefined && selectedIndex !== blank.correctAnswer;
      
      return (
        <select
          key={index}
          value={selectedIndex ?? ''}
          onChange={(e) => handleSelect(blankId, parseInt(e.target.value))}
          disabled={disabled}
          className={`mx-1 px-3 py-1 rounded-lg border-2 bg-white dark:bg-gray-800 ${
            isCorrect
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : isWrong
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">Select...</option>
          {blank.options.map((opt, i) => (
            <option key={i} value={i}>{opt}</option>
          ))}
        </select>
      );
    });
  };

  return (
    <div className="text-lg leading-loose text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      {renderTemplate()}
    </div>
  );
}

// Matrix/Grid Renderer
function MatrixRenderer({
  question,
  selections,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: MatrixQuestion;
  selections: { row: number; column: number }[];
  onAnswer: (selections: { row: number; column: number }[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const isSelected = (row: number, col: number) => 
    selections.some(s => s.row === row && s.column === col);
  
  const isCorrect = (row: number, col: number) =>
    question.correctSelections.some(s => s.row === row && s.column === col);

  const toggleCell = (row: number, col: number) => {
    if (disabled) return;
    
    if (question.selectionType === 'single-per-row') {
      // Remove any existing selection in this row, add new one
      const filtered = selections.filter(s => s.row !== row);
      onAnswer([...filtered, { row, column: col }]);
    } else {
      // Toggle the cell
      if (isSelected(row, col)) {
        onAnswer(selections.filter(s => !(s.row === row && s.column === col)));
      } else {
        onAnswer([...selections, { row, column: col }]);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></th>
            {question.columns.map((col, i) => (
              <th key={i} className="p-3 text-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 font-medium">
                {row}
              </td>
              {question.columns.map((_, colIndex) => {
                const selected = isSelected(rowIndex, colIndex);
                const correct = isCorrect(rowIndex, colIndex);
                const showCorrect = showFeedback && correct;
                const showWrong = showFeedback && selected && !correct;
                
                return (
                  <td 
                    key={colIndex} 
                    className={`p-3 text-center border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                      showCorrect
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : showWrong
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : selected
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => toggleCell(rowIndex, colIndex)}
                  >
                    <div className={`w-6 h-6 mx-auto rounded ${
                      question.selectionType === 'single-per-row' ? 'rounded-full' : ''
                    } border-2 flex items-center justify-center ${
                      showCorrect
                        ? 'border-green-500 bg-green-500'
                        : showWrong
                        ? 'border-red-500 bg-red-500'
                        : selected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {(selected || showCorrect) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Highlight Renderer
function HighlightRenderer({
  question,
  highlightedIds,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: HighlightQuestion;
  highlightedIds: string[];
  onAnswer: (ids: string[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const toggleHighlight = (id: string) => {
    if (disabled) return;
    if (highlightedIds.includes(id)) {
      onAnswer(highlightedIds.filter(h => h !== id));
    } else {
      onAnswer([...highlightedIds, id]);
    }
  };

  // Sort segments by start index
  const sortedSegments = [...question.highlightableSegments].sort((a, b) => a.startIndex - b.startIndex);
  
  // Build passage with clickable segments
  let lastIndex = 0;
  const passageParts: React.ReactNode[] = [];
  
  sortedSegments.forEach((segment, i) => {
    // Add text before this segment
    if (segment.startIndex > lastIndex) {
      passageParts.push(
        <span key={`text-${i}`}>
          {question.passage.slice(lastIndex, segment.startIndex)}
        </span>
      );
    }
    
    const isHighlighted = highlightedIds.includes(segment.id);
    const isCorrect = question.correctHighlights.includes(segment.id);
    const showCorrect = showFeedback && isCorrect;
    const showWrong = showFeedback && isHighlighted && !isCorrect;
    
    passageParts.push(
      <span
        key={segment.id}
        onClick={() => toggleHighlight(segment.id)}
        className={`cursor-pointer px-1 rounded transition-colors ${
          disabled ? 'cursor-not-allowed' : ''
        } ${
          showCorrect
            ? 'bg-green-300 dark:bg-green-700'
            : showWrong
            ? 'bg-red-300 dark:bg-red-700'
            : isHighlighted
            ? 'bg-yellow-300 dark:bg-yellow-700'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {segment.text}
      </span>
    );
    
    lastIndex = segment.endIndex;
  });
  
  // Add remaining text
  if (lastIndex < question.passage.length) {
    passageParts.push(
      <span key="text-end">{question.passage.slice(lastIndex)}</span>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <Highlighter className="w-4 h-4" />
        {question.instruction}
      </p>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-lg leading-relaxed">
        {passageParts}
      </div>
    </div>
  );
}

// Bow-Tie Renderer
function BowTieRenderer({
  question,
  left,
  right,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: BowTieQuestion;
  left: number[];
  right: number[];
  onAnswer: (left: number[], right: number[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const toggleLeft = (index: number) => {
    if (disabled) return;
    if (left.includes(index)) {
      onAnswer(left.filter(l => l !== index), right);
    } else if (left.length < question.leftSide.selectCount) {
      onAnswer([...left, index], right);
    }
  };

  const toggleRight = (index: number) => {
    if (disabled) return;
    if (right.includes(index)) {
      onAnswer(left, right.filter(r => r !== index));
    } else if (right.length < question.rightSide.selectCount) {
      onAnswer(left, [...right, index]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {question.scenario}
      </p>
      
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Left Side - Causes */}
        <div className="space-y-2">
          <p className="font-semibold text-center text-sm text-gray-600 dark:text-gray-400">
            {question.leftSide.label}
            <span className="block text-xs">Select {question.leftSide.selectCount}</span>
          </p>
          {question.leftSide.options.map((option, index) => {
            const isSelected = left.includes(index);
            const isCorrect = question.leftSide.correctAnswers.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => toggleLeft(index)}
                disabled={disabled}
                className={`w-full p-2 rounded-lg border-2 text-sm text-left transition-all ${
                  showFeedback && isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : showFeedback && isSelected && !isCorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        
        {/* Center - Condition */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-0.5 bg-gray-300 dark:bg-gray-600 mb-2" />
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400 rounded-xl text-center">
            <p className="font-bold text-purple-800 dark:text-purple-200">
              {question.centerCondition}
            </p>
          </div>
          <div className="w-20 h-0.5 bg-gray-300 dark:bg-gray-600 mt-2" />
        </div>
        
        {/* Right Side - Actions */}
        <div className="space-y-2">
          <p className="font-semibold text-center text-sm text-gray-600 dark:text-gray-400">
            {question.rightSide.label}
            <span className="block text-xs">Select {question.rightSide.selectCount}</span>
          </p>
          {question.rightSide.options.map((option, index) => {
            const isSelected = right.includes(index);
            const isCorrect = question.rightSide.correctAnswers.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => toggleRight(index)}
                disabled={disabled}
                className={`w-full p-2 rounded-lg border-2 text-sm text-left transition-all ${
                  showFeedback && isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : showFeedback && isSelected && !isCorrect
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Hot Spot Renderer (Image-based clicking)
function HotSpotRenderer({
  question,
  selectedSpots,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: HotSpotQuestion;
  selectedSpots: string[];
  onAnswer: (spots: string[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleSpot = (spotId: string) => {
    if (disabled) return;
    if (selectedSpots.includes(spotId)) {
      onAnswer(selectedSpots.filter(s => s !== spotId));
    } else {
      onAnswer([...selectedSpots, spotId]);
    }
  };

  const getSpotStyle = (spot: { shape: string; coords: number[] }) => {
    if (spot.shape === 'circle') {
      const [cx, cy, r] = spot.coords;
      return {
        left: `${cx - r}px`,
        top: `${cy - r}px`,
        width: `${r * 2}px`,
        height: `${r * 2}px`,
        borderRadius: '50%'
      };
    } else if (spot.shape === 'rect') {
      const [x1, y1, x2, y2] = spot.coords;
      return {
        left: `${x1}px`,
        top: `${y1}px`,
        width: `${x2 - x1}px`,
        height: `${y2 - y1}px`,
        borderRadius: '4px'
      };
    }
    return {};
  };

  if (imageError) {
    return (
      <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load image</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Select the correct areas:</p>
          {question.hotSpots.map((spot) => {
            const isSelected = selectedSpots.includes(spot.id);
            const isCorrect = question.correctSpots.includes(spot.id);
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={spot.id}
                onClick={() => toggleSpot(spot.id)}
                disabled={disabled}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : showWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {spot.label || `Area ${spot.id}`}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">◎</span>
        Click on the correct area(s) in the image
      </p>
      <div className="relative inline-block">
        <img
          src={question.imageUrl}
          alt="Hot spot question"
          className="max-w-full h-auto rounded-xl"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {imageLoaded && question.hotSpots.map((spot) => {
          const isSelected = selectedSpots.includes(spot.id);
          const isCorrect = question.correctSpots.includes(spot.id);
          const showCorrect = showFeedback && isCorrect;
          const showWrong = showFeedback && isSelected && !isCorrect;

          return (
            <button
              key={spot.id}
              onClick={() => toggleSpot(spot.id)}
              disabled={disabled}
              style={getSpotStyle(spot)}
              className={`absolute border-2 transition-all ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-200/30'
              } ${
                showCorrect
                  ? 'border-green-500 bg-green-500/30'
                  : showWrong
                  ? 'border-red-500 bg-red-500/30'
                  : isSelected
                  ? 'border-blue-500 bg-blue-500/30'
                  : 'border-transparent hover:border-blue-300'
              }`}
              title={spot.label}
            >
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          );
        })}
      </div>
      {showFeedback && (
        <div className="text-sm mt-2">
          <span className={selectedSpots.length === question.correctSpots.length &&
            selectedSpots.every(s => question.correctSpots.includes(s))
              ? 'text-green-600' : 'text-red-600'}>
            {selectedSpots.length} of {question.correctSpots.length} correct areas selected
          </span>
        </div>
      )}
    </div>
  );
}

// Case Study Renderer (Multi-question scenario)
function CaseStudyRenderer({
  question,
  subAnswers,
  onAnswer,
  showFeedback,
  disabled
}: {
  question: CaseStudyQuestion;
  subAnswers: QuestionAnswer[];
  onAnswer: (answers: QuestionAnswer[]) => void;
  showFeedback: boolean;
  disabled: boolean;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [currentSubQuestion, setCurrentSubQuestion] = useState(0);

  const handleSubAnswerChange = (index: number, answer: QuestionAnswer) => {
    const newAnswers = [...subAnswers];
    newAnswers[index] = answer;
    onAnswer(newAnswers);
  };

  // Render sub-question based on type
  const renderSubQuestion = (subQ: typeof question.subQuestions[0], index: number) => {
    const currentAnswer = subAnswers[index];

    switch (subQ.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceRenderer
            question={subQ as MultipleChoiceQuestion}
            answer={currentAnswer?.type === 'multiple-choice' ? currentAnswer.answer : null}
            onAnswer={(a) => handleSubAnswerChange(index, { type: 'multiple-choice', answer: a })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      case 'select-all':
        return (
          <SelectAllRenderer
            question={subQ as SelectAllQuestion}
            answers={currentAnswer?.type === 'select-all' ? currentAnswer.answers : []}
            onAnswer={(a) => handleSubAnswerChange(index, { type: 'select-all', answers: a })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      case 'ordered-response':
        return (
          <OrderedResponseRenderer
            question={subQ as OrderedResponseQuestion}
            order={currentAnswer?.type === 'ordered-response' ? currentAnswer.order : ((subQ as OrderedResponseQuestion).items?.map((_, i) => i) || [])}
            onAnswer={(o) => handleSubAnswerChange(index, { type: 'ordered-response', order: o })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      case 'matrix':
        return (
          <MatrixRenderer
            question={subQ as MatrixQuestion}
            selections={currentAnswer?.type === 'matrix' ? currentAnswer.selections : []}
            onAnswer={(s) => handleSubAnswerChange(index, { type: 'matrix', selections: s })}
            showFeedback={showFeedback}
            disabled={disabled}
          />
        );
      default:
        return <div className="text-red-500">Unsupported sub-question type</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Scenario Box */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">📋</span>
          Clinical Scenario
        </h3>
        <p className="text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-wrap">
          {question.scenario}
        </p>
      </div>

      {/* Tabs for additional info (if present) */}
      {question.tabs && question.tabs.length > 0 && (
        <div className="border rounded-xl overflow-hidden dark:border-gray-700">
          <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {question.tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === idx
                    ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
          <div className="p-4 bg-white dark:bg-gray-900">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {question.tabs[activeTab]?.content}
            </p>
          </div>
        </div>
      )}

      {/* Sub-questions Navigation */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Question {currentSubQuestion + 1} of {question.subQuestions.length}
        </span>
        <div className="flex gap-1">
          {question.subQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSubQuestion(idx)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentSubQuestion === idx
                  ? 'bg-blue-600 text-white'
                  : subAnswers[idx]
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Sub-question */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <p className="text-lg text-gray-900 dark:text-white mb-4">
          {question.subQuestions[currentSubQuestion]?.stem}
        </p>
        {renderSubQuestion(question.subQuestions[currentSubQuestion], currentSubQuestion)}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentSubQuestion(Math.max(0, currentSubQuestion - 1))}
          disabled={currentSubQuestion === 0}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentSubQuestion(Math.min(question.subQuestions.length - 1, currentSubQuestion + 1))}
          disabled={currentSubQuestion === question.subQuestions.length - 1}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Progress indicator */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {subAnswers.filter(a => a !== undefined).length} of {question.subQuestions.length} questions answered
      </div>
    </div>
  );
}

export default QuestionRenderer;

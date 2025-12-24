/**
 * Question Creator Form Component
 * Dynamic form for creating all NextGen NCLEX question types
 */

import { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  NCLEX_CATEGORIES, 
  type NCLEXCategory, 
  type QuestionType,
  type NextGenQuestion
} from '../../types/nextGenNCLEX';

interface QuestionCreatorFormProps {
  questionType: QuestionType;
  initialData?: Partial<NextGenQuestion>;
  onSave: (question: NextGenQuestion) => void;
  onCancel: () => void;
}

export function QuestionCreatorForm({ 
  questionType, 
  initialData, 
  onSave, 
  onCancel 
}: QuestionCreatorFormProps) {
  // Common fields
  const [stem, setStem] = useState(initialData?.stem || '');
  const [category, setCategory] = useState<NCLEXCategory>(
    (initialData?.category as NCLEXCategory) || 'management-of-care'
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    initialData?.difficulty || 'medium'
  );
  const [rationale, setRationale] = useState(initialData?.rationale || '');

  // Multiple Choice specific
  const [options, setOptions] = useState<string[]>(
    (initialData as any)?.options || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState<number>(
    (initialData as any)?.correctAnswer ?? 0
  );

  // Select All specific
  const [correctAnswers, setCorrectAnswers] = useState<number[]>(
    (initialData as any)?.correctAnswers || []
  );

  // Ordered Response specific
  const [items, setItems] = useState<string[]>(
    (initialData as any)?.items || ['', '', '', '', '']
  );
  const [correctOrder, setCorrectOrder] = useState<number[]>(
    (initialData as any)?.correctOrder || [0, 1, 2, 3, 4]
  );

  // Cloze Dropdown specific
  const [template, setTemplate] = useState<string>(
    (initialData as any)?.template || ''
  );
  const [blanks, setBlanks] = useState<{id: number; options: string[]; correctAnswer: number}[]>(
    (initialData as any)?.blanks || []
  );

  // Matrix specific
  const [rows, setRows] = useState<string[]>(
    (initialData as any)?.rows || ['', '', '', '']
  );
  const [columns, setColumns] = useState<string[]>(
    (initialData as any)?.columns || ['', '']
  );
  const [correctSelections, setCorrectSelections] = useState<{row: number; column: number}[]>(
    (initialData as any)?.correctSelections || []
  );

  // Highlight specific
  const [passage, setPassage] = useState<string>(
    (initialData as any)?.passage || ''
  );
  const [highlightInstruction, setHighlightInstruction] = useState<string>(
    (initialData as any)?.instruction || ''
  );
  const [highlightableSegments, setHighlightableSegments] = useState<
    {id: string; text: string; startIndex: number; endIndex: number}[]
  >((initialData as any)?.highlightableSegments || []);
  const [correctHighlights, setCorrectHighlights] = useState<string[]>(
    (initialData as any)?.correctHighlights || []
  );

  // Bow-tie specific
  const [scenario, setScenario] = useState<string>(
    (initialData as any)?.scenario || ''
  );
  const [centerCondition, setCenterCondition] = useState<string>(
    (initialData as any)?.centerCondition || ''
  );
  const [leftSide, setLeftSide] = useState<{
    label: string;
    options: string[];
    correctAnswers: number[];
    selectCount: number;
  }>((initialData as any)?.leftSide || {
    label: 'Risk Factors / Causes',
    options: ['', '', '', '', '', ''],
    correctAnswers: [],
    selectCount: 2
  });
  const [rightSide, setRightSide] = useState<{
    label: string;
    options: string[];
    correctAnswers: number[];
    selectCount: number;
  }>((initialData as any)?.rightSide || {
    label: 'Priority Interventions',
    options: ['', '', '', '', '', ''],
    correctAnswers: [],
    selectCount: 3
  });

  const [errors, setErrors] = useState<string[]>([]);

  const validateAndSave = () => {
    const newErrors: string[] = [];

    if (!stem.trim()) newErrors.push('Question stem is required');
    if (!rationale.trim()) newErrors.push('Rationale is required');

    // Type-specific validation
    switch (questionType) {
      case 'multiple-choice':
        if (options.some(o => !o.trim())) newErrors.push('All options must be filled');
        break;
      case 'select-all':
        if (options.some(o => !o.trim())) newErrors.push('All options must be filled');
        if (correctAnswers.length < 2) newErrors.push('Select at least 2 correct answers');
        break;
      case 'ordered-response':
        if (items.some(i => !i.trim())) newErrors.push('All items must be filled');
        break;
      case 'cloze-dropdown':
        if (!template.includes('{{')) newErrors.push('Template must include {{1}}, {{2}}, etc. placeholders');
        if (blanks.length === 0) newErrors.push('Add at least one blank');
        break;
      case 'matrix':
        if (rows.some(r => !r.trim())) newErrors.push('All rows must be filled');
        if (columns.some(c => !c.trim())) newErrors.push('All columns must be filled');
        if (correctSelections.length === 0) newErrors.push('Select correct answers');
        break;
      case 'highlight':
        if (!passage.trim()) newErrors.push('Passage is required');
        if (highlightableSegments.length === 0) newErrors.push('Add highlightable segments');
        if (correctHighlights.length === 0) newErrors.push('Select correct highlights');
        break;
      case 'bow-tie':
        if (!centerCondition.trim()) newErrors.push('Center condition is required');
        if (leftSide.correctAnswers.length === 0) newErrors.push('Select correct left side answers');
        if (rightSide.correctAnswers.length === 0) newErrors.push('Select correct right side answers');
        break;
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build question object
    const baseQuestion = {
      id: `q-${Date.now()}`,
      type: questionType,
      category,
      difficulty,
      stem,
      rationale
    };

    let question: NextGenQuestion;

    switch (questionType) {
      case 'multiple-choice':
        question = { ...baseQuestion, type: 'multiple-choice', options, correctAnswer } as NextGenQuestion;
        break;
      case 'select-all':
        question = { ...baseQuestion, type: 'select-all', options, correctAnswers } as NextGenQuestion;
        break;
      case 'ordered-response':
        question = { ...baseQuestion, type: 'ordered-response', items: items.filter(i => i.trim()), correctOrder } as NextGenQuestion;
        break;
      case 'cloze-dropdown':
        question = { ...baseQuestion, type: 'cloze-dropdown', template, blanks } as NextGenQuestion;
        break;
      case 'matrix':
        question = { 
          ...baseQuestion, 
          type: 'matrix', 
          rows: rows.filter(r => r.trim()), 
          columns: columns.filter(c => c.trim()), 
          correctSelections,
          selectionType: 'single-per-row' as const
        } as NextGenQuestion;
        break;
      case 'highlight':
        question = { 
          ...baseQuestion, 
          type: 'highlight', 
          passage, 
          instruction: highlightInstruction,
          highlightableSegments, 
          correctHighlights 
        } as NextGenQuestion;
        break;
      case 'bow-tie':
        question = { 
          ...baseQuestion, 
          type: 'bow-tie', 
          scenario,
          centerCondition, 
          leftSide, 
          rightSide 
        } as NextGenQuestion;
        break;
      default:
        question = baseQuestion as NextGenQuestion;
    }

    onSave(question);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswer >= newOptions.length) setCorrectAnswer(0);
  };

  const addItem = () => setItems([...items, '']);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const addBlank = () => {
    const newId = blanks.length + 1;
    setBlanks([...blanks, { id: newId, options: ['', '', ''], correctAnswer: 0 }]);
  };

  const addRow = () => setRows([...rows, '']);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const addColumn = () => setColumns([...columns, '']);
  const removeColumn = (index: number) => setColumns(columns.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Please fix the following errors:</p>
              <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside mt-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NCLEXCategory)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            {NCLEX_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty *</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question Stem *</label>
        <textarea
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          rows={3}
          placeholder="Enter the question text..."
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Type-specific Fields */}
      {(questionType === 'multiple-choice' || questionType === 'select-all') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              Answer Options * {questionType === 'select-all' && '(Select all correct answers)'}
            </label>
            <Button size="sm" variant="outline" onClick={addOption}>
              <Plus className="w-3 h-3 mr-1" /> Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                {questionType === 'multiple-choice' ? (
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-4 h-4"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={correctAnswers.includes(index)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCorrectAnswers([...correctAnswers, index]);
                      } else {
                        setCorrectAnswers(correctAnswers.filter(a => a !== index));
                      }
                    }}
                    className="w-4 h-4"
                  />
                )}
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                {options.length > 2 && (
                  <Button size="sm" variant="ghost" onClick={() => removeOption(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {questionType === 'ordered-response' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Items to Order * (in correct order)</label>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index] = e.target.value;
                    setItems(newItems);
                  }}
                  placeholder={`Step ${index + 1}`}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                {items.length > 2 && (
                  <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter items in the correct order. The system will shuffle them when displaying to students.
          </p>
        </div>
      )}

      {questionType === 'cloze-dropdown' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Template Text * (use {'{{1}}'}, {'{{2}}'}, etc. for blanks)
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={3}
              placeholder="The nurse should administer {{1}} insulin at a {{2}} angle..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Dropdown Options</label>
              <Button size="sm" variant="outline" onClick={addBlank}>
                <Plus className="w-3 h-3 mr-1" /> Add Blank
              </Button>
            </div>
            {blanks.map((blank, blankIndex) => (
              <Card key={blank.id} className="mb-3">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Blank {'{{'}{blank.id}{'}}'}</Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setBlanks(blanks.filter(b => b.id !== blank.id))}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  {blank.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name={`blank-${blank.id}-correct`}
                        checked={blank.correctAnswer === optIndex}
                        onChange={() => {
                          const newBlanks = [...blanks];
                          newBlanks[blankIndex].correctAnswer = optIndex;
                          setBlanks(newBlanks);
                        }}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newBlanks = [...blanks];
                          newBlanks[blankIndex].options[optIndex] = e.target.value;
                          setBlanks(newBlanks);
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newBlanks = [...blanks];
                      newBlanks[blankIndex].options.push('');
                      setBlanks(newBlanks);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Option
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {questionType === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Row Labels *</label>
                <Button size="sm" variant="outline" onClick={addRow}>
                  <Plus className="w-3 h-3 mr-1" /> Add Row
                </Button>
              </div>
              {rows.map((row, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={row}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[index] = e.target.value;
                      setRows(newRows);
                    }}
                    placeholder={`Row ${index + 1}`}
                    className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  {rows.length > 2 && (
                    <Button size="sm" variant="ghost" onClick={() => removeRow(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Column Labels *</label>
                <Button size="sm" variant="outline" onClick={addColumn}>
                  <Plus className="w-3 h-3 mr-1" /> Add Column
                </Button>
              </div>
              {columns.map((col, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => {
                      const newCols = [...columns];
                      newCols[index] = e.target.value;
                      setColumns(newCols);
                    }}
                    placeholder={`Column ${index + 1}`}
                    className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  {columns.length > 2 && (
                    <Button size="sm" variant="ghost" onClick={() => removeColumn(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Select Correct Answers (click cells)</label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border"></th>
                    {columns.filter(c => c.trim()).map((col, i) => (
                      <th key={i} className="p-2 border text-center">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.trim()).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-2 border font-medium">{row}</td>
                      {columns.filter(c => c.trim()).map((_, colIndex) => {
                        const isSelected = correctSelections.some(
                          s => s.row === rowIndex && s.column === colIndex
                        );
                        return (
                          <td 
                            key={colIndex} 
                            className={`p-2 border text-center cursor-pointer transition-colors ${
                              isSelected ? 'bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setCorrectSelections(correctSelections.filter(
                                  s => !(s.row === rowIndex && s.column === colIndex)
                                ));
                              } else {
                                // For single-per-row, remove existing selection for this row
                                const filtered = correctSelections.filter(s => s.row !== rowIndex);
                                setCorrectSelections([...filtered, { row: rowIndex, column: colIndex }]);
                              }
                            }}
                          >
                            {isSelected ? '✓' : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {questionType === 'highlight' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instruction *</label>
            <input
              type="text"
              value={highlightInstruction}
              onChange={(e) => setHighlightInstruction(e.target.value)}
              placeholder="Highlight the findings that require immediate intervention"
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passage *</label>
            <textarea
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              rows={5}
              placeholder="Enter the passage text. You will mark highlightable segments below."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <p className="text-xs text-gray-500">
            After entering the passage, select text segments that students can highlight, then mark which ones are correct.
          </p>
        </div>
      )}

      {questionType === 'bow-tie' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clinical Scenario *</label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows={3}
              placeholder="Describe the clinical scenario..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Center Condition/Diagnosis *</label>
            <input
              type="text"
              value={centerCondition}
              onChange={(e) => setCenterCondition(e.target.value)}
              placeholder="e.g., Hyperkalemia, Sepsis, Heart Failure"
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side */}
            <Card>
              <CardContent className="pt-4">
                <input
                  type="text"
                  value={leftSide.label}
                  onChange={(e) => setLeftSide({...leftSide, label: e.target.value})}
                  className="w-full p-2 mb-3 font-semibold text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Select</span>
                  <input
                    type="number"
                    value={leftSide.selectCount}
                    onChange={(e) => setLeftSide({...leftSide, selectCount: parseInt(e.target.value) || 1})}
                    min="1"
                    max="6"
                    className="w-16 p-1 text-center rounded border"
                  />
                  <span className="text-sm">correct</span>
                </div>
                {leftSide.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={leftSide.correctAnswers.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLeftSide({...leftSide, correctAnswers: [...leftSide.correctAnswers, index]});
                        } else {
                          setLeftSide({...leftSide, correctAnswers: leftSide.correctAnswers.filter(a => a !== index)});
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...leftSide.options];
                        newOptions[index] = e.target.value;
                        setLeftSide({...leftSide, options: newOptions});
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right Side */}
            <Card>
              <CardContent className="pt-4">
                <input
                  type="text"
                  value={rightSide.label}
                  onChange={(e) => setRightSide({...rightSide, label: e.target.value})}
                  className="w-full p-2 mb-3 font-semibold text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Select</span>
                  <input
                    type="number"
                    value={rightSide.selectCount}
                    onChange={(e) => setRightSide({...rightSide, selectCount: parseInt(e.target.value) || 1})}
                    min="1"
                    max="6"
                    className="w-16 p-1 text-center rounded border"
                  />
                  <span className="text-sm">correct</span>
                </div>
                {rightSide.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={rightSide.correctAnswers.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRightSide({...rightSide, correctAnswers: [...rightSide.correctAnswers, index]});
                        } else {
                          setRightSide({...rightSide, correctAnswers: rightSide.correctAnswers.filter(a => a !== index)});
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...rightSide.options];
                        newOptions[index] = e.target.value;
                        setRightSide({...rightSide, options: newOptions});
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Rationale */}
      <div>
        <label className="block text-sm font-medium mb-1">Rationale / Explanation *</label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={3}
          placeholder="Explain why the correct answer(s) are correct..."
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={validateAndSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Question
        </Button>
      </div>
    </div>
  );
}

export default QuestionCreatorForm;

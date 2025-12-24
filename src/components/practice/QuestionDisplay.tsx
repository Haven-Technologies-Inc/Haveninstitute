import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  AlertCircle,
  BookOpen,
  Flag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface Option {
  id: string;
  text: string;
}

interface QuestionDisplayProps {
  question: {
    id: string;
    text: string;
    options: Option[];
    category: string;
    categoryLabel?: string;
    difficulty: string;
    questionType: string;
    questionNumber: number;
    totalQuestions: number;
    timeLimit?: number;
  };
  onSubmit: (answer: string[], timeSpent: number) => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    correctAnswers: string[];
    explanation: string;
  } | null;
  onNext?: () => void;
  isLoading?: boolean;
}

export function QuestionDisplay({
  question,
  onSubmit,
  showFeedback = false,
  feedback,
  onNext,
  isLoading = false
}: QuestionDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit || 0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isMultiSelect = question.questionType === 'select_all';
  const isOrdered = question.questionType === 'ordered_response';
  const progress = (question.questionNumber / question.totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      if (question.timeLimit) {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [question.timeLimit]);

  // Auto-submit on time out
  useEffect(() => {
    if (question.timeLimit && timeRemaining === 0 && !hasSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, question.timeLimit, hasSubmitted]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswers([]);
    setTimeSpent(0);
    setTimeRemaining(question.timeLimit || 0);
    setHasSubmitted(false);
  }, [question.id, question.timeLimit]);

  const handleOptionClick = useCallback((optionId: string) => {
    if (hasSubmitted) return;

    if (isMultiSelect) {
      setSelectedAnswers(prev => 
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else if (isOrdered) {
      setSelectedAnswers(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        }
        return [...prev, optionId];
      });
    } else {
      setSelectedAnswers([optionId]);
    }
  }, [hasSubmitted, isMultiSelect, isOrdered]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswers.length === 0) return;
    setHasSubmitted(true);
    onSubmit(selectedAnswers, timeSpent);
  }, [selectedAnswers, timeSpent, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = selectedAnswers.includes(optionId);
    
    if (showFeedback && feedback) {
      const isCorrect = feedback.correctAnswers.includes(optionId);
      if (isCorrect) {
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      }
      if (isSelected && !isCorrect) {
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      }
    }
    
    if (isSelected) {
      return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
    }
    
    return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
  };

  const getOrderNumber = (optionId: string) => {
    if (!isOrdered) return null;
    const index = selectedAnswers.indexOf(optionId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            Question {question.questionNumber} of {question.totalQuestions}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {question.categoryLabel || question.category.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {question.timeLimit ? (
            <div className={`flex items-center gap-2 ${
              timeRemaining < 30 ? 'text-red-500' : 'text-gray-500'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeSpent)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          {/* Question Type Indicator */}
          {isMultiSelect && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Select all that apply
              </span>
            </div>
          )}
          {isOrdered && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Flag className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Select options in the correct order
              </span>
            </div>
          )}

          {/* Question Text */}
          <p className="text-lg text-gray-900 dark:text-white leading-relaxed mb-6">
            {question.text}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const orderNum = getOrderNumber(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={hasSubmitted && showFeedback}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${getOptionStyle(option.id)}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedAnswers.includes(option.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {orderNum || String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 flex-1">
                    {option.text}
                  </span>
                  {showFeedback && feedback && (
                    <>
                      {feedback.correctAnswers.includes(option.id) && (
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                      {selectedAnswers.includes(option.id) && !feedback.correctAnswers.includes(option.id) && (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {showFeedback && feedback && (
        <Card className={feedback.correct 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
          : 'border-red-500 bg-red-50 dark:bg-red-900/10'
        }>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {feedback.correct ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="font-semibold text-red-700 dark:text-red-400">Incorrect</span>
                </>
              )}
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-gray-500 mt-0.5" />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {!hasSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0 || isLoading}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </span>
            ) : (
              'Submit Answer'
            )}
          </Button>
        ) : showFeedback && onNext ? (
          <Button
            onClick={onNext}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Next Question
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default QuestionDisplay;

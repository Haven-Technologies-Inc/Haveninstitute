/**
 * CAT Session Page - Active Computer Adaptive Test with real-time ability estimation
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import {
  Clock,
  Flag,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertTriangle,
  Calculator
} from 'lucide-react';
import { useCATSession, useSubmitCATAnswer, useCompleteCAT } from '../../services/hooks/useCAT';

export default function CATSessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  const { data: session, isLoading, error, refetch } = useCATSession(sessionId || '');
  const submitAnswerMutation = useSubmitCATAnswer();
  const completeCATMutation = useCompleteCAT();

  // Timer effect
  useEffect(() => {
    if (!session || session.status === 'completed') return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [session, startTime]);

  // Reset on new question
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
    setSelectedAnswer([]);
    setLastAnswerCorrect(null);
  }, [session?.questionsAnswered]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading CAT session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <AlertTriangle className="size-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This CAT session could not be found or has expired.
        </p>
        <Button onClick={() => navigate('/app/cat-test')}>Start New CAT Test</Button>
      </div>
    );
  }

  if (session.status === 'completed') {
    navigate(`/app/cat-test/result/${sessionId}`);
    return null;
  }

  const currentQuestion = session.currentQuestion;
  const questionsAnswered = session.questionsAnswered || 0;
  const passingProbability = session.passingProbability || 0.5;
  const abilityEstimate = session.currentAbility || 0;
  const standardError = session.standardError || 1;

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;
    
    if (currentQuestion?.type === 'select-all') {
      setSelectedAnswer(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedAnswer([optionId]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer.length === 0 || !sessionId || !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeSpent
      });

      setLastAnswerCorrect(result.isCorrect);
      setShowExplanation(true);

      // If test should stop, complete it
      if (result.shouldStop) {
        await completeCATMutation.mutateAsync(sessionId);
        navigate(`/app/cat-test/result/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = async () => {
    // Refetch to get the next question
    await refetch();
  };

  const handleFinishTest = async () => {
    if (!sessionId) return;
    
    try {
      await completeCATMutation.mutateAsync(sessionId);
      navigate(`/app/cat-test/result/${sessionId}`);
    } catch (error) {
      console.error('Failed to complete CAT:', error);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionsAnswered)) {
        newSet.delete(questionsAnswered);
      } else {
        newSet.add(questionsAnswered);
      }
      return newSet;
    });
  };

  const getAbilityTrend = () => {
    if (abilityEstimate > 0.5) return { icon: TrendingUp, color: 'text-green-600', label: 'Above Average' };
    if (abilityEstimate < -0.5) return { icon: TrendingDown, color: 'text-red-600', label: 'Below Average' };
    return { icon: Target, color: 'text-yellow-600', label: 'Average' };
  };

  const trend = getAbilityTrend();
  const TrendIcon = trend.icon;

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <Brain className="size-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Complete</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You have completed all available questions.
        </p>
        <Button onClick={handleFinishTest}>View Results</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {questionsAnswered + 1}
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="mr-2 size-4" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFinishTest}>
            End Test
          </Button>
        </div>
      </div>

      {/* Ability & Passing Probability Panel */}
      {questionsAnswered >= 5 && (
        <Card className="mb-4 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passing Probability</p>
                <p className={`text-3xl font-bold ${
                  passingProbability >= 0.6 ? 'text-green-600' : 
                  passingProbability >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(passingProbability * 100)}%
                </p>
              </div>
              <div className="text-center border-x border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ability Estimate</p>
                <div className="flex items-center justify-center gap-2">
                  <TrendIcon className={`size-5 ${trend.color}`} />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {abilityEstimate > 0 ? '+' : ''}{abilityEstimate.toFixed(2)}
                  </p>
                </div>
                <p className={`text-xs ${trend.color}`}>{trend.label}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ±{standardError.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Std Error</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Card */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge>{currentQuestion.category}</Badge>
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.difficulty}
                </Badge>
                {currentQuestion.type === 'select-all' && (
                  <Badge variant="secondary">Select All That Apply</Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlag}
              className={flaggedQuestions.has(questionsAnswered) ? 'text-yellow-500' : 'text-gray-400'}
            >
              <Flag className="size-5" fill={flaggedQuestions.has(questionsAnswered) ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option: { id: string; text: string }) => {
              const isSelected = selectedAnswer.includes(option.id);
              const isCorrect = currentQuestion.correctAnswers?.includes(option.id);
              const showCorrect = showExplanation && isCorrect;
              const showIncorrect = showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={showExplanation}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      showCorrect
                        ? 'border-green-500 bg-green-100 dark:bg-green-900'
                        : showIncorrect
                        ? 'border-red-500 bg-red-100 dark:bg-red-900'
                        : isSelected
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      <span className={`text-sm font-medium ${
                        showCorrect ? 'text-green-700 dark:text-green-300' : 
                        showIncorrect ? 'text-red-700 dark:text-red-300' : 
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.id.toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 text-gray-900 dark:text-white">{option.text}</span>
                    {showCorrect && <CheckCircle2 className="size-5 text-green-600 shrink-0" />}
                    {showIncorrect && <XCircle className="size-5 text-red-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${
                lastAnswerCorrect 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {lastAnswerCorrect ? (
                    <>
                      <CheckCircle2 className="size-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
                      <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                        Difficulty will increase
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      <span className="font-semibold text-red-700 dark:text-red-300">Incorrect</span>
                      <span className="text-sm text-red-600 dark:text-red-400 ml-2">
                        Difficulty will decrease
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <Lightbulb className="size-5 text-blue-600 mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation:</p>
                    <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer.length === 0 || submitAnswerMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                {submitAnswerMutation.isPending ? 'Submitting...' : 'Submit Answer'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CAT Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Questions adapt to your ability level • Min 75 questions • Pass/Fail determined by 95% confidence interval</p>
      </div>
    </div>
  );
}

/**
 * Practice Session Page
 * Runs the actual practice session with NextGen NCLEX question types
 * Supports adaptive (CAT) mode and all question formats
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Clock, 
  Flag,
  FlagOff,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { QuestionRenderer } from '../../components/practice/QuestionRenderer';
import { 
  nextGenQuestionBank, 
  getRandomQuestions 
} from '../../data/nextGenQuestionBank';
import { 
  calculateScore,
  type NextGenQuestion, 
  type QuestionAnswer,
  type NCLEXCategory,
  type QuestionType,
  NCLEX_CATEGORIES
} from '../../types/nextGenNCLEX';

interface SessionState {
  questions: NextGenQuestion[];
  currentIndex: number;
  answers: (QuestionAnswer | null)[];
  scores: number[];
  flagged: Set<number>;
  startTime: number;
  questionStartTimes: number[];
  timeSpent: number[];
  abilityLevel: number;
  isComplete: boolean;
  isPaused: boolean;
}

export default function PracticeSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse config from URL
  const config = {
    questionCount: parseInt(searchParams.get('questions') || '25'),
    difficulty: (searchParams.get('difficulty') || 'mixed') as 'easy' | 'medium' | 'hard' | 'mixed' | 'adaptive',
    timed: searchParams.get('timed') === 'true',
    timePerQuestion: parseInt(searchParams.get('timePerQuestion') || '90'),
    instantFeedback: searchParams.get('feedback') !== 'false',
    adaptive: searchParams.get('adaptive') === 'true',
    categories: searchParams.get('categories') === 'all' ? [] : (searchParams.get('categories')?.split(',') || []) as NCLEXCategory[],
    types: (searchParams.get('types')?.split(',') || ['multiple-choice', 'select-all']) as QuestionType[]
  };

  // Session state
  const [session, setSession] = useState<SessionState | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<QuestionAnswer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(config.timePerQuestion);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Initialize session
  useEffect(() => {
    try {
      let questions = getRandomQuestions(config.questionCount, {
        categories: config.categories.length > 0 ? config.categories : undefined,
        types: config.types.length > 0 ? config.types : undefined,
        difficulty: config.difficulty === 'adaptive' ? 'mixed' : config.difficulty
      });

      // If we don't have enough questions with filters, try without type filter
      if (questions.length < config.questionCount) {
        const moreQuestions = getRandomQuestions(config.questionCount - questions.length, {
          categories: config.categories.length > 0 ? config.categories : undefined,
          difficulty: config.difficulty === 'adaptive' ? 'mixed' : config.difficulty
        });
        questions = [...questions, ...moreQuestions];
      }

      // Still not enough? Get any questions
      if (questions.length === 0) {
        questions = getRandomQuestions(config.questionCount);
      }

      const finalQuestions = questions.slice(0, config.questionCount);

      if (finalQuestions.length === 0) {
        console.error('No questions available');
        navigate('/app/practice/unified');
        return;
      }

      setSession({
        questions: finalQuestions,
        currentIndex: 0,
        answers: new Array(finalQuestions.length).fill(null),
        scores: new Array(finalQuestions.length).fill(0),
        flagged: new Set(),
        startTime: Date.now(),
        questionStartTimes: [Date.now()],
        timeSpent: new Array(finalQuestions.length).fill(0),
        abilityLevel: 0,
        isComplete: false,
        isPaused: false
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
      navigate('/app/practice/unified');
    }
  }, []);

  // Timer for timed mode
  useEffect(() => {
    if (!session || !config.timed || session.isPaused || showFeedback) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitAnswer();
          return config.timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, config.timed, showFeedback]);

  // Reset timer on question change
  useEffect(() => {
    if (config.timed) {
      setTimeRemaining(config.timePerQuestion);
    }
  }, [session?.currentIndex]);

  const currentQuestion = session?.questions[session.currentIndex];

  const handleAnswerChange = useCallback((answer: QuestionAnswer) => {
    setCurrentAnswer(answer);
  }, []);

  const handleSubmitAnswer = () => {
    if (!session || !currentQuestion) return;

    const timeOnQuestion = Date.now() - session.questionStartTimes[session.currentIndex];
    const score = currentAnswer ? calculateScore(currentQuestion, currentAnswer) : 0;

    // Update session
    const newAnswers = [...session.answers];
    newAnswers[session.currentIndex] = currentAnswer;

    const newScores = [...session.scores];
    newScores[session.currentIndex] = score;

    const newTimeSpent = [...session.timeSpent];
    newTimeSpent[session.currentIndex] = timeOnQuestion;

    // Update ability level for adaptive mode
    let newAbility = session.abilityLevel;
    if (config.adaptive) {
      newAbility = score > 0.5
        ? Math.min(session.abilityLevel + 0.3, 3)
        : Math.max(session.abilityLevel - 0.3, -3);
    }

    setSession({
      ...session,
      answers: newAnswers,
      scores: newScores,
      timeSpent: newTimeSpent,
      abilityLevel: newAbility
    });

    if (config.instantFeedback) {
      setShowFeedback(true);
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    if (!session) return;

    setShowFeedback(false);
    setCurrentAnswer(null);

    if (session.currentIndex < session.questions.length - 1) {
      const newQuestionStartTimes = [...session.questionStartTimes];
      newQuestionStartTimes[session.currentIndex + 1] = Date.now();

      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
        questionStartTimes: newQuestionStartTimes
      });
    } else {
      // Complete the session
      setSession({
        ...session,
        isComplete: true
      });
      setShowResults(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (!session || session.currentIndex === 0) return;
    
    setShowFeedback(false);
    setCurrentAnswer(session.answers[session.currentIndex - 1]);
    setSession({
      ...session,
      currentIndex: session.currentIndex - 1
    });
  };

  const toggleFlag = () => {
    if (!session) return;
    
    const newFlagged = new Set(session.flagged);
    if (newFlagged.has(session.currentIndex)) {
      newFlagged.delete(session.currentIndex);
    } else {
      newFlagged.add(session.currentIndex);
    }
    
    setSession({
      ...session,
      flagged: newFlagged
    });
  };

  const togglePause = () => {
    if (!session) return;
    setSession({
      ...session,
      isPaused: !session.isPaused
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateResults = () => {
    if (!session) return null;

    const totalScore = session.scores.reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / session.questions.length) * 100);
    const totalTime = session.timeSpent.reduce((a, b) => a + b, 0);
    const avgTime = Math.round(totalTime / session.questions.length / 1000);

    // Category performance
    const categoryPerf: Record<string, { correct: number; total: number }> = {};
    session.questions.forEach((q, i) => {
      if (!categoryPerf[q.category]) {
        categoryPerf[q.category] = { correct: 0, total: 0 };
      }
      categoryPerf[q.category].total++;
      categoryPerf[q.category].correct += session.scores[i];
    });

    // Difficulty performance
    const diffPerf: Record<string, { correct: number; total: number }> = {};
    session.questions.forEach((q, i) => {
      if (!diffPerf[q.difficulty]) {
        diffPerf[q.difficulty] = { correct: 0, total: 0 };
      }
      diffPerf[q.difficulty].total++;
      diffPerf[q.difficulty].correct += session.scores[i];
    });

    return {
      totalScore,
      percentage,
      totalTime,
      avgTime,
      categoryPerf,
      diffPerf,
      questionsAnswered: session.answers.filter(a => a !== null).length,
      flaggedCount: session.flagged.size
    };
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!currentQuestion || session.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600 dark:text-gray-400">No questions available for your selection.</p>
        <Button onClick={() => navigate('/app/practice/unified')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Practice Setup
        </Button>
      </div>
    );
  }

  const progress = ((session.currentIndex + 1) / session.questions.length) * 100;
  const results = showResults ? calculateResults() : null;

  // Results Screen
  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="border-2 border-green-400">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-3xl">Practice Complete!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Main Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{results.percentage}%</div>
              <p className="text-gray-600 dark:text-gray-400">
                {results.totalScore.toFixed(1)} / {session.questions.length} questions correct
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold">{results.questionsAnswered}</p>
                <p className="text-sm text-gray-500">Answered</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold">{results.avgTime}s</p>
                <p className="text-sm text-gray-500">Avg Time</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold">{results.flaggedCount}</p>
                <p className="text-sm text-gray-500">Flagged</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold">{formatTime(Math.round(results.totalTime / 1000))}</p>
                <p className="text-sm text-gray-500">Total Time</p>
              </div>
            </div>

            {/* Category Performance */}
            <div>
              <h3 className="font-semibold mb-3">Performance by Category</h3>
              <div className="space-y-2">
                {Object.entries(results.categoryPerf).map(([cat, perf]) => {
                  const catInfo = NCLEX_CATEGORIES.find(c => c.id === cat);
                  const pct = Math.round((perf.correct / perf.total) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-6">{catInfo?.icon}</span>
                      <span className="flex-1 text-sm truncate">{catInfo?.name || cat}</span>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Performance */}
            <div>
              <h3 className="font-semibold mb-3">Performance by Difficulty</h3>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map(diff => {
                  const perf = results.diffPerf[diff];
                  if (!perf) return null;
                  const pct = Math.round((perf.correct / perf.total) * 100);
                  return (
                    <div key={diff} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-lg font-bold">{pct}%</p>
                      <p className="text-sm text-gray-500 capitalize">{diff}</p>
                      <p className="text-xs text-gray-400">{perf.total} questions</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/app/practice')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Practice
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => setShowExitDialog(true)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>
        
        <div className="flex items-center gap-4">
          {config.timed && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              timeRemaining < 30 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFlag}
            className={session.flagged.has(session.currentIndex) ? 'text-yellow-600' : ''}
          >
            {session.flagged.has(session.currentIndex) ? (
              <Flag className="w-4 h-4 fill-current" />
            ) : (
              <FlagOff className="w-4 h-4" />
            )}
          </Button>

          {config.timed && (
            <Button variant="ghost" size="sm" onClick={togglePause}>
              {session.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">
            Question {session.currentIndex + 1} of {session.questions.length}
          </span>
          {config.adaptive && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Ability:</span>
              {session.abilityLevel > 0.5 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : session.abilityLevel < -0.5 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-500" />
              )}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Pause Overlay */}
      {session.isPaused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center">
            <Pause className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Paused</h2>
            <p className="text-gray-500 mb-4">Click resume to continue</p>
            <Button onClick={togglePause}>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </Card>
        </div>
      )}

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <QuestionRenderer
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            showFeedback={showFeedback}
            disabled={showFeedback}
            questionNumber={session.currentIndex + 1}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={session.currentIndex === 0 || showFeedback}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Question dots/numbers for quick navigation */}
          <div className="hidden md:flex items-center gap-1">
            {session.questions.slice(
              Math.max(0, session.currentIndex - 3),
              Math.min(session.questions.length, session.currentIndex + 4)
            ).map((_, i) => {
              const actualIndex = Math.max(0, session.currentIndex - 3) + i;
              const isAnswered = session.answers[actualIndex] !== null;
              const isCurrent = actualIndex === session.currentIndex;
              const isFlagged = session.flagged.has(actualIndex);
              
              return (
                <button
                  key={actualIndex}
                  onClick={() => !showFeedback && setSession({...session, currentIndex: actualIndex})}
                  disabled={showFeedback}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                  } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {actualIndex + 1}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback ? (
          <Button onClick={goToNextQuestion} className="bg-blue-600">
            {session.currentIndex < session.questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                View Results
                <Trophy className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={currentAnswer === null}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit Answer
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Practice Session?</DialogTitle>
            <DialogDescription>
              You have answered {session.answers.filter(a => a !== null).length} of {session.questions.length} questions.
              Your progress will not be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowExitDialog(false)}>
              Continue Practice
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => navigate('/app/practice')}>
              Exit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

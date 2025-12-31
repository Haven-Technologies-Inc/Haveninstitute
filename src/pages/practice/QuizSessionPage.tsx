/**
 * Quiz Session Page - Active quiz with questions and answer submission
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  Bookmark,
  BookmarkCheck,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useQuizSession, useSubmitQuizAnswer, useCompleteQuiz } from '../../services/hooks/useQuiz';
import { useExplainQuestion } from '../../services/hooks/useAI';

interface Answer {
  questionId: string;
  selectedAnswer: string[];
  isCorrect?: boolean;
  timeSpent: number;
}

export default function QuizSessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const { data: session, isLoading, error } = useQuizSession(sessionId || '');
  const submitAnswerMutation = useSubmitQuizAnswer();
  const completeQuizMutation = useCompleteQuiz();
  const explainMutation = useExplainQuestion();

  // Timer effect
  useEffect(() => {
    if (!session || session.status === 'completed') return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [session, startTime]);

  // Reset question start time when navigating
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setShowExplanation(false);
    setSelectedAnswers([]);
    setAiExplanation(null);
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <AlertTriangle className="size-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This quiz session could not be found or has expired.
        </p>
        <Button onClick={() => navigate('/app/practice/quiz')}>Start New Quiz</Button>
      </div>
    );
  }

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;

  const handleAnswerSelect = (optionId: string) => {
    if (showExplanation) return;
    
    if (currentQuestion.type === 'select_all') {
      // Toggle selection for SATA questions
      setSelectedAnswers(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single selection for multiple choice
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswers.length === 0 || !sessionId || !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        answer: selectedAnswers,
        timeSpent
      });

      // Store answer
      const answer: Answer = {
        questionId: currentQuestion.id,
        selectedAnswer: selectedAnswers,
        isCorrect: result.isCorrect,
        timeSpent
      };
      
      setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleGetAIExplanation = async () => {
    if (!currentQuestion) return;
    
    try {
      const result = await explainMutation.mutateAsync({
        questionText: currentQuestion.text,
        correctAnswer: currentQuestion.options
          .filter((o: any) => currentQuestion.correctAnswers.includes(o.id))
          .map((o: any) => o.text)
          .join(', '),
        userAnswer: selectedAnswers
          .map(id => currentQuestion.options.find((o: any) => o.id === id)?.text)
          .join(', '),
        topic: currentQuestion.category
      });
      
      setAiExplanation(result.explanation);
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishQuiz = async () => {
    if (!sessionId) return;
    
    try {
      await completeQuizMutation.mutateAsync(sessionId);
      navigate(`/app/quiz/result/${sessionId}`);
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  };

  const toggleBookmark = () => {
    const questionId = currentQuestion.id;
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const currentAnswer = answers.get(currentQuestion?.id);
  const isBookmarked = bookmarkedQuestions.has(currentQuestion?.id);

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <p>No questions available</p>
        <Button onClick={() => navigate('/app/practice/quiz')}>Start New Quiz</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="mr-2 size-4" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {answeredCount}/{questions.length} answered
          </Badge>
          <Button variant="outline" onClick={handleFinishQuiz}>
            Finish Quiz
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge>{currentQuestion.category}</Badge>
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.difficulty}
                </Badge>
                {currentQuestion.type === 'select_all' && (
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
              onClick={toggleBookmark}
              className={isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="size-5" fill="currentColor" />
              ) : (
                <Bookmark className="size-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option: { id: string; text: string }) => {
              const isSelected = selectedAnswers.includes(option.id);
              const isCorrect = currentQuestion.correctAnswers.includes(option.id);
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
                currentAnswer?.isCorrect 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentAnswer?.isCorrect ? (
                    <>
                      <CheckCircle2 className="size-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-5 text-red-600" />
                      <span className="font-semibold text-red-700 dark:text-red-300">Incorrect</span>
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

              {/* AI Explanation */}
              {aiExplanation ? (
                <div className="bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-xl">🤖</span>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">AI Tutor Explanation:</p>
                      <p className="text-purple-800 dark:text-purple-200 whitespace-pre-wrap">{aiExplanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleGetAIExplanation}
                  disabled={explainMutation.isPending}
                  className="w-full"
                >
                  {explainMutation.isPending ? 'Getting AI explanation...' : '🤖 Get AI Explanation'}
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswers.length === 0 || submitAnswerMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                {submitAnswerMutation.isPending ? 'Submitting...' : 'Submit Answer'}
              </Button>
            ) : (
              <Button
                onClick={currentIndex < questions.length - 1 ? handleNextQuestion : handleFinishQuiz}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextQuestion}
          disabled={currentIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

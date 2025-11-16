import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  Eye,
  Bookmark,
  BookmarkCheck,
  Filter,
  Shuffle,
  Award,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react';
import { quizTopics, enhancedQuizBank, getQuizQuestions, getRandomQuestions, type QuizQuestion } from '../data/enhancedQuizBank';

interface PracticeQuizEnhancedProps {
  onBack: () => void;
  onComplete?: (result: any) => void;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  bookmarked: boolean;
}

export function PracticeQuizEnhanced({ onBack, onComplete }: PracticeQuizEnhancedProps) {
  // Selection state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  // Timer
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizComplete) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizComplete, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = (topicId: string) => {
    let quizQuestions: QuizQuestion[] = [];
    
    if (shuffleQuestions) {
      quizQuestions = getRandomQuestions(topicId, questionCount);
    } else {
      quizQuestions = getQuizQuestions(topicId, questionCount);
    }

    // Filter by difficulty if selected
    if (selectedDifficulty !== 'all') {
      quizQuestions = quizQuestions.filter(q => q.difficulty === selectedDifficulty);
      if (quizQuestions.length < questionCount) {
        quizQuestions = getQuizQuestions(topicId).filter(q => q.difficulty === selectedDifficulty);
      }
    }

    setQuestions(quizQuestions.slice(0, questionCount));
    setSelectedTopic(topicId);
    setQuizStarted(true);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === question.correctAnswer;

    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
      timeSpent,
      bookmarked: bookmarkedQuestions.has(currentQuestionIndex)
    };

    setAnswers([...answers, newAnswer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const toggleBookmark = () => {
    const newBookmarked = new Set(bookmarkedQuestions);
    if (newBookmarked.has(currentQuestionIndex)) {
      newBookmarked.delete(currentQuestionIndex);
    } else {
      newBookmarked.add(currentQuestionIndex);
    }
    setBookmarkedQuestions(newBookmarked);
  };

  const finishQuiz = () => {
    setQuizComplete(true);
    
    if (onComplete) {
      const score = answers.filter(a => a.isCorrect).length;
      onComplete({
        topic: selectedTopic,
        score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        timeSpent: elapsedTime,
        answers,
        questions
      });
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setBookmarkedQuestions(new Set());
    setQuizComplete(false);
    setShowReview(false);
    setElapsedTime(0);
  };

  // Topic Selection Screen
  if (!quizStarted && !quizComplete) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                <Brain className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Practice Quiz</CardTitle>
            <CardDescription className="text-lg">
              Choose a topic and customize your practice session
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quiz Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="size-5 text-blue-600" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Questions */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Number of Questions</label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20, 25].map(num => (
                  <Button
                    key={num}
                    variant={questionCount === num ? 'default' : 'outline'}
                    onClick={() => setQuestionCount(num)}
                    className="w-full"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Difficulty Level</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'all', label: 'All Levels', icon: Target },
                  { value: 'easy', label: 'Easy', icon: Zap },
                  { value: 'medium', label: 'Medium', icon: TrendingUp },
                  { value: 'hard', label: 'Hard', icon: Award }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedDifficulty === value ? 'default' : 'outline'}
                    onClick={() => setSelectedDifficulty(value as any)}
                    className="w-full"
                  >
                    <Icon className="mr-2 size-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Shuffle Questions */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shuffle className="size-5 text-purple-600" />
                <div>
                  <p className="text-gray-900">Shuffle Questions</p>
                  <p className="text-xs text-gray-600">Randomize question order</p>
                </div>
              </div>
              <Button
                variant={shuffleQuestions ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
              >
                {shuffleQuestions ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <div>
          <h3 className="text-xl text-gray-900 mb-4">Select a Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quizTopics.map(topic => (
              <Card
                key={topic.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-400"
                onClick={() => handleStartQuiz(topic.id)}
              >
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-5xl">{topic.icon}</div>
                    <div>
                      <h4 className="text-gray-900 mb-1">{topic.name}</h4>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline">{topic.totalQuestions} questions</Badge>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Play className="mr-2 size-4" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results/Review Screen
  if (quizComplete) {
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);
    const avgTimePerQuestion = Math.round(elapsedTime / questions.length);

    // Category breakdown
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    answers.forEach((answer, idx) => {
      const question = questions[idx];
      if (!categoryStats[question.subcategory]) {
        categoryStats[question.subcategory] = { correct: 0, total: 0 };
      }
      categoryStats[question.subcategory].total += 1;
      if (answer.isCorrect) {
        categoryStats[question.subcategory].correct += 1;
      }
    });

    if (showReview) {
      return (
        <div className="max-w-5xl mx-auto p-4">
          <Button variant="ghost" onClick={() => setShowReview(false)} className="mb-6">
            <ArrowLeft className="mr-2 size-4" />
            Back to Results
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>Review all {questions.length} questions with explanations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {answers.map((answer, idx) => {
                const question = questions[idx];
                return (
                  <div key={idx} className={`p-4 border-2 rounded-xl ${
                    answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="size-6 text-green-600 mt-1 shrink-0" />
                      ) : (
                        <XCircle className="size-6 text-red-600 mt-1 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline">{question.subcategory}</Badge>
                          <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
                          {answer.bookmarked && <Badge className="bg-yellow-500">Bookmarked</Badge>}
                          <Badge variant="outline">{answer.timeSpent}s</Badge>
                        </div>
                        <p className="text-gray-900 mb-3"><strong>Q{idx + 1}:</strong> {question.question}</p>
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-3 border-2 rounded-lg ${
                                optIdx === question.correctAnswer
                                  ? 'border-green-500 bg-green-100'
                                  : optIdx === answer.selectedAnswer
                                  ? 'border-red-500 bg-red-100'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">{String.fromCharCode(65 + optIdx)}.</span>
                                <span className="text-gray-900 flex-1">{option}</span>
                                {optIdx === question.correctAnswer && (
                                  <CheckCircle2 className="size-5 text-green-600" />
                                )}
                                {optIdx === answer.selectedAnswer && optIdx !== question.correctAnswer && (
                                  <XCircle className="size-5 text-red-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900 mb-2"><strong>Explanation:</strong></p>
                          <p className="text-sm text-blue-800 mb-3">{question.explanation}</p>
                          <p className="text-sm text-blue-800"><strong>Rationale:</strong> {question.rationale}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto p-4">
        <Card className="border-2 border-blue-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-2xl ${
                percentage >= 80 ? 'bg-green-600' : percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                <Award className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription className="text-lg">Great work on completing the practice quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="text-center">
                <div className={`text-7xl mb-4 ${
                  percentage >= 80 ? 'text-green-600' :
                  percentage >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {percentage}%
                </div>
                <p className="text-xl text-gray-700 mb-4">
                  {score} out of {questions.length} correct
                </p>
                <Progress value={percentage} className="h-4" />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="size-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{formatTime(elapsedTime)}</p>
                  <p className="text-sm text-gray-600">Total Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="size-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{avgTimePerQuestion}s</p>
                  <p className="text-sm text-gray-600">Avg per Question</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bookmark className="size-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{bookmarkedQuestions.size}</p>
                  <p className="text-sm text-gray-600">Bookmarked</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-blue-600" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryStats).map(([category, stats]) => {
                  const catPercentage = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {stats.correct}/{stats.total}
                          </span>
                          <Badge variant={catPercentage >= 80 ? 'default' : catPercentage >= 60 ? 'secondary' : 'destructive'}>
                            {catPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={catPercentage} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Personalized Feedback */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle>Personalized Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {percentage >= 80 ? (
                  <div className="flex gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                    <div>
                      <p className="text-green-900 mb-2"><strong>Excellent Performance!</strong></p>
                      <p className="text-sm text-green-800">
                        You demonstrate strong understanding of this topic. Keep up the great work and continue practicing to maintain mastery.
                      </p>
                    </div>
                  </div>
                ) : percentage >= 60 ? (
                  <div className="flex gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <TrendingUp className="size-6 text-yellow-600 shrink-0" />
                    <div>
                      <p className="text-yellow-900 mb-2"><strong>Good Progress!</strong></p>
                      <p className="text-sm text-yellow-800">
                        You're on the right track. Review the explanations for missed questions and focus on weaker categories to improve your score.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <XCircle className="size-6 text-red-600 shrink-0" />
                    <div>
                      <p className="text-red-900 mb-2"><strong>Keep Studying!</strong></p>
                      <p className="text-sm text-red-800">
                        This topic needs more attention. Review your study materials, practice more questions, and focus on understanding the rationales behind each answer.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowReview(true)} variant="outline" className="flex-1">
                <Eye className="mr-2 size-4" />
                Review Questions
              </Button>
              <Button onClick={restartQuiz} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 size-4" />
                New Quiz
              </Button>
              <Button onClick={onBack} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Question Screen
  const question = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="mr-2 size-4" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>
        <Button variant="outline" onClick={onBack}>
          Exit Quiz
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge>{question.subcategory}</Badge>
                <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
                {question.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className={bookmarkedQuestions.has(currentQuestionIndex) ? 'text-yellow-500' : 'text-gray-400'}
            >
              {bookmarkedQuestions.has(currentQuestionIndex) ? (
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
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showExplanation && isCorrect;
              const showIncorrect = showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      showCorrect
                        ? 'border-green-500 bg-green-100'
                        : showIncorrect
                        ? 'border-red-500 bg-red-100'
                        : isSelected
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-300'
                    }`}>
                      <span className={showCorrect ? 'text-green-700' : showIncorrect ? 'text-red-700' : 'text-gray-700'}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <span className="flex-1 text-gray-900">{option}</span>
                    {showCorrect && <CheckCircle2 className="size-5 text-green-600 shrink-0" />}
                    {showIncorrect && <XCircle className="size-5 text-red-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-blue-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="text-blue-900 mb-2"><strong>Explanation:</strong></p>
                  <p className="text-blue-800 mb-3">{question.explanation}</p>
                  <p className="text-blue-800 text-sm"><strong>Detailed Rationale:</strong> {question.rationale}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

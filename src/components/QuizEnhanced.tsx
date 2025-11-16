import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress as ProgressBar } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { QuizResult } from '../App';
import { quizData } from '../data/quizData';

interface QuizProps {
  topic: string;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  flagged: boolean;
}

interface QuizConfig {
  category: string;
  subcategory: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timed: boolean;
  timerDuration: number; // in minutes
}

export function Quiz({ topic, onComplete, onBack }: QuizProps) {
  // Configuration state
  const [showConfig, setShowConfig] = useState(true);
  const [config, setConfig] = useState<QuizConfig>({
    category: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    questionCount: 10,
    difficulty: 'mixed',
    timed: false,
    timerDuration: 30
  });

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showReview, setShowReview] = useState(false);

  const questions = quizData[topic] || quizData['fundamentals'];
  const filteredQuestions = questions.slice(0, config.questionCount);
  const question = filteredQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / filteredQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (!showConfig && config.timed && timeRemaining > 0 && !quizFinished && !showExplanation) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showConfig, config.timed, timeRemaining, quizFinished, showExplanation]);

  const handleStartQuiz = () => {
    setShowConfig(false);
    if (config.timed) {
      setTimeRemaining(config.timerDuration * 60);
    }
    setQuestionStartTime(Date.now());
  };

  const handleQuizTimeout = () => {
    setQuizFinished(true);
    const score = answers.filter(a => a.isCorrect).length;
    completeQuiz(score);
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    setAnswers([
      ...answers,
      {
        questionIndex: currentQuestion,
        selectedAnswer,
        isCorrect,
        timeSpent,
        flagged: flaggedQuestions.has(currentQuestion)
      }
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const score = answers.filter(a => a.isCorrect).length + (selectedAnswer === question.correctAnswer ? 1 : 0);
    completeQuiz(score);
  };

  const completeQuiz = (score: number) => {
    const totalTimeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    
    onComplete({
      topic: `${config.category} - ${config.subcategory}`,
      score,
      total: filteredQuestions.length,
      date: new Date(),
      timeSpent: totalTimeSpent,
      difficulty: config.difficulty,
      questionDetails: answers.map((a, idx) => ({
        question: filteredQuestions[a.questionIndex].question,
        correct: a.isCorrect,
        category: config.category,
        difficulty: config.difficulty
      }))
    });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlaggedQuestions(newFlagged);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Configuration Screen
  if (showConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Target className="size-6 text-white" />
              </div>
              Configure Your Practice Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label>NCLEX Category</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nclexCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setConfig({ ...config, category: cat.name, subcategory: cat.subcategories[0] });
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      config.category === cat.name
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{cat.subcategories.length} subcategories</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Selection */}
            {config.category && (
              <div className="space-y-3">
                <Label>Subcategory</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nclexCategories
                    .find(c => c.name === config.category)
                    ?.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setConfig({ ...config, subcategory: sub })}
                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                          config.subcategory === sub
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <p className="text-sm text-gray-900">{sub}</p>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Question Count */}
            <div className="space-y-3">
              <Label>Number of Questions</Label>
              <div className="flex gap-3">
                {[5, 10, 15, 20, 25, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => setConfig({ ...config, questionCount: count })}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      config.questionCount === count
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['easy', 'medium', 'hard', 'mixed'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setConfig({ ...config, difficulty: diff as any })}
                    className={`p-3 border-2 rounded-lg capitalize transition-all ${
                      config.difficulty === diff
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Option */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Timed Quiz</Label>
                <button
                  onClick={() => setConfig({ ...config, timed: !config.timed })}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    config.timed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {config.timed ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {config.timed && (
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="180"
                    value={config.timerDuration}
                    onChange={(e) => setConfig({ ...config, timerDuration: parseInt(e.target.value) || 30 })}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleStartQuiz} size="lg" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                Start Quiz
                <ChevronRight className="ml-2 size-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Finished - Results Screen
  if (quizFinished) {
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = Math.round(totalTime / answers.length);
    
    if (showReview) {
      return (
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setShowReview(false)} className="mb-6">
            <ArrowLeft className="mr-2 size-4" />
            Back to Results
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {answers.map((answer, idx) => {
                const q = filteredQuestions[answer.questionIndex];
                return (
                  <div key={idx} className={`p-4 border-2 rounded-lg ${
                    answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="size-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="size-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="text-gray-900 mb-2"><strong>Q{idx + 1}:</strong> {q.question}</p>
                        <p className="text-sm text-gray-700">
                          <strong>Your answer:</strong> {q.options[answer.selectedAnswer]}
                          {!answer.isCorrect && (
                            <>
                              <br />
                              <strong className="text-green-700">Correct answer:</strong> {q.options[q.correctAnswer]}
                            </>
                          )}
                        </p>
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900"><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button onClick={() => setShowReview(false)} className="w-full">
                Back to Results
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-3">
              <Award className="size-8 text-yellow-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-7xl mb-4 ${
                percentage >= 80 ? 'text-green-600' :
                percentage >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {percentage}%
              </div>
              <p className="text-xl text-gray-600">
                You got {score} out of {filteredQuestions.length} questions correct
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="size-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{formatTime(totalTime)}</p>
                  <p className="text-sm text-gray-600">Total Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="size-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{avgTime}s</p>
                  <p className="text-sm text-gray-600">Avg per Question</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="size-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{percentage}%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Message */}
            {percentage >= 80 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="size-6 text-green-600" />
                  <div>
                    <p className="text-green-900">Excellent work!</p>
                    <p className="text-green-700 text-sm">You're well prepared for this topic. Keep up the great work!</p>
                  </div>
                </div>
              </div>
            )}
            
            {percentage >= 60 && percentage < 80 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-6 text-yellow-600" />
                  <div>
                    <p className="text-yellow-900">Good effort!</p>
                    <p className="text-yellow-700 text-sm">Review the explanations to strengthen your understanding.</p>
                  </div>
                </div>
              </div>
            )}
            
            {percentage < 60 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <XCircle className="size-6 text-red-600" />
                  <div>
                    <p className="text-red-900">Keep practicing!</p>
                    <p className="text-red-700 text-sm">Review this topic and try again. You'll improve with practice!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowReview(true)} variant="outline" className="flex-1">
                <Eye className="mr-2 size-4" />
                Review Answers
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 size-4" />
                Retake Quiz
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

  // Active Quiz Screen
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Exit Quiz
        </Button>

        <div className="flex items-center gap-4">
          {config.timed && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <Clock className="size-5" />
              <span className="text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <Badge variant="outline">
            Question {currentQuestion + 1} of {filteredQuestions.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{config.category}</Badge>
                <Badge variant="outline">{config.subcategory}</Badge>
                <Badge variant="outline" className="capitalize">{config.difficulty}</Badge>
              </div>
              <CardTitle className="text-xl">{question.question}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlag}
              className={flaggedQuestions.has(currentQuestion) ? 'text-yellow-500' : 'text-gray-400'}
            >
              <Flag className="size-5" fill={flaggedQuestions.has(currentQuestion) ? 'currentColor' : 'none'} />
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
                    <div className={`size-8 rounded-full flex items-center justify-center border-2 ${
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
                    {showCorrect && <CheckCircle2 className="size-5 text-green-600" />}
                    {showIncorrect && <XCircle className="size-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-blue-900 mb-1"><strong>Explanation:</strong></p>
                  <p className="text-blue-800">{question.explanation}</p>
                  {question.rationale && (
                    <p className="text-blue-700 text-sm mt-2"><strong>Rationale:</strong> {question.rationale}</p>
                  )}
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
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {currentQuestion < filteredQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ChevronRight className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const nclexCategories = [
  {
    name: 'Safe and Effective Care Environment',
    subcategories: ['Management of Care', 'Safety and Infection Control']
  },
  {
    name: 'Health Promotion and Maintenance',
    subcategories: ['Growth and Development', 'Prevention and Early Detection']
  },
  {
    name: 'Psychosocial Integrity',
    subcategories: ['Coping Mechanisms', 'Mental Health Concepts']
  },
  {
    name: 'Physiological Integrity',
    subcategories: [
      'Basic Care and Comfort',
      'Pharmacological Therapies',
      'Reduction of Risk Potential',
      'Physiological Adaptation'
    ]
  }
];
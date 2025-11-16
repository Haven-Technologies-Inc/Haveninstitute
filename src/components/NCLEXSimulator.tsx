import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  ArrowLeft,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Play,
  Pause,
  Flag,
  Eye,
  RotateCcw,
  FileText,
  Activity,
  Timer,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Star
} from 'lucide-react';
import { nclexQuestionBank, type Question } from '../data/nclexQuestionBank';

interface NCLEXSimulatorProps {
  onBack: () => void;
  onComplete?: (result: any) => void;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  flagged: boolean;
  difficulty: string;
  category: string;
  subcategory: string;
  abilityLevel: number;
}

interface CATState {
  abilityLevel: number; // Current estimated ability (-3 to +3)
  questionsAnswered: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
}

// NCLEX timing: 5 hours for 85-145 questions = 3.5 minutes per question average
const TOTAL_TEST_TIME = 5 * 60 * 60; // 5 hours in seconds
const TIME_PER_QUESTION = Math.floor(TOTAL_TEST_TIME / 85); // ~211 seconds per question

export function NCLEXSimulator({ onBack, onComplete }: NCLEXSimulatorProps) {
  const [simulatorStarted, setSimulatorStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TEST_TIME);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // CAT State
  const [catState, setCatState] = useState<CATState>({
    abilityLevel: 0, // Start at medium difficulty
    questionsAnswered: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    categoryPerformance: {}
  });

  const totalQuestions = 85;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Initialize CAT - select adaptive questions
  useEffect(() => {
    if (simulatorStarted && selectedQuestions.length === 0) {
      initializeCATTest();
    }
  }, [simulatorStarted]);

  // Timer countdown
  useEffect(() => {
    if (!simulatorStarted || testComplete || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest(); // Auto-finish when time runs out
          return 0;
        }
        
        // Show warning at 30 minutes remaining
        if (prev === 30 * 60 && !showTimeWarning) {
          setShowTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulatorStarted, testComplete, isPaused]);

  const initializeCATTest = () => {
    // Start with medium difficulty questions from each category
    const categorizedQuestions: Record<string, Question[]> = {};
    
    nclexQuestionBank.forEach(q => {
      if (!categorizedQuestions[q.subcategory]) {
        categorizedQuestions[q.subcategory] = [];
      }
      categorizedQuestions[q.subcategory].push(q);
    });

    // Select initial medium questions
    const initial: Question[] = [];
    Object.values(categorizedQuestions).forEach(catQuestions => {
      const mediumQuestions = catQuestions.filter(q => q.difficulty === 'medium');
      if (mediumQuestions.length > 0) {
        initial.push(mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)]);
      }
    });

    setSelectedQuestions(initial);
  };

  const getNextCATQuestion = (isCorrect: boolean, currentCategory: string): Question => {
    // Update ability level based on answer
    const newAbilityLevel = isCorrect 
      ? Math.min(catState.abilityLevel + 0.3, 3)
      : Math.max(catState.abilityLevel - 0.3, -3);

    // Determine difficulty based on ability level
    let targetDifficulty: 'easy' | 'medium' | 'hard';
    if (newAbilityLevel < -1) {
      targetDifficulty = 'easy';
    } else if (newAbilityLevel > 1) {
      targetDifficulty = 'hard';
    } else {
      targetDifficulty = 'medium';
    }

    // Find questions matching difficulty that haven't been asked
    const askedIds = new Set(selectedQuestions.map(q => q.id));
    const availableQuestions = nclexQuestionBank.filter(q => 
      !askedIds.has(q.id) && q.difficulty === targetDifficulty
    );

    // Prioritize different category for variety
    const differentCategory = availableQuestions.filter(q => q.subcategory !== currentCategory);
    const questionPool = differentCategory.length > 0 ? differentCategory : availableQuestions;

    if (questionPool.length === 0) {
      // Fallback: any unanswered question
      const fallback = nclexQuestionBank.filter(q => !askedIds.has(q.id));
      return fallback[Math.floor(Math.random() * fallback.length)] || nclexQuestionBank[0];
    }

    return questionPool[Math.floor(Math.random() * questionPool.length)];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSimulator = () => {
    setSimulatorStarted(true);
    setQuestionStartTime(Date.now());
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = selectedQuestions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update CAT state
    const newConsecutiveCorrect = isCorrect ? catState.consecutiveCorrect + 1 : 0;
    const newConsecutiveIncorrect = !isCorrect ? catState.consecutiveIncorrect + 1 : 0;

    const categoryKey = question.subcategory;
    const categoryPerf = catState.categoryPerformance[categoryKey] || { correct: 0, total: 0 };
    const newCategoryPerformance = {
      ...catState.categoryPerformance,
      [categoryKey]: {
        correct: categoryPerf.correct + (isCorrect ? 1 : 0),
        total: categoryPerf.total + 1
      }
    };

    const newCatState: CATState = {
      abilityLevel: isCorrect 
        ? Math.min(catState.abilityLevel + 0.3, 3)
        : Math.max(catState.abilityLevel - 0.3, -3),
      questionsAnswered: catState.questionsAnswered + 1,
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveIncorrect: newConsecutiveIncorrect,
      categoryPerformance: newCategoryPerformance
    };

    setCatState(newCatState);

    // Record answer
    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
      timeSpent,
      flagged: flaggedQuestions.has(currentQuestionIndex),
      difficulty: question.difficulty,
      category: question.category,
      subcategory: question.subcategory,
      abilityLevel: newCatState.abilityLevel
    };

    setAnswers([...answers, newAnswer]);

    // Get next adaptive question if not at the end
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextQuestion = getNextCATQuestion(isCorrect, question.subcategory);
      setSelectedQuestions([...selectedQuestions, nextQuestion]);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      finishTest();
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex);
    } else {
      newFlagged.add(currentQuestionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const calculatePassingProbability = (): number => {
    // NCLEX passing standard is based on ability level
    // Ability level of 0 = 50% chance, +3 = 95%, -3 = 5%
    const finalAbility = catState.abilityLevel;
    const baseProbability = 50;
    const abilityBonus = finalAbility * 15; // Each point adds/subtracts 15%
    const probability = Math.max(5, Math.min(95, baseProbability + abilityBonus));
    return Math.round(probability);
  };

  const generateComprehensiveReport = () => {
    const subcategoryStats: Record<string, { correct: number; total: number; percentage: number }> = {};
    
    answers.forEach(answer => {
      if (!subcategoryStats[answer.subcategory]) {
        subcategoryStats[answer.subcategory] = { correct: 0, total: 0, percentage: 0 };
      }
      subcategoryStats[answer.subcategory].correct += answer.isCorrect ? 1 : 0;
      subcategoryStats[answer.subcategory].total += 1;
    });

    // Calculate percentages
    Object.keys(subcategoryStats).forEach(key => {
      const stat = subcategoryStats[key];
      stat.percentage = Math.round((stat.correct / stat.total) * 100);
    });

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(subcategoryStats).forEach(([category, stats]) => {
      if (stats.percentage >= 75) {
        strengths.push(category);
      } else if (stats.percentage < 60) {
        weaknesses.push(category);
      }
    });

    // Calculate difficulty distribution
    const difficultyStats = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    answers.forEach(answer => {
      const diff = answer.difficulty as keyof typeof difficultyStats;
      difficultyStats[diff].correct += answer.isCorrect ? 1 : 0;
      difficultyStats[diff].total += 1;
    });

    return {
      subcategoryStats,
      strengths,
      weaknesses,
      difficultyStats,
      finalAbilityLevel: catState.abilityLevel,
      passingProbability: calculatePassingProbability()
    };
  };

  const finishTest = () => {
    setTestComplete(true);
    const report = generateComprehensiveReport();
    
    if (onComplete) {
      const score = answers.filter(a => a.isCorrect).length;
      onComplete({
        score,
        total: totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        timeSpent: TOTAL_TEST_TIME - timeRemaining,
        answers,
        catState,
        report,
        passingProbability: report.passingProbability
      });
    }
  };

  // Start Screen
  if (!simulatorStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                <Brain className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">NCLEX-RN Simulator</CardTitle>
            <CardDescription className="text-lg">
              Computer Adaptive Testing (CAT) with Comprehensive Analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-xl text-gray-900 mb-4">Standardized CAT Test</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-lg text-gray-900"><strong>85 items</strong></p>
                    <p className="text-xs text-gray-500">Adaptive difficulty</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Timer className="size-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time Limit</p>
                    <p className="text-lg text-gray-900"><strong>5 Hours</strong></p>
                    <p className="text-xs text-gray-500">~3.5 min per question</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="size-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">CAT System</p>
                    <p className="text-lg text-gray-900"><strong>Adaptive</strong></p>
                    <p className="text-xs text-gray-500">Questions adjust to your level</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="size-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Analytics</p>
                    <p className="text-lg text-gray-900"><strong>Comprehensive</strong></p>
                    <p className="text-xs text-gray-500">8 category breakdown</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 mb-4">How CAT Works</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-gray-900 mb-1"><strong>Adaptive Difficulty</strong></p>
                    <p className="text-sm text-gray-600">Questions become harder as you answer correctly, easier if incorrect</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-gray-900 mb-1"><strong>Ability Estimation</strong></p>
                    <p className="text-sm text-gray-600">System calculates your competency level throughout the exam</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="text-gray-900 mb-1"><strong>Passing Probability</strong></p>
                    <p className="text-sm text-gray-600">Receive a realistic prediction of NCLEX success</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-xl text-gray-900 mb-4">NCLEX Category Coverage (8 Subcategories)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 mb-1"><strong>Safe & Effective Care</strong></p>
                  <p className="text-xs text-gray-600">• Management of Care</p>
                  <p className="text-xs text-gray-600">• Safety & Infection Control</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 mb-1"><strong>Health Promotion</strong></p>
                  <p className="text-xs text-gray-600">• Growth & Development</p>
                  <p className="text-xs text-gray-600">• Prevention & Early Detection</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 mb-1"><strong>Psychosocial Integrity</strong></p>
                  <p className="text-xs text-gray-600">• Coping & Adaptation</p>
                  <p className="text-xs text-gray-600">• Therapeutic Communication</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-900 mb-1"><strong>Physiological Integrity</strong></p>
                  <p className="text-xs text-gray-600">• Basic Care & Comfort</p>
                  <p className="text-xs text-gray-600">• Pharmacology</p>
                  <p className="text-xs text-gray-600">• Risk Reduction</p>
                  <p className="text-xs text-gray-600">• Physiological Adaptation</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="size-6 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-yellow-900 mb-1"><strong>Important Notice:</strong></p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• You have 5 hours to complete 85 questions</li>
                    <li>• Once submitted, you cannot change your answer</li>
                    <li>• The test will auto-submit when time expires</li>
                    <li>• Questions adapt based on your performance</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartSimulator}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg h-14"
            >
              <Play className="mr-2 size-6" />
              Begin NCLEX CAT Simulator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (testComplete) {
    const report = generateComprehensiveReport();
    const score = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const timeUsed = TOTAL_TEST_TIME - timeRemaining;
    const avgTimePerQuestion = Math.round(timeUsed / totalQuestions);
    const passingProbability = report.passingProbability;

    if (showReview) {
      return (
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => setShowReview(false)} className="mb-6">
            <ArrowLeft className="mr-2 size-4" />
            Back to Results
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>Review all {totalQuestions} questions with explanations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {answers.map((answer, idx) => {
                const question = selectedQuestions[answer.questionIndex];
                if (!question) return null;
                
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
                          {answer.flagged && <Badge className="bg-yellow-500">Flagged</Badge>}
                          <Badge variant="outline">Ability: {answer.abilityLevel.toFixed(1)}</Badge>
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
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                          <p className="text-sm text-blue-800 mt-2"><strong>Rationale:</strong> {question.rationale}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Time spent: {answer.timeSpent}s</p>
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
      <div className="max-w-6xl mx-auto">
        <Card className="border-2 border-blue-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-2xl ${
                passingProbability >= 75 ? 'bg-green-600' : passingProbability >= 50 ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                <Award className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">NCLEX CAT Simulator Complete</CardTitle>
            <CardDescription className="text-lg">
              Comprehensive Performance Analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* NCLEX Passing Probability */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-3">NCLEX Passing Probability</p>
                <div className={`text-8xl mb-4 ${
                  passingProbability >= 75 ? 'text-green-600' :
                  passingProbability >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {passingProbability}%
                </div>
                <p className="text-xl text-gray-700 mb-4">
                  {passingProbability >= 75 ? 'High Probability of Success' :
                   passingProbability >= 50 ? 'Moderate Probability - Continue Studying' :
                   'Additional Preparation Recommended'}
                </p>
                <div className="max-w-2xl mx-auto">
                  <Progress value={passingProbability} className="h-4" />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    CAT Ability Level: {report.finalAbilityLevel.toFixed(2)}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Score: {score}/{totalQuestions} ({percentage}%)
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="size-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{formatTime(timeUsed)}</p>
                  <p className="text-sm text-gray-600">Time Used</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(timeRemaining)} remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Activity className="size-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{avgTimePerQuestion}s</p>
                  <p className="text-sm text-gray-600">Avg per Question</p>
                  <p className="text-xs text-gray-500 mt-1">Target: {TIME_PER_QUESTION}s</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="size-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{report.finalAbilityLevel.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Final Ability</p>
                  <p className="text-xs text-gray-500 mt-1">Scale: -3 to +3</p>
                </CardContent>
              </Card>
            </div>

            {/* 8 Subcategory Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by NCLEX Subcategory</CardTitle>
                <CardDescription>Detailed breakdown of all 8 client needs areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(report.subcategoryStats).map(([subcategory, stats]) => (
                  <div key={subcategory} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{subcategory}</span>
                        <span className="text-sm text-gray-600">
                          ({stats.correct}/{stats.total})
                        </span>
                      </div>
                      <Badge variant={
                        stats.percentage >= 75 ? 'default' : 
                        stats.percentage >= 60 ? 'secondary' : 
                        'destructive'
                      }>
                        {stats.percentage}%
                      </Badge>
                    </div>
                    <Progress value={stats.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Difficulty Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Difficulty Level</CardTitle>
                <CardDescription>How you performed on easy, medium, and hard questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(report.difficultyStats).map(([difficulty, stats]) => {
                    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    return (
                      <div key={difficulty} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize mb-2">{difficulty}</p>
                        <p className="text-3xl text-gray-900 mb-2">{percentage}%</p>
                        <p className="text-xs text-gray-600">{stats.correct}/{stats.total} correct</p>
                        <Progress value={percentage} className="mt-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="size-5 text-green-600" />
                    Strengths (≥75%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {report.strengths.map(strength => (
                        <li key={strength} className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="size-4" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No areas of high performance yet</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsDown className="size-5 text-red-600" />
                    Areas to Improve (&lt;60%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {report.weaknesses.map(weakness => (
                        <li key={weakness} className="flex items-center gap-2 text-red-700">
                          <XCircle className="size-4" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No weak areas identified - Great job!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personalized Recommendations */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-6 text-purple-600" />
                  Personalized Study Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passingProbability >= 75 ? (
                  <>
                    <div className="flex gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <Star className="size-6 text-green-600 shrink-0" />
                      <div>
                        <p className="text-green-900 mb-2"><strong>Excellent Performance!</strong></p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• You're demonstrating strong NCLEX readiness</li>
                          <li>• Continue practicing to maintain this performance level</li>
                          <li>• Focus on time management strategies</li>
                          <li>• Review any flagged questions for clarity</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : passingProbability >= 50 ? (
                  <>
                    <div className="flex gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <AlertCircle className="size-6 text-yellow-600 shrink-0" />
                      <div>
                        <p className="text-yellow-900 mb-2"><strong>You're On Track</strong></p>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Your performance shows good progress</li>
                          <li>• Focus additional study on weak categories identified above</li>
                          <li>• Practice more difficult questions to improve ability level</li>
                          <li>• Review rationales for missed questions carefully</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <AlertCircle className="size-6 text-red-600 shrink-0" />
                      <div>
                        <p className="text-red-900 mb-2"><strong>Additional Preparation Needed</strong></p>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Dedicate more study time to weak categories</li>
                          <li>• Review fundamental nursing concepts and priority-setting</li>
                          <li>• Practice more questions daily (50-100 minimum)</li>
                          <li>• Consider joining study groups or tutoring</li>
                          <li>• Focus on understanding rationales, not memorizing answers</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {report.weaknesses.length > 0 && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-blue-900 mb-2"><strong>Priority Study Topics:</strong></p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {report.weaknesses.map(weakness => (
                        <li key={weakness}>• Deep dive into {weakness} content</li>
                      ))}
                      <li>• Complete focused practice quizzes on these areas</li>
                      <li>• Review your ebooks on these specific topics</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowReview(true)} variant="outline" className="flex-1">
                <Eye className="mr-2 size-4" />
                Review All Questions
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 size-4" />
                Retake Simulator
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

  // Test Screen
  const question = selectedQuestions[currentQuestionIndex];
  
  if (!question) {
    return <div>Loading question...</div>;
  }

  // Check if time is running low
  const isLowTime = timeRemaining < 30 * 60; // Less than 30 minutes

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
          <Badge variant="outline" className={`text-lg px-4 py-2 ${isLowTime ? 'bg-red-100 text-red-800 border-red-300' : ''}`}>
            <Clock className="mr-2 size-4" />
            {formatTime(timeRemaining)}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Ability: {catState.abilityLevel.toFixed(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="size-5" /> : <Pause className="size-5" />}
          </Button>
          <Button variant="outline" onClick={onBack}>
            Exit Test
          </Button>
        </div>
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
              <div className="flex items-center gap-2 mb-3">
                <Badge>{question.subcategory}</Badge>
                <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
              </div>
              <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlag}
              className={flaggedQuestions.has(currentQuestionIndex) ? 'text-yellow-500' : 'text-gray-400'}
            >
              <Flag className="size-5" fill={flaggedQuestions.has(currentQuestionIndex) ? 'currentColor' : 'none'} />
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
                  <p className="text-blue-800 text-sm"><strong>Rationale:</strong> {question.rationale}</p>
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
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Test'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-6 text-yellow-600" />
              Time Warning
            </DialogTitle>
            <DialogDescription>
              You have 30 minutes remaining to complete the test.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-yellow-900">
                Manage your time wisely. The test will auto-submit when time expires.
              </p>
            </div>
            <Button onClick={() => setShowTimeWarning(false)} className="w-full">
              Continue Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Dialog */}
      <Dialog open={isPaused} onOpenChange={setIsPaused}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Paused</DialogTitle>
            <DialogDescription>
              Your test is paused. The timer has stopped.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Pause className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg text-gray-900 mb-1">Take a Break</p>
              <p className="text-sm text-gray-600 mb-3">Time remaining: {formatTime(timeRemaining)}</p>
              <Badge variant="outline">CAT Ability Level: {catState.abilityLevel.toFixed(2)}</Badge>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsPaused(false)} className="flex-1">
                <Play className="mr-2 size-4" />
                Resume Test
              </Button>
              <Button variant="outline" onClick={onBack} className="flex-1">
                Exit Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress as ProgressBar } from './ui/progress';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Brain, 
  Clock, 
  BookOpen, 
  Settings, 
  Play,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { CATResult } from '../App';
import { getAdaptiveQuestions } from '../data/catQuestions';
import { Calculator } from './Calculator';

interface CATTestProps {
  onComplete: (result: CATResult) => void;
  onBack: () => void;
}

interface TestConfig {
  subjects: string[];
  questionCount: number;
  mode: 'tutorial' | 'timed';
  timeLimit?: number;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  flagged?: boolean;
}

// All NCLEX categories
const NCLEX_CATEGORIES = [
  'Safe and Effective Care Environment - Management of Care',
  'Safe and Effective Care Environment - Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Physiological Integrity - Basic Care and Comfort',
  'Physiological Integrity - Pharmacological Therapies',
  'Physiological Integrity - Reduction of Risk Potential',
  'Physiological Integrity - Physiological Adaptation'
];

// Item Response Theory (IRT) - Simplified 2PL model
function calculateAbilityEstimate(answers: Answer[]): number {
  const answeredQuestions = answers.filter(a => a.selectedAnswer !== null);
  if (answeredQuestions.length === 0) return 0;
  
  let ability = 0;
  const difficultyMap = { easy: -1, medium: 0, hard: 1 };
  
  answeredQuestions.forEach((answer, index) => {
    const difficulty = difficultyMap[answer.difficulty];
    const weight = 1 / Math.sqrt(index + 1);
    
    if (answer.isCorrect) {
      ability += (1 + difficulty) * weight;
    } else {
      ability -= (1 - difficulty) * weight;
    }
  });
  
  return ability / answeredQuestions.length;
}

function calculatePassingProbability(abilityEstimate: number, totalAnswers: number): number {
  const passingStandard = 0;
  const steepness = 1.5;
  
  const rawProbability = 1 / (1 + Math.exp(-steepness * (abilityEstimate - passingStandard)));
  const confidence = Math.min(totalAnswers / 75, 1);
  const baselineProbability = 0.5;
  
  return baselineProbability + (rawProbability - baselineProbability) * confidence;
}

function getConfidenceInterval(abilityEstimate: number, n: number): [number, number] {
  const standardError = 1 / Math.sqrt(n);
  return [abilityEstimate - 1.96 * standardError, abilityEstimate + 1.96 * standardError];
}

export function CATTest({ onComplete, onBack }: CATTestProps) {
  // Configuration stage
  const [stage, setStage] = useState<'config' | 'testing' | 'review'>('config');
  const [config, setConfig] = useState<TestConfig>({
    subjects: ['all'],
    questionCount: 75,
    mode: 'tutorial',
    timeLimit: 60
  });

  // Testing stage
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [abilityEstimate, setAbilityEstimate] = useState(0);
  const [passingProbability, setPassingProbability] = useState(0.5);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showRationales, setShowRationales] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  
  const currentQuestionData = questions[currentQuestion];

  // Initialize answers array
  useEffect(() => {
    if (stage === 'testing' && answers.length === 0) {
      const initialAnswers: Answer[] = Array.from({ length: config.questionCount }, (_, i) => ({
        questionIndex: i,
        selectedAnswer: null,
        isCorrect: false,
        difficulty: 'medium',
        category: '',
        flagged: false
      }));
      setAnswers(initialAnswers);
    }
  }, [stage, config.questionCount, answers.length]);

  // Timer effect
  useEffect(() => {
    if (stage === 'testing' && config.mode === 'timed' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, config.mode, timeRemaining]);

  const handleSubjectToggle = (category: string) => {
    if (category === 'all') {
      setConfig({ ...config, subjects: ['all'] });
    } else {
      const currentSubjects = config.subjects.filter(s => s !== 'all');
      if (currentSubjects.includes(category)) {
        const newSubjects = currentSubjects.filter(s => s !== category);
        setConfig({ ...config, subjects: newSubjects.length > 0 ? newSubjects : ['all'] });
      } else {
        setConfig({ ...config, subjects: [...currentSubjects, category] });
      }
    }
  };

  const handleStartTest = () => {
    // Generate questions based on config
    const selectedSubjects = config.subjects.includes('all') ? NCLEX_CATEGORIES : config.subjects;
    const allAvailableQuestions = getAdaptiveQuestions(0, []);
    
    // Filter questions by selected subjects
    const filteredQuestions = allAvailableQuestions.filter(q => 
      selectedSubjects.some(subject => 
        q.category.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(q.category.toLowerCase())
      )
    );
    
    // Shuffle and take the required number of questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, config.questionCount);
    
    // If not enough questions for selected subjects, fill with general questions
    if (selectedQuestions.length < config.questionCount) {
      const remaining = config.questionCount - selectedQuestions.length;
      const additionalQuestions = allAvailableQuestions
        .filter(q => !selectedQuestions.includes(q))
        .slice(0, remaining);
      selectedQuestions.push(...additionalQuestions);
    }
    
    setQuestions(selectedQuestions);
    setStage('testing');
    setStartTime(Date.now());
    if (config.mode === 'timed') {
      setTimeRemaining(config.timeLimit! * 60);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const updatedAnswers = [...answers];
    const isCorrect = answerIndex === currentQuestionData.correctAnswer;
    
    updatedAnswers[currentQuestion] = {
      ...updatedAnswers[currentQuestion],
      selectedAnswer: answerIndex,
      isCorrect,
      difficulty: currentQuestionData.difficulty,
      category: currentQuestionData.category
    };
    
    setAnswers(updatedAnswers);

    // Update ability estimate
    const answeredQuestions = updatedAnswers.filter(a => a.selectedAnswer !== null);
    if (answeredQuestions.length > 0) {
      const newAbility = calculateAbilityEstimate(answeredQuestions);
      setAbilityEstimate(newAbility);
      
      const newProbability = calculatePassingProbability(newAbility, answeredQuestions.length);
      setPassingProbability(newProbability);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowRationales(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < config.questionCount - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowRationales(false);
    }
  };

  const toggleFlag = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = {
      ...updatedAnswers[currentQuestion],
      flagged: !updatedAnswers[currentQuestion].flagged
    };
    setAnswers(updatedAnswers);
  };

  const handleFinishTest = () => {
    const answeredQuestions = answers.filter(a => a.selectedAnswer !== null);
    const categoryPerformance: Record<string, { correct: number; total: number }> = {};
    
    answeredQuestions.forEach(answer => {
      if (!categoryPerformance[answer.category]) {
        categoryPerformance[answer.category] = { correct: 0, total: 0 };
      }
      categoryPerformance[answer.category].total += 1;
      if (answer.isCorrect) {
        categoryPerformance[answer.category].correct += 1;
      }
    });
    
    const score = answeredQuestions.filter(a => a.isCorrect).length;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const [lower, upper] = getConfidenceInterval(abilityEstimate, answeredQuestions.length);
    
    onComplete({
      topic: 'NCLEX CAT',
      score,
      total: answeredQuestions.length,
      date: new Date(),
      timeSpent,
      passingProbability,
      abilityEstimate,
      confidenceInterval: [lower, upper],
      categoryPerformance
    });
  };

  // Configuration Screen
  if (stage === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
                <Settings className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl">NCLEX-CAT Configuration</h1>
                <p className="text-xl text-gray-600">Customize your Computer Adaptive Test experience</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Subject Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Select Test Subjects
                </CardTitle>
                <CardDescription>
                  Choose which NCLEX categories to include in your test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer"
                  onClick={() => handleSubjectToggle('all')}
                >
                  <Checkbox
                    id="all-subjects"
                    checked={config.subjects.includes('all')}
                    onCheckedChange={() => handleSubjectToggle('all')}
                  />
                  <label
                    htmlFor="all-subjects"
                    className="flex-1 cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    <p className="text-blue-900">All Subjects (Recommended)</p>
                    <p className="text-sm text-blue-700">Comprehensive test covering all 8 NCLEX categories</p>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NCLEX_CATEGORIES.map((category) => {
                    const isDisabled = config.subjects.includes('all');
                    return (
                      <div 
                        key={category} 
                        className={`flex items-center space-x-2 p-3 bg-gray-50 rounded-lg ${!isDisabled && 'cursor-pointer hover:bg-gray-100'}`}
                        onClick={() => !isDisabled && handleSubjectToggle(category)}
                      >
                        <Checkbox
                          id={category}
                          checked={!config.subjects.includes('all') && config.subjects.includes(category)}
                          disabled={isDisabled}
                          onCheckedChange={() => handleSubjectToggle(category)}
                        />
                        <label
                          htmlFor={category}
                          className={`text-sm flex-1 ${!isDisabled && 'cursor-pointer'}`}
                          onClick={(e) => e.preventDefault()}
                        >
                          {category}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Question Count */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5" />
                  Number of Questions
                </CardTitle>
                <CardDescription>
                  Select how many questions you want to answer (60-145 for full CAT)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.questionCount.toString()}
                  onValueChange={(value) => setConfig({ ...config, questionCount: parseInt(value) })}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="30" id="q30" />
                      <Label htmlFor="q30" className="flex-1 cursor-pointer">
                        <p>30 Questions</p>
                        <p className="text-sm text-gray-600">Quick practice session (~30 minutes)</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="60" id="q60" />
                      <Label htmlFor="q60" className="flex-1 cursor-pointer">
                        <p>60 Questions</p>
                        <p className="text-sm text-gray-600">Standard practice test (~1 hour)</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <RadioGroupItem value="75" id="q75" />
                      <Label htmlFor="q75" className="flex-1 cursor-pointer">
                        <p className="text-blue-900">75 Questions (Recommended)</p>
                        <p className="text-sm text-blue-700">Minimum NCLEX CAT length (~90 minutes)</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="145" id="q145" />
                      <Label htmlFor="q145" className="flex-1 cursor-pointer">
                        <p>145 Questions</p>
                        <p className="text-sm text-gray-600">Maximum NCLEX CAT length (~3 hours)</p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Test Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Test Mode
                </CardTitle>
                <CardDescription>
                  Choose between tutorial mode or timed mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={config.mode}
                  onValueChange={(value: 'tutorial' | 'timed') => setConfig({ ...config, mode: value })}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <RadioGroupItem value="tutorial" id="tutorial" />
                      <Label htmlFor="tutorial" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="size-4 text-blue-600" />
                          <p className="text-blue-900">Tutorial Mode (Recommended for Learning)</p>
                        </div>
                        <p className="text-sm text-blue-700">
                          Navigate freely with Back/Next buttons. See explanations immediately. No time limit.
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <RadioGroupItem value="timed" id="timed" />
                      <Label htmlFor="timed" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="size-4 text-gray-600" />
                          <p>Timed Mode (Exam Simulation)</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Real exam conditions with time pressure. Navigate with Back/Next buttons.
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {config.mode === 'timed' && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <Label htmlFor="time-limit" className="mb-2 block">Time Limit (minutes)</Label>
                    <RadioGroup
                      value={config.timeLimit?.toString()}
                      onValueChange={(value) => setConfig({ ...config, timeLimit: parseInt(value) })}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="30" id="t30" />
                          <Label htmlFor="t30">30 minutes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="60" id="t60" />
                          <Label htmlFor="t60">60 minutes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="90" id="t90" />
                          <Label htmlFor="t90">90 minutes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="180" id="t180" />
                          <Label htmlFor="t180">180 minutes (Full NCLEX time)</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Start Button */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl mb-2">Ready to Begin?</h3>
                  <p className="text-blue-100">
                    You've configured a {config.questionCount}-question {config.mode} test
                    {!config.subjects.includes('all') && ` covering ${config.subjects.length} selected categories`}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  onClick={handleStartTest}
                >
                  <Play className="size-5 mr-2" />
                  Start CAT Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Testing Screen
  if (stage === 'testing' && answers.length > 0 && questions.length > 0 && currentQuestionData) {
    const currentAnswer = answers[currentQuestion];
    const answeredCount = answers.filter(a => a.selectedAnswer !== null).length;
    const correctCount = answers.filter(a => a.selectedAnswer !== null && a.isCorrect).length;
    const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const probabilityPercent = Math.round(passingProbability * 100);
    const flaggedCount = answers.filter(a => a.flagged).length;

    const formatTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Exit
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="text-sm">
                  <span className="text-gray-600">Question </span>
                  <span className="font-semibold">{currentQuestion + 1}</span>
                  <span className="text-gray-600"> of {config.questionCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {config.mode === 'timed' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    timeRemaining < 300 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Clock className="size-4" />
                    <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <Calculator isOpen={calculatorOpen} onToggle={() => setCalculatorOpen(!calculatorOpen)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlag}
                  className={currentAnswer.flagged ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}
                >
                  <Flag className="size-4 mr-2" />
                  {currentAnswer.flagged ? 'Flagged' : 'Flag'}
                </Button>
                <Button
                  onClick={handleFinishTest}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  size="sm"
                >
                  Finish Test
                </Button>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-5 gap-3 text-center text-sm mb-2">
              <div>
                <p className="text-gray-600">Answered</p>
                <p className="font-semibold">{answeredCount}/{config.questionCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Correct</p>
                <p className="font-semibold text-green-600">{correctCount} ({percentage}%)</p>
              </div>
              <div>
                <p className="text-gray-600">Pass Probability</p>
                <p className={`font-semibold ${probabilityPercent >= 70 ? 'text-green-600' : probabilityPercent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {probabilityPercent}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Ability</p>
                <p className="font-semibold">{abilityEstimate > 0 ? '+' : ''}{abilityEstimate.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Flagged</p>
                <p className="font-semibold text-yellow-600">{flaggedCount}</p>
              </div>
            </div>

            <ProgressBar value={(answeredCount / config.questionCount) * 100} className="h-1.5" />
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={currentQuestionData.difficulty === 'easy' ? 'secondary' : currentQuestionData.difficulty === 'medium' ? 'default' : 'destructive'}>
                {currentQuestionData.difficulty.charAt(0).toUpperCase() + currentQuestionData.difficulty.slice(1)}
              </Badge>
              <Badge variant="outline">{currentQuestionData.category}</Badge>
            </div>
            {config.mode === 'tutorial' && currentAnswer.selectedAnswer !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRationales(!showRationales)}
              >
                {showRationales ? <EyeOff className="size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
                {showRationales ? 'Hide' : 'Show'} Rationales
              </Button>
            )}
          </div>

          <Card className="mb-6">
            <CardContent className="p-8">
              <h2 className="text-xl leading-relaxed mb-6">{currentQuestionData.question}</h2>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => {
                  const isSelected = currentAnswer.selectedAnswer === index;
                  const isCorrect = index === currentQuestionData.correctAnswer;
                  const showFeedback = config.mode === 'tutorial' && currentAnswer.selectedAnswer !== null;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        showFeedback && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : showFeedback && isSelected && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 flex items-start gap-3">
                          <span className="font-semibold text-gray-600 mt-0.5">{String.fromCharCode(65 + index)}.</span>
                          <span className="text-gray-800">{option}</span>
                        </div>
                        {showFeedback && isCorrect && <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 ml-2" />}
                        {showFeedback && isSelected && !isCorrect && <XCircle className="size-5 text-red-600 flex-shrink-0 ml-2" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tutorial Mode Explanations */}
              {config.mode === 'tutorial' && currentAnswer.selectedAnswer !== null && (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="size-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-900 mb-2">
                          <strong>Why {String.fromCharCode(65 + currentQuestionData.correctAnswer)} is correct:</strong>
                        </p>
                        <p className="text-blue-800 leading-relaxed">{currentQuestionData.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {showRationales && currentQuestionData.rationales && (
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        <strong>Understanding Each Option:</strong>
                      </p>
                      {currentQuestionData.rationales.map((rationale: string, idx: number) => {
                        const isCorrectOption = idx === currentQuestionData.correctAnswer;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-2 ${
                              isCorrectOption
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {isCorrectOption ? (
                                <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className={`mb-1 ${isCorrectOption ? 'text-green-900' : 'text-gray-900'}`}>
                                  <strong>Option {String.fromCharCode(65 + idx)}:</strong> {currentQuestionData.options[idx]}
                                </p>
                                <p className={`text-sm ${isCorrectOption ? 'text-green-800' : 'text-gray-700'}`}>
                                  {rationale}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className={`border-2 rounded-lg p-4 ${
                    currentAnswer.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Brain className={`size-6 flex-shrink-0 mt-0.5 ${
                        currentAnswer.isCorrect ? 'text-green-600' : 'text-orange-600'
                      }`} />
                      <div>
                        <p className={`mb-1 ${currentAnswer.isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                          <strong>
                            {currentAnswer.isCorrect 
                              ? '✓ Excellent Work!' 
                              : 'Keep Learning!'}
                          </strong>
                        </p>
                        <p className={`text-sm ${currentAnswer.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                          {currentAnswer.isCorrect 
                            ? 'Your ability level is being updated. The test adapts to your performance.'
                            : 'Review the rationales to strengthen your understanding. The next questions will be adjusted.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              size="lg"
            >
              <ChevronLeft className="size-5 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              {currentAnswer.selectedAnswer !== null ? (
                <span className="text-green-600 font-medium">✓ Answered</span>
              ) : (
                <span className="text-orange-600 font-medium">Not answered</span>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestion === config.questionCount - 1}
              size="lg"
            >
              Next
              <ChevronRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
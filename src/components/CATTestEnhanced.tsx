import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress as ProgressBar } from './ui/progress';
import { Badge } from './ui/badge';
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
  Award,
  BarChart3,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';
import { CATResult } from '../App';
import { getAdaptiveQuestions } from '../data/catQuestions';
import { Calculator } from './Calculator';

interface CATTestEnhancedProps {
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
  timeSpent?: number;
}

// All NCLEX categories with descriptions
const NCLEX_CATEGORIES = [
  {
    id: 'management-of-care',
    name: 'Safe and Effective Care Environment',
    subcategory: 'Management of Care',
    description: 'Advance directives, advocacy, case management, client rights, collaboration, confidentiality, continuity of care, establishing priorities, ethical practice, informed consent, legal rights and responsibilities, referrals',
    icon: '🏥',
    percentage: '17-23%'
  },
  {
    id: 'safety-infection',
    name: 'Safe and Effective Care Environment',
    subcategory: 'Safety and Infection Control',
    description: 'Accident/error/injury prevention, emergency response plan, ergonomic principles, handling hazardous materials, home safety, infection control, safe use of equipment, security plan, standard precautions',
    icon: '🛡️',
    percentage: '9-15%'
  },
  {
    id: 'health-promotion',
    name: 'Health Promotion and Maintenance',
    subcategory: 'Health Promotion and Maintenance',
    description: 'Aging process, ante/intra/postpartum care, developmental stages, disease prevention, health screening, lifestyle choices, self-care, techniques of physical assessment',
    icon: '💪',
    percentage: '6-12%'
  },
  {
    id: 'psychosocial',
    name: 'Psychosocial Integrity',
    subcategory: 'Psychosocial Integrity',
    description: 'Abuse/neglect, behavioral interventions, chemical dependency, coping mechanisms, crisis intervention, cultural awareness, end-of-life care, family dynamics, mental health concepts, religious/spiritual influences, sensory/perceptual alterations, stress management, support systems, therapeutic communication, therapeutic environment',
    icon: '🧠',
    percentage: '6-12%'
  },
  {
    id: 'basic-care',
    name: 'Physiological Integrity',
    subcategory: 'Basic Care and Comfort',
    description: 'Assistive devices, elimination, mobility/immobility, non-pharmacological comfort interventions, nutrition and oral hydration, palliative/comfort care, personal hygiene, rest and sleep',
    icon: '🛏️',
    percentage: '6-12%'
  },
  {
    id: 'pharmacological',
    name: 'Physiological Integrity',
    subcategory: 'Pharmacological and Parenteral Therapies',
    description: 'Adverse effects/contraindications, blood and blood products, central venous access devices, dosage calculation, expected actions/outcomes, medication administration, parenteral/IV therapies, pharmacological pain management, total parenteral nutrition',
    icon: '💊',
    percentage: '12-18%'
  },
  {
    id: 'risk-reduction',
    name: 'Physiological Integrity',
    subcategory: 'Reduction of Risk Potential',
    description: 'Diagnostic tests, laboratory values, potential complications, system specific assessments, therapeutic procedures, vital signs',
    icon: '🔬',
    percentage: '9-15%'
  },
  {
    id: 'physiological-adaptation',
    name: 'Physiological Integrity',
    subcategory: 'Physiological Adaptation',
    description: 'Alterations in body systems, fluid and electrolyte imbalances, hemodynamics, illness management, medical emergencies, pathophysiology, unexpected response to therapies',
    icon: '⚕️',
    percentage: '11-17%'
  }
];

// Item Response Theory (IRT) - Enhanced 2PL model
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
  
  const finalProbability = baselineProbability + (rawProbability - baselineProbability) * confidence;
  
  // Ensure it stays between 5% and 95%
  return Math.max(0.05, Math.min(0.95, finalProbability));
}

function getConfidenceInterval(abilityEstimate: number, n: number): [number, number] {
  const standardError = 1 / Math.sqrt(n);
  return [abilityEstimate - 1.96 * standardError, abilityEstimate + 1.96 * standardError];
}

export function CATTestEnhanced({ onComplete, onBack }: CATTestEnhancedProps) {
  // Configuration stage
  const [stage, setStage] = useState<'config' | 'testing' | 'results'>('config');
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
  const [showRationale, setShowRationale] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  
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
        flagged: false,
        timeSpent: 0
      }));
      setAnswers(initialAnswers);
      setQuestionStartTime(Date.now());
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubjectToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setConfig({ ...config, subjects: ['all'] });
    } else {
      const currentSubjects = config.subjects.filter(s => s !== 'all');
      if (currentSubjects.includes(categoryId)) {
        const newSubjects = currentSubjects.filter(s => s !== categoryId);
        setConfig({ ...config, subjects: newSubjects.length > 0 ? newSubjects : ['all'] });
      } else {
        setConfig({ ...config, subjects: [...currentSubjects, categoryId] });
      }
    }
  };

  const handleStartTest = () => {
    // Generate questions based on config
    const selectedCategoryIds = config.subjects.includes('all') 
      ? NCLEX_CATEGORIES.map(c => c.subcategory)
      : NCLEX_CATEGORIES
          .filter(c => config.subjects.includes(c.id))
          .map(c => c.subcategory);
    
    const allAvailableQuestions = getAdaptiveQuestions(0, []);
    
    // Filter questions by selected subjects
    const filteredQuestions = allAvailableQuestions.filter(q => 
      selectedCategoryIds.some(subcat => 
        q.category.toLowerCase().includes(subcat.toLowerCase())
      )
    );
    
    // Shuffle and take the required number of questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    let selectedQuestions = shuffled.slice(0, config.questionCount);
    
    // If not enough questions for selected subjects, fill with general questions
    if (selectedQuestions.length < config.questionCount) {
      const remaining = config.questionCount - selectedQuestions.length;
      const additionalQuestions = allAvailableQuestions
        .filter(q => !selectedQuestions.includes(q))
        .slice(0, remaining);
      selectedQuestions = [...selectedQuestions, ...additionalQuestions];
    }
    
    setQuestions(selectedQuestions);
    setStage('testing');
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    if (config.mode === 'timed') {
      setTimeRemaining(config.timeLimit! * 60);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const updatedAnswers = [...answers];
    const isCorrect = answerIndex === currentQuestionData.correctAnswer;
    
    updatedAnswers[currentQuestion] = {
      ...updatedAnswers[currentQuestion],
      selectedAnswer: answerIndex,
      isCorrect,
      difficulty: currentQuestionData.difficulty,
      category: currentQuestionData.category,
      timeSpent
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
      setShowRationale(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleNext = () => {
    if (currentQuestion < config.questionCount - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowRationale(false);
      setQuestionStartTime(Date.now());
    }
  };

  const toggleFlag = () => {
    const updatedAnswers = [...answers];
    if (!updatedAnswers[currentQuestion]) {
      updatedAnswers[currentQuestion] = {
        questionIndex: currentQuestion,
        selectedAnswer: null,
        isCorrect: false,
        difficulty: 'medium',
        category: '',
        flagged: false,
        timeSpent: 0
      };
    }
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
    
    const result: CATResult = {
      topic: 'NCLEX CAT',
      score,
      total: answeredQuestions.length,
      date: new Date(),
      timeSpent,
      passingProbability,
      abilityEstimate,
      confidenceInterval: [lower, upper],
      categoryPerformance
    };
    
    setStage('results');
    onComplete(result);
  };

  // Configuration Screen
  if (stage === 'config') {
    const selectedCount = config.subjects.includes('all') 
      ? NCLEX_CATEGORIES.length 
      : config.subjects.length;

    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                <Brain className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">NCLEX-CAT Configuration</CardTitle>
            <CardDescription className="text-lg">
              Customize your Computer Adaptive Test experience
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-blue-600" />
                Select Test Categories
              </CardTitle>
              <CardDescription>
                Choose which NCLEX categories to include in your CAT test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* All Categories Option */}
              <button
                type="button"
                className={`w-full flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  config.subjects.includes('all')
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubjectToggle('all');
                }}
              >
                <div className={`mt-1 size-5 shrink-0 rounded border-2 flex items-center justify-center ${
                  config.subjects.includes('all')
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}>
                  {config.subjects.includes('all') && (
                    <Check className="size-4 text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-900">All Categories (Recommended)</p>
                    <Badge className="bg-blue-600">Complete NCLEX-RN</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comprehensive test covering all 8 NCLEX-RN client needs categories
                  </p>
                </div>
              </button>

              {/* Individual Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NCLEX_CATEGORIES.map((category) => {
                  const isDisabled = config.subjects.includes('all');
                  const isSelected = !isDisabled && config.subjects.includes(category.id);
                  
                  return (
                    <button
                      key={category.id}
                      type="button"
                      disabled={isDisabled}
                      className={`w-full flex items-start space-x-3 p-4 rounded-xl border-2 transition-all ${
                        isDisabled
                          ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50 border-blue-400 cursor-pointer hover:border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isDisabled) {
                          handleSubjectToggle(category.id);
                        }
                      }}
                    >
                      <div className={`mt-1 size-5 shrink-0 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && (
                          <Check className="size-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{category.icon}</span>
                          <div className="flex-1">
                            <p className="text-gray-900">{category.name}</p>
                            <p className="text-sm text-blue-600">{category.subcategory}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {category.percentage}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selection Summary */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Target className="size-5 text-purple-600" />
                  <div>
                    <p className="text-purple-900">
                      <strong>{selectedCount}</strong> {selectedCount === 1 ? 'category' : 'categories'} selected
                    </p>
                    <p className="text-sm text-purple-700">
                      {config.subjects.includes('all') 
                        ? 'Complete NCLEX coverage across all client needs categories'
                        : 'Focused practice on selected categories'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5 text-purple-600" />
                Test Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Count */}
              <div>
                <label className="text-gray-900 mb-3 block">Number of Questions</label>
                <div className="grid grid-cols-4 gap-3">
                  {[25, 50, 75, 100].map(num => (
                    <Button
                      key={num}
                      variant={config.questionCount === num ? 'default' : 'outline'}
                      onClick={() => setConfig({ ...config, questionCount: num })}
                      className="w-full"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  NCLEX-RN: 75-145 questions • Recommended: 75 questions
                </p>
              </div>

              {/* Test Mode */}
              <div>
                <label className="text-gray-900 mb-3 block">Test Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={config.mode === 'tutorial' ? 'default' : 'outline'}
                    onClick={() => setConfig({ ...config, mode: 'tutorial' })}
                    className="h-auto p-4"
                  >
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="size-5" />
                        <span>Tutorial Mode</span>
                      </div>
                      <p className="text-xs opacity-80">
                        No time limit, review rationales
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant={config.mode === 'timed' ? 'default' : 'outline'}
                    onClick={() => setConfig({ ...config, mode: 'timed' })}
                    className="h-auto p-4"
                  >
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="size-5" />
                        <span>Timed Mode</span>
                      </div>
                      <p className="text-xs opacity-80">
                        Simulates real NCLEX timing
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Time Limit (if timed) */}
              {config.mode === 'timed' && (
                <div>
                  <label className="text-gray-900 mb-3 block">Time Limit (minutes)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[30, 60, 90, 120].map(mins => (
                      <Button
                        key={mins}
                        variant={config.timeLimit === mins ? 'default' : 'outline'}
                        onClick={() => setConfig({ ...config, timeLimit: mins })}
                        className="w-full"
                      >
                        {mins}m
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Lightbulb className="size-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-blue-900 mb-2"><strong>About CAT Testing:</strong></p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Questions adapt to your ability level</li>
                      <li>• Each answer refines your skill estimate</li>
                      <li>• More accurate assessment than fixed tests</li>
                      <li>• Similar to actual NCLEX-RN format</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl text-gray-900">{config.questionCount}</p>
                    <p className="text-sm text-gray-600">Questions</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-center">
                    <p className="text-2xl text-gray-900">{selectedCount}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-center">
                    <p className="text-2xl text-gray-900">
                      {config.mode === 'timed' ? `${config.timeLimit}m` : '∞'}
                    </p>
                    <p className="text-sm text-gray-600">Time</p>
                  </div>
                </div>
                <Button 
                  onClick={handleStartTest} 
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white"
                >
                  <Play className="mr-2 size-5" />
                  Start CAT Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Testing Screen
  if (stage === 'testing') {
    const progress = ((currentQuestion + 1) / config.questionCount) * 100;
    const answeredCount = answers.filter(a => a.selectedAnswer !== null).length;
    const flaggedCount = answers.filter(a => a.flagged).length;
    const currentAnswer = answers[currentQuestion] || { selectedAnswer: null, flagged: false, timeSpent: 0 };

    return (
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Question {currentQuestion + 1} of {config.questionCount}
            </Badge>
            {config.mode === 'timed' && (
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${timeRemaining < 300 ? 'border-red-500 text-red-600' : ''}`}
              >
                <Clock className="mr-2 size-4" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCalculatorOpen(!calculatorOpen)}
            >
              <span className="text-xl">🧮</span>
            </Button>
            <Button variant="outline" onClick={handleFinishTest}>
              Finish Test
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Answered: {answeredCount}</span>
              {flaggedCount > 0 && (
                <span className="text-yellow-600">Flagged: {flaggedCount}</span>
              )}
            </div>
          </div>
          <ProgressBar value={progress} className="h-3" />
        </div>

        {/* Passing Probability Indicator */}
        {answeredCount > 5 && (
          <Card className="mb-4 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Passing Probability</p>
                    <p className="text-2xl text-purple-900">
                      {Math.round(passingProbability * 100)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ability Estimate</p>
                  <p className="text-lg text-gray-900">
                    {abilityEstimate > 0 ? '+' : ''}{abilityEstimate.toFixed(2)}
                  </p>
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
                  <Badge>{currentQuestionData.category}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentQuestionData.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestionData.question}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFlag}
                className={currentAnswer.flagged ? 'text-yellow-500' : 'text-gray-400'}
              >
                <Flag className="size-5" fill={currentAnswer.flagged ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option: string, index: number) => {
                const isSelected = currentAnswer.selectedAnswer === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-300'
                      }`}>
                        <span className={isSelected ? 'text-blue-700' : 'text-gray-700'}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="flex-1 text-gray-900">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show Rationale (Tutorial Mode) */}
            {config.mode === 'tutorial' && currentAnswer.selectedAnswer !== null && showRationale && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Lightbulb className="size-5 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-blue-900 mb-2"><strong>Rationale:</strong></p>
                    <p className="text-blue-800">{currentQuestionData.rationale}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tutorial Mode Controls */}
            {config.mode === 'tutorial' && currentAnswer.selectedAnswer !== null && (
              <Button
                onClick={() => setShowRationale(!showRationale)}
                variant="outline"
                className="w-full"
              >
                <Eye className="mr-2 size-4" />
                {showRationale ? 'Hide' : 'Show'} Rationale
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="mr-2 size-5" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentQuestion === config.questionCount - 1}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            size="lg"
          >
            Next
            <ChevronRight className="ml-2 size-5" />
          </Button>
        </div>

        {/* Calculator */}
        {calculatorOpen && (
          <div className="fixed bottom-4 right-4 z-50">
            <Calculator onClose={() => setCalculatorOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  // Results Screen
  if (stage === 'results') {
    const answeredCount = answers.filter(a => a.selectedAnswer !== null).length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / answeredCount) * 100);
    const passingPercentage = Math.round(passingProbability * 100);
    
    // Category performance
    const categoryPerformance: Record<string, { correct: number; total: number; percentage: number }> = {};
    answers.forEach(answer => {
      if (answer.selectedAnswer !== null) {
        if (!categoryPerformance[answer.category]) {
          categoryPerformance[answer.category] = { correct: 0, total: 0, percentage: 0 };
        }
        categoryPerformance[answer.category].total += 1;
        if (answer.isCorrect) {
          categoryPerformance[answer.category].correct += 1;
        }
      }
    });
    
    Object.keys(categoryPerformance).forEach(cat => {
      const perf = categoryPerformance[cat];
      perf.percentage = Math.round((perf.correct / perf.total) * 100);
    });

    return (
      <div className="max-w-5xl mx-auto p-4">
        <Card className="border-2 border-blue-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-2xl ${
                passingPercentage >= 80 ? 'bg-green-600' : 
                passingPercentage >= 60 ? 'bg-yellow-600' : 
                'bg-red-600'
              }`}>
                <Award className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">CAT Test Complete!</CardTitle>
            <CardDescription className="text-lg">
              Review your performance and passing probability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passing Probability */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Passing Probability</p>
                <div className={`text-7xl mb-4 ${
                  passingPercentage >= 80 ? 'text-green-600' :
                  passingPercentage >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {passingPercentage}%
                </div>
                <p className="text-xl text-gray-700 mb-4">
                  {correctCount} out of {answeredCount} correct ({percentage}%)
                </p>
                <ProgressBar value={passingPercentage} className="h-4" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="size-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{abilityEstimate.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Ability Estimate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="size-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{formatTime(Math.round((Date.now() - startTime) / 1000))}</p>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="size-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">{answeredCount}</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-blue-600" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryPerformance)
                  .sort((a, b) => b[1].percentage - a[1].percentage)
                  .map(([category, perf]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {perf.correct}/{perf.total}
                          </span>
                          <Badge 
                            variant={
                              perf.percentage >= 80 ? 'default' : 
                              perf.percentage >= 60 ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {perf.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <ProgressBar value={perf.percentage} />
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle>Performance Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {passingPercentage >= 80 ? (
                  <div className="flex gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                    <div>
                      <p className="text-green-900 mb-2"><strong>Excellent Performance!</strong></p>
                      <p className="text-sm text-green-800">
                        Your performance indicates strong readiness for the NCLEX-RN. You demonstrate solid understanding across tested categories. Continue reviewing and practicing to maintain this level.
                      </p>
                    </div>
                  </div>
                ) : passingPercentage >= 60 ? (
                  <div className="flex gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <AlertCircle className="size-6 text-yellow-600 shrink-0" />
                    <div>
                      <p className="text-yellow-900 mb-2"><strong>Good Progress!</strong></p>
                      <p className="text-sm text-yellow-800">
                        You're making good progress. Focus on strengthening weaker categories and continue practicing. Review rationales carefully to improve your understanding and boost your passing probability.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <XCircle className="size-6 text-red-600 shrink-0" />
                    <div>
                      <p className="text-red-900 mb-2"><strong>More Preparation Needed</strong></p>
                      <p className="text-sm text-red-800">
                        Continue studying and practicing. Review content areas where you scored lower. Use study resources, practice more questions, and focus on understanding concepts rather than memorizing facts.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setStage('config');
                  setAnswers([]);
                  setCurrentQuestion(0);
                  setAbilityEstimate(0);
                  setPassingProbability(0.5);
                }}
                variant="outline" 
                className="flex-1"
              >
                <RotateCcw className="mr-2 size-4" />
                New Test
              </Button>
              <Button 
                onClick={onBack} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
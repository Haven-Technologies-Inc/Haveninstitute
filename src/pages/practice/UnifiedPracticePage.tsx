/**
 * Unified Practice Page
 * Combines Adaptive Testing (CAT) and Quick Practice into one streamlined experience
 * Supports 10-145 questions, all 8 NCLEX focus areas, and all NextGen question types
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Brain, 
  Clock, 
  Target, 
  BookOpen, 
  Settings, 
  Check,
  Zap,
  BarChart3,
  Layers,
  Timer,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  NCLEX_CATEGORIES, 
  type NCLEXCategory, 
  type QuestionType
} from '../../types/nextGenNCLEX';

// Available question types
const QUESTION_TYPES: { id: QuestionType; name: string; icon: string; description: string }[] = [
  { id: 'multiple-choice', name: 'Multiple Choice', icon: '○', description: 'Select one correct answer' },
  { id: 'select-all', name: 'Select All That Apply', icon: '☑', description: 'Choose all correct options' },
  { id: 'ordered-response', name: 'Ordered Response', icon: '⇅', description: 'Drag items into correct order' },
  { id: 'cloze-dropdown', name: 'Drop-Down Cloze', icon: '▼', description: 'Fill in blanks from dropdowns' },
  { id: 'matrix', name: 'Matrix/Grid', icon: '▦', description: 'Select answers in a table format' },
  { id: 'highlight', name: 'Highlight', icon: '🖍', description: 'Highlight key text in a passage' },
  { id: 'bow-tie', name: 'Bow-Tie', icon: '⋈', description: 'Clinical reasoning with causes and actions' },
];

// Preset configurations
const PRESETS = [
  { 
    id: 'quick-10', 
    name: 'Quick 10', 
    questions: 10, 
    description: 'Fast review session',
    icon: Zap,
    color: 'emerald'
  },
  { 
    id: 'standard-25', 
    name: 'Standard 25', 
    questions: 25, 
    description: 'Balanced practice',
    icon: Target,
    color: 'blue'
  },
  { 
    id: 'comprehensive-50', 
    name: 'Comprehensive 50', 
    questions: 50, 
    description: 'Deep dive session',
    icon: BookOpen,
    color: 'purple'
  },
  { 
    id: 'nclex-75', 
    name: 'NCLEX Mini', 
    questions: 75, 
    description: 'Minimum NCLEX length',
    icon: Brain,
    color: 'indigo'
  },
  { 
    id: 'nclex-145', 
    name: 'Full NCLEX', 
    questions: 145, 
    description: 'Maximum NCLEX length',
    icon: Award,
    color: 'rose'
  },
];

export default function UnifiedPracticePage() {
  const navigate = useNavigate();
  
  // Configuration state
  const [questionCount, setQuestionCount] = useState(25);
  const [customCount, setCustomCount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<NCLEXCategory[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['multiple-choice', 'select-all']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed' | 'adaptive'>('mixed');
  const [timed, setTimed] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(90);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setQuestionCount(preset.questions);
    if (preset.questions >= 75) {
      setAdaptiveMode(true);
      setDifficulty('adaptive');
    }
  };

  const handleCustomCount = (value: string) => {
    setCustomCount(value);
    const num = parseInt(value);
    if (num >= 10 && num <= 145) {
      setQuestionCount(num);
    }
  };

  const handleCategoryToggle = (categoryId: NCLEXCategory) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === NCLEX_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(NCLEX_CATEGORIES.map(c => c.id));
    }
  };

  const handleTypeToggle = (typeId: QuestionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        // Don't allow deselecting all types
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== typeId);
      }
      return [...prev, typeId];
    });
  };

  const handleSelectAllTypes = () => {
    if (selectedTypes.length === QUESTION_TYPES.length) {
      setSelectedTypes(['multiple-choice']); // Keep at least one
    } else {
      setSelectedTypes(QUESTION_TYPES.map(t => t.id));
    }
  };

  const handleStartPractice = () => {
    setIsStarting(true);
    
    // Build query params for the practice session
    const params = new URLSearchParams({
      questions: questionCount.toString(),
      difficulty,
      timed: timed.toString(),
      timePerQuestion: timePerQuestion.toString(),
      feedback: instantFeedback.toString(),
      adaptive: adaptiveMode.toString(),
      categories: selectedCategories.length > 0 ? selectedCategories.join(',') : 'all',
      types: selectedTypes.join(',')
    });
    
    navigate(`/app/practice/session?${params.toString()}`);
  };

  const selectedCategoryCount = selectedCategories.length || NCLEX_CATEGORIES.length;
  const estimatedTime = Math.ceil((questionCount * (timed ? timePerQuestion : 90)) / 60);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')} title="Back to dashboard">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            NCLEX Practice
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Configure your practice session
          </p>
        </div>
      </div>

      {/* NCLEX Exam Simulator Banner */}
      <Card className="mb-6 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                NCLEX-RN Exam Simulator
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Authentic CAT exam experience • 85-150 questions • 5-hour time limit • No rationale during exam
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Real CAT Algorithm
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  95% CI Stopping Rule
                </Badge>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Pass/Fail Prediction
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/app/practice/nclex-exam')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Exam
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Start Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESETS.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = questionCount === preset.questions && !customCount;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? `border-${preset.color}-500 bg-${preset.color}-50 dark:bg-${preset.color}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? `text-${preset.color}-600` : 'text-gray-500'}`} />
                      <p className="font-semibold text-sm">{preset.name}</p>
                      <p className="text-xs text-gray-500">{preset.questions} questions</p>
                    </button>
                  );
                })}
              </div>
              
              {/* Custom Count */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Custom:</span>
                <input
                  type="number"
                  min="10"
                  max="145"
                  value={customCount}
                  onChange={(e) => handleCustomCount(e.target.value)}
                  placeholder="10-145"
                  className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center"
                />
                <span className="text-sm text-gray-500">questions</span>
              </div>
            </CardContent>
          </Card>

          {/* NCLEX Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  NCLEX Focus Areas
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleSelectAllCategories}>
                  {selectedCategories.length === NCLEX_CATEGORIES.length ? 'Clear All' : 'Select All'}
                </Button>
              </div>
              <CardDescription>
                Leave empty for all categories, or select specific areas to focus on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NCLEX_CATEGORIES.map(category => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{category.parent}</span>
                          <Badge variant="outline" className="text-xs">{category.percentage}</Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Question Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5 text-purple-600" />
                  NextGen Question Types
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleSelectAllTypes}>
                  {selectedTypes.length === QUESTION_TYPES.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <CardDescription>
                Practice with different NCLEX NGN item types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {QUESTION_TYPES.map(qType => {
                  const isSelected = selectedTypes.includes(qType.id);
                  return (
                    <button
                      key={qType.id}
                      onClick={() => handleTypeToggle(qType.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {qType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {qType.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{qType.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty & Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-orange-600" />
                Difficulty & Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Difficulty Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['easy', 'medium', 'hard', 'mixed', 'adaptive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => {
                        setDifficulty(level);
                        setAdaptiveMode(level === 'adaptive');
                      }}
                      className={`p-2 rounded-lg border-2 text-center capitalize transition-all ${
                        difficulty === level
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{level}</span>
                    </button>
                  ))}
                </div>
                {adaptiveMode && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Adaptive mode adjusts difficulty based on your performance (CAT-style)
                  </p>
                )}
              </div>

              {/* Mode Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Timed Mode */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Timed Mode</p>
                      <p className="text-xs text-gray-500">{timePerQuestion}s per question</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTimed(!timed)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      timed ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      timed ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Instant Feedback */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Instant Feedback</p>
                      <p className="text-xs text-gray-500">Show answers immediately</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInstantFeedback(!instantFeedback)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      instantFeedback ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      instantFeedback ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings (Collapsible) */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Advanced Settings
                </CardTitle>
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                {/* Time per question slider */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Time per Question: {timePerQuestion} seconds
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30s</span>
                    <span>90s</span>
                    <span>180s</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Questions</span>
                  <span className="font-bold text-xl text-blue-600">{questionCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Categories</span>
                  <span className="font-medium">
                    {selectedCategories.length === 0 ? 'All (8)' : selectedCategoryCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Question Types</span>
                  <span className="font-medium">{selectedTypes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Difficulty</span>
                  <Badge variant="outline" className="capitalize">{difficulty}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Mode</span>
                  <span className="font-medium">
                    {adaptiveMode ? 'Adaptive (CAT)' : timed ? 'Timed' : 'Untimed'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Feedback</span>
                  <span className="font-medium">{instantFeedback ? 'Instant' : 'At End'}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Estimated time: ~{estimatedTime} minutes</span>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg"
                  size="lg"
                  onClick={handleStartPractice}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Starting...
                    </span>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Practice
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> For NCLEX preparation, try the adaptive mode with all categories 
                  and question types to simulate the real exam experience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

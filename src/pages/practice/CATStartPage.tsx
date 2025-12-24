/**
 * CAT Test Start Page - Configure and start Computer Adaptive Test
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Play,
  Brain,
  Clock,
  Target,
  Lightbulb,
  BookOpen,
  Settings,
  Check,
  AlertTriangle
} from 'lucide-react';
// Using local simulator instead of backend API for now

const NCLEX_CATEGORIES = [
  { id: 'management-of-care', name: 'Management of Care', parent: 'Safe & Effective Care', icon: '🏥', percentage: '17-23%' },
  { id: 'safety-infection', name: 'Safety and Infection Control', parent: 'Safe & Effective Care', icon: '🛡️', percentage: '9-15%' },
  { id: 'health-promotion', name: 'Health Promotion', parent: 'Health Promotion', icon: '💪', percentage: '6-12%' },
  { id: 'psychosocial', name: 'Psychosocial Integrity', parent: 'Psychosocial', icon: '🧠', percentage: '6-12%' },
  { id: 'basic-care', name: 'Basic Care and Comfort', parent: 'Physiological Integrity', icon: '🛏️', percentage: '6-12%' },
  { id: 'pharmacological', name: 'Pharmacological Therapies', parent: 'Physiological Integrity', icon: '💊', percentage: '12-18%' },
  { id: 'risk-reduction', name: 'Reduction of Risk', parent: 'Physiological Integrity', icon: '🔬', percentage: '9-15%' },
  { id: 'physiological-adaptation', name: 'Physiological Adaptation', parent: 'Physiological Integrity', icon: '⚕️', percentage: '11-17%' },
];

export default function CATStartPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [questionCount, setQuestionCount] = useState(75);
  const [mode, setMode] = useState<'tutorial' | 'timed'>('tutorial');
  const [timeLimit, setTimeLimit] = useState(60);
  const [isStarting, setIsStarting] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const filtered = prev.filter(c => c !== 'all');
        if (filtered.includes(categoryId)) {
          const newCategories = filtered.filter(c => c !== categoryId);
          return newCategories.length > 0 ? newCategories : ['all'];
        }
        return [...filtered, categoryId];
      });
    }
  };

  const handleStartCAT = () => {
    setIsStarting(true);
    // Navigate to unified practice session with settings
    const params = new URLSearchParams({
      questions: questionCount.toString(),
      difficulty: 'adaptive',
      timed: mode === 'timed' ? 'true' : 'false',
      timePerQuestion: timeLimit.toString(),
      feedback: mode === 'tutorial' ? 'true' : 'false',
      adaptive: 'true',
      categories: selectedCategories.includes('all') ? 'all' : selectedCategories.join(','),
      types: 'multiple-choice,select-all,ordered-response,matrix'
    });
    navigate(`/app/practice/session?${params.toString()}`);
  };

  const selectedCount = selectedCategories.includes('all') ? NCLEX_CATEGORIES.length : selectedCategories.length;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/app/dashboard')} className="mb-6">
        <ArrowLeft className="size-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
              <Brain className="size-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">NCLEX-CAT Exam</CardTitle>
          <CardDescription className="text-lg">
            Computer Adaptive Test - Just like the real NCLEX-RN
          </CardDescription>
        </CardHeader>
      </Card>

      {/* CAT Info Banner */}
      <Card className="mb-6 border-2 border-amber-300 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertTriangle className="size-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                About Computer Adaptive Testing (CAT)
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Questions adapt to your ability level in real-time</li>
                <li>• Harder questions when you answer correctly, easier when incorrect</li>
                <li>• Uses Item Response Theory (IRT) for accurate ability estimation</li>
                <li>• Real NCLEX uses 75-145 questions with 5-hour time limit</li>
                <li>• Your passing probability is calculated throughout the test</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-blue-600" />
              Test Categories
            </CardTitle>
            <CardDescription>
              Select which NCLEX categories to include in your CAT test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* All Categories Option */}
            <button
              type="button"
              className={`w-full flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedCategories.includes('all')
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
              onClick={() => handleCategoryToggle('all')}
            >
              <div className={`mt-1 size-5 shrink-0 rounded border-2 flex items-center justify-center ${
                selectedCategories.includes('all')
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              }`}>
                {selectedCategories.includes('all') && <Check className="size-3 text-white" />}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 dark:text-white">All Categories (Recommended)</p>
                  <Badge className="bg-blue-600">Complete NCLEX-RN</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive test covering all 8 NCLEX-RN client needs categories
                </p>
              </div>
            </button>

            {/* Individual Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NCLEX_CATEGORIES.map((category) => {
                const isAllSelected = selectedCategories.includes('all');
                const isSelected = isAllSelected || selectedCategories.includes(category.id);
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`w-full flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-400'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className={`mt-1 size-5 shrink-0 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{category.parent}</span>
                        <Badge variant="outline" className="text-xs">{category.percentage}</Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection Summary */}
            <div className="bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Target className="size-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900 dark:text-purple-100">
                    {selectedCount} {selectedCount === 1 ? 'category' : 'categories'} selected
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {selectedCategories.includes('all') 
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
              <label className="font-medium text-gray-900 dark:text-white mb-3 block">Number of Questions</label>
              <div className="grid grid-cols-4 gap-3">
                {[25, 50, 75, 100].map(num => (
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                NCLEX-RN: 75-145 questions • Recommended: 75 questions
              </p>
            </div>

            {/* Test Mode */}
            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-3 block">Test Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={mode === 'tutorial' ? 'default' : 'outline'}
                  onClick={() => setMode('tutorial')}
                  className="h-auto p-4"
                >
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="size-5" />
                      <span className="font-medium">Tutorial Mode</span>
                    </div>
                    <p className="text-xs opacity-80">
                      No time limit, review rationales after each question
                    </p>
                  </div>
                </Button>
                <Button
                  variant={mode === 'timed' ? 'default' : 'outline'}
                  onClick={() => setMode('timed')}
                  className="h-auto p-4"
                >
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="size-5" />
                      <span className="font-medium">Timed Mode</span>
                    </div>
                    <p className="text-xs opacity-80">
                      Simulates real NCLEX timing conditions
                    </p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Time Limit (if timed) */}
            {mode === 'timed' && (
              <div>
                <label className="font-medium text-gray-900 dark:text-white mb-3 block">Time Limit (minutes)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[30, 60, 90, 120].map(mins => (
                    <Button
                      key={mins}
                      variant={timeLimit === mins ? 'default' : 'outline'}
                      onClick={() => setTimeLimit(mins)}
                      className="w-full"
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">How CAT Works:</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Starts with medium difficulty questions</li>
                    <li>• Adapts difficulty based on your answers</li>
                    <li>• Uses IRT to estimate your ability level</li>
                    <li>• Calculates passing probability in real-time</li>
                    <li>• Stops when 95% confident in pass/fail decision</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{questionCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mode === 'timed' ? `${timeLimit}m` : '∞'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Limit</p>
                </div>
              </div>
              
              <Button 
                onClick={handleStartCAT}
                disabled={isStarting}
                size="lg"
                className="w-full max-w-md bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                {isStarting ? (
                  'Starting...'
                ) : (
                  <>
                    <Play className="mr-2 size-5" />
                    Start CAT Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

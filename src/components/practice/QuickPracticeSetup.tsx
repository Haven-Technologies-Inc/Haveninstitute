import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Play, 
  Clock, 
  Layers, 
  Target,
  CheckCircle2,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCategories, useQuestionCount, useStartQuickPractice } from '../../services/hooks/usePractice';
import type { PracticeConfig } from '../../services/api/practiceApi';

const QUESTION_COUNTS = [5, 10, 20, 50, 100] as const;
const DIFFICULTIES = [
  { id: 'mixed', label: 'Mixed', description: 'All difficulty levels' },
  { id: 'easy', label: 'Easy', description: 'Foundational questions' },
  { id: 'medium', label: 'Medium', description: 'Intermediate level' },
  { id: 'hard', label: 'Hard', description: 'Challenge yourself' },
] as const;

interface QuickPracticeSetupProps {
  onBack?: () => void;
}

export function QuickPracticeSetup({ onBack }: QuickPracticeSetupProps) {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const startPractice = useStartQuickPractice();

  const [config, setConfig] = useState<Partial<PracticeConfig>>({
    questionCount: 10,
    categories: [],
    difficulty: 'mixed',
    timed: false,
    timePerQuestion: 90,
    instantFeedback: true
  });

  const { data: availableCount } = useQuestionCount(
    config.categories?.length ? config.categories : undefined,
    config.difficulty !== 'mixed' ? config.difficulty : undefined
  );

  const handleCategoryToggle = (categoryId: string) => {
    setConfig(prev => {
      const current = prev.categories || [];
      const updated = current.includes(categoryId)
        ? current.filter(c => c !== categoryId)
        : [...current, categoryId];
      return { ...prev, categories: updated };
    });
  };

  const handleStartPractice = async () => {
    try {
      const result = await startPractice.mutateAsync(config);
      navigate(`/app/practice/quick/${result.session.sessionId}`, {
        state: { session: result.session, question: result.firstQuestion }
      });
    } catch (error) {
      console.error('Failed to start practice:', error);
    }
  };

  const isValidConfig = (config.questionCount || 10) <= (availableCount || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600" />
            Quick Practice Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your practice session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Count */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Number of Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {QUESTION_COUNTS.map(count => (
                  <Button
                    key={count}
                    variant={config.questionCount === count ? 'default' : 'outline'}
                    className={config.questionCount === count 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : ''
                    }
                    onClick={() => setConfig(prev => ({ ...prev, questionCount: count }))}
                  >
                    {count} Questions
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff.id}
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      difficulty: diff.id as PracticeConfig['difficulty'] 
                    }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      config.difficulty === diff.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{diff.label}</p>
                    <p className="text-xs text-gray-500">{diff.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Categories
                <Badge variant="secondary" className="ml-2">
                  {config.categories?.length || 0} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories?.map(cat => {
                    const isSelected = config.categories?.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.id)}
                        className={`p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {cat.name}
                          </p>
                          <p className="text-xs text-gray-500">{cat.questionCount} questions</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Leave empty to include all categories
              </p>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Additional Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timed Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Timed Mode</p>
                  <p className="text-sm text-gray-500">
                    {config.timePerQuestion} seconds per question
                  </p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, timed: !prev.timed }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.timed ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.timed ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Instant Feedback */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Instant Feedback</p>
                  <p className="text-sm text-gray-500">
                    Show correct answer after each question
                  </p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, instantFeedback: !prev.instantFeedback }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.instantFeedback ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.instantFeedback ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Questions</span>
                  <span className="font-medium">{config.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-medium capitalize">{config.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Categories</span>
                  <span className="font-medium">
                    {config.categories?.length || 'All'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-medium">
                    {config.timed ? 'Timed' : 'Untimed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Feedback</span>
                  <span className="font-medium">
                    {config.instantFeedback ? 'Instant' : 'End'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Available Questions</span>
                  <span className={`font-medium ${
                    isValidConfig ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {availableCount ?? '...'}
                  </span>
                </div>
                {!isValidConfig && availableCount !== undefined && (
                  <p className="text-xs text-red-500 mb-4">
                    Not enough questions. Please reduce count or adjust filters.
                  </p>
                )}
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                size="lg"
                disabled={!isValidConfig || startPractice.isPending}
                onClick={handleStartPractice}
              >
                {startPractice.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Starting...
                  </span>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default QuickPracticeSetup;

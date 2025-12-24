/**
 * Quiz Start Page - Select category, difficulty, and question count
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
  Target,
  Zap,
  TrendingUp,
  Award,
  Filter,
  Shuffle,
  Clock,
  BookOpen
} from 'lucide-react';
import { useStartQuiz, useQuizCategories } from '../../services/hooks/useQuiz';

const NCLEX_CATEGORIES = [
  { id: 'safe_effective_care', name: 'Safe & Effective Care', icon: '🏥', description: 'Management of Care, Safety and Infection Control' },
  { id: 'health_promotion', name: 'Health Promotion', icon: '💪', description: 'Disease Prevention, Health Screening' },
  { id: 'psychosocial', name: 'Psychosocial Integrity', icon: '🧠', description: 'Mental Health, Coping, Therapeutic Communication' },
  { id: 'physiological_basic', name: 'Basic Care & Comfort', icon: '🛏️', description: 'Nutrition, Mobility, Personal Hygiene' },
  { id: 'physiological_complex', name: 'Complex Physiological', icon: '⚕️', description: 'Pharmacology, Fluid Balance, Critical Care' },
];

export default function QuizStartPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  const startQuizMutation = useStartQuiz();
  const { data: categories } = useQuizCategories();

  const handleStartQuiz = async () => {
    try {
      const result = await startQuizMutation.mutateAsync({
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty,
        questionCount,
        shuffle: shuffleQuestions
      });
      
      // Navigate to quiz with session ID
      navigate(`/app/quiz/${result.sessionId}`);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/app/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 size-4" />
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Number of Questions
            </label>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'mixed', label: 'Mixed', icon: Target },
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
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Shuffle className="size-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Shuffle Questions</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Randomize question order</p>
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

      {/* Category Selection */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select a Category</h3>
        
        {/* All Categories Option */}
        <Card
          className={`mb-4 cursor-pointer transition-all ${
            selectedCategory === null 
              ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'hover:border-blue-300'
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎯</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">All Categories</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive practice across all NCLEX topics
                </p>
              </div>
              <Badge variant={selectedCategory === null ? 'default' : 'outline'}>
                Recommended
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Individual Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NCLEX_CATEGORIES.map(category => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                selectedCategory === category.id 
                  ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-5xl">{category.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{selectedDifficulty}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory ? NCLEX_CATEGORIES.find(c => c.id === selectedCategory)?.name.split(' ')[0] : 'All'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
              </div>
            </div>
            
            <Button 
              onClick={handleStartQuiz}
              disabled={startQuizMutation.isPending}
              size="lg"
              className="w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {startQuizMutation.isPending ? (
                <>Loading...</>
              ) : (
                <>
                  <Play className="mr-2 size-5" />
                  Start Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

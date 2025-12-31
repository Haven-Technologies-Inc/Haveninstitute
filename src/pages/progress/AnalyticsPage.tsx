import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PerformanceAnalytics } from '../../components/analytics/PerformanceAnalytics';
import { useCATHistory, useQuizHistory } from '../../services/hooks';
import { NCLEX_CATEGORIES } from '../../types/nextGenNCLEX';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  
  // Fetch real data from API
  const { data: catHistory = [], isLoading: catLoading } = useCATHistory(20);
  const { data: quizHistory = [], isLoading: quizLoading } = useQuizHistory({ limit: 50 });

  // Transform CAT history to expected format
  const nclexResults = catHistory.map((item, index) => ({
    id: `cat-${index}`,
    date: new Date(item.date),
    passed: item.passingProbability >= 70,
    abilityEstimate: item.abilityEstimate,
    confidenceInterval: [-1, 1] as [number, number],
    standardError: 0.3,
    questionsAnswered: item.total,
    timeSpent: item.timeSpent,
    passingProbability: item.passingProbability,
    categoryPerformance: NCLEX_CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = { correct: 0, total: 0, percentage: 0 };
      return acc;
    }, {} as Record<string, { correct: number; total: number; percentage: number }>),
    stoppingReason: 'confidence_interval'
  }));

  // Transform quiz history to expected format
  const practiceResults = quizHistory.map((item, index) => ({
    id: `quiz-${index}`,
    date: new Date(item.date),
    score: item.score,
    total: item.total,
    percentage: Math.round((item.score / item.total) * 100),
    timeSpent: item.timeSpent,
    categories: [item.category] as any[],
    questionTypes: ['multiple-choice'],
    difficulty: 'medium',
    adaptive: false
  }));

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      'practice': '/app/practice/unified',
      'nclex-exam': '/app/practice/nclex-exam',
      'dashboard': '/app/dashboard'
    };
    navigate(routes[view] || '/app/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Track your NCLEX preparation progress
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {(catLoading || quizLoading) ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <PerformanceAnalytics 
          nclexResults={nclexResults}
          practiceResults={practiceResults}
          onNavigate={handleNavigate} 
        />
      )}
    </div>
  );
}

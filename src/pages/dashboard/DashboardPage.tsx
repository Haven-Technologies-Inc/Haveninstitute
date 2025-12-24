import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../components/Dashboard';
import { useAuth } from '../../components/auth/AuthContext';
import { useQuizHistory, useCATHistory } from '../../services/hooks';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch real data using React Query hooks
  const { data: quizHistory = [], isLoading: quizLoading } = useQuizHistory({ limit: 10 });
  const { data: catHistory = [], isLoading: catLoading } = useCATHistory(10);

  // Transform API data to match Dashboard component props
  const quizResults = quizHistory.map(item => ({
    topic: item.category,
    score: item.score,
    total: item.total,
    date: new Date(item.date),
    timeSpent: item.timeSpent,
  }));

  const catResults = catHistory.map(item => ({
    topic: 'CAT Test',
    score: item.score,
    total: item.total,
    date: new Date(item.date),
    timeSpent: item.timeSpent,
    passingProbability: item.passingProbability / 100,
    abilityEstimate: item.abilityEstimate,
    confidenceInterval: [-1, 1] as [number, number],
    categoryPerformance: {},
  }));

  const handleStartQuiz = (topic: string) => {
    navigate(`/app/practice/quiz?topic=${encodeURIComponent(topic)}`);
  };

  const handleStartFlashcards = (topic: string) => {
    navigate(`/app/study/flashcards?topic=${encodeURIComponent(topic)}`);
  };

  const handleStartCATTest = () => {
    navigate('/app/practice/cat');
  };

  // Map view names to actual route paths
  const routeMap: Record<string, string> = {
    'books': '/app/study/books',
    'planner': '/app/progress/planner',
    'forum': '/app/community/forum',
    'group-study': '/app/community/groups',
    'analytics': '/app/progress/analytics',
    'subscription': '/app/account/subscription',
    'flashcards': '/app/study/flashcards',
    'progress': '/app/progress',
    'ai-chat': '/app/study/ai',
    'question-management': '/admin/questions',
    'practice': '/app/practice/unified',
  };

  const handleNavigate = (view: string) => {
    const route = routeMap[view] || `/app/${view}`;
    navigate(route);
  };

  return (
    <Dashboard
      onStartQuiz={handleStartQuiz}
      onStartFlashcards={handleStartFlashcards}
      onStartCATTest={handleStartCATTest}
      onNavigate={handleNavigate}
      recentResults={quizResults}
      catResults={catResults}
    />
  );
}

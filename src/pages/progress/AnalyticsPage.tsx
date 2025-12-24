import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PerformanceAnalytics } from '../../components/analytics/PerformanceAnalytics';

export default function AnalyticsPage() {
  const navigate = useNavigate();

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      'practice': '/app/practice/unified',
      'nclex-exam': '/app/practice/nclex-exam',
      'dashboard': '/app/dashboard'
    };
    navigate(routes[view] || '/app/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your NCLEX preparation progress with detailed insights
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <PerformanceAnalytics onNavigate={handleNavigate} />
    </div>
  );
}

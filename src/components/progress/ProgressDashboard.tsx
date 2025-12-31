import { 
  TrendingUp, 
  Target, 
  Flame, 
  Award, 
  Brain, 
  Clock, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useDashboard, useInsights } from '../../services/hooks/useProgress';

export function ProgressDashboard() {
  const { data: dashboard, isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const { data: insights, isLoading: insightsLoading, error: insightsError } = useInsights();

  // Show loading state
  if (dashboardLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Fallback data for when API returns nothing or errors
  const stats = dashboard?.stats || {
    questionsAnswered: 0,
    quizAccuracy: 0,
    catTestsTaken: 0,
    catPassRate: 0,
    currentAbility: 0,
    totalStudyTime: 0,
    confidenceLevel: 0
  };
  const streak = dashboard?.streak || { current: 0, longest: 0 };
  const goals = dashboard?.goals || [];
  
  // Fallback insights
  const safeInsights = insights || {
    categoryPerformance: [],
    weeklyActivity: [
      { day: 'Mon', questions: 0 },
      { day: 'Tue', questions: 0 },
      { day: 'Wed', questions: 0 },
      { day: 'Thu', questions: 0 },
      { day: 'Fri', questions: 0 },
      { day: 'Sat', questions: 0 },
      { day: 'Sun', questions: 0 }
    ],
    strengths: [],
    weaknesses: [],
    recommendations: []
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.questionsAnswered || 0}</p>
                <p className="text-sm opacity-80">Questions Answered</p>
              </div>
              <Brain className="w-10 h-10 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.quizAccuracy || 0}%</p>
                <p className="text-sm opacity-80">Quiz Accuracy</p>
              </div>
              <Target className="w-10 h-10 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{streak?.current || 0}</p>
                <p className="text-sm opacity-80">Day Streak</p>
              </div>
              <Flame className="w-10 h-10 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalStudyTime || 0}</p>
                <p className="text-sm opacity-80">Minutes Studied</p>
              </div>
              <Clock className="w-10 h-10 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* CAT Performance */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              NCLEX Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats?.catTestsTaken || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">CAT Tests</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats?.catPassRate || 0}%</p>
                <p className="text-xs sm:text-sm text-gray-500">Pass Rate</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats?.confidenceLevel || 0}%</p>
                <p className="text-xs sm:text-sm text-gray-500">Confidence</p>
              </div>
              <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{((stats?.currentAbility || 0) + 3).toFixed(1)}</p>
                <p className="text-xs sm:text-sm text-gray-500">Ability Level</p>
              </div>
            </div>

            {/* Passing Probability Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Passing Probability</span>
                <span className="font-medium text-indigo-600">
                  {stats?.confidenceLevel || 0}%
                </span>
              </div>
              <Progress value={stats?.confidenceLevel || 0} className="h-3" />
              <p className="text-xs text-gray-500">
                Based on your latest CAT performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Study Goals */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              Study Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {goal.title}
                      </span>
                      <span className="text-gray-500">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No active goals</p>
                <p className="text-xs text-gray-400">Set goals to track your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeInsights.categoryPerformance?.length > 0 ? safeInsights.categoryPerformance.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        cat.percentage >= 70 ? 'text-green-600' :
                        cat.percentage >= 50 ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        {cat.percentage}%
                      </span>
                      {cat.percentage >= 70 ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : cat.percentage < 50 ? (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  <Progress 
                    value={cat.percentage} 
                    className={`h-2 ${
                      cat.percentage >= 70 ? '[&>div]:bg-green-500' :
                      cat.percentage >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">
                  Take some practice tests to see your category breakdown
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeInsights.strengths && safeInsights.strengths.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-400">Strengths</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {safeInsights.strengths.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {safeInsights.weaknesses && safeInsights.weaknesses.length > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-400">Areas to Improve</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {safeInsights.weaknesses.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {safeInsights.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                </div>
              ))}

              {(!safeInsights.recommendations || safeInsights.recommendations.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  Complete more activities to get personalized recommendations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            This Week's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 sm:h-40 gap-1 sm:gap-2">
            {safeInsights.weeklyActivity?.map((day) => {
              const maxQuestions = Math.max(...(safeInsights.weeklyActivity?.map(d => d.questions) || [1]));
              const height = maxQuestions > 0 ? (day.questions / maxQuestions) * 100 : 0;
              
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">{day.day}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{day.questions}q</p>
                  </div>
                </div>
              );
            }) || (
              <p className="text-center text-gray-500 w-full py-8">
                No activity data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressDashboard;

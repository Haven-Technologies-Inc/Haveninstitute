import { 
  Brain, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Target, 
  Award,
  Clock,
  CheckCircle,
  BarChart3,
  TrendingDown,
  Activity,
  Flame,
  Calendar,
  Users,
  MessageSquare,
  BookMarked
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { QuizResult, CATResult } from '../App';
import { useAuth } from './auth/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface DashboardProps {
  onStartQuiz: (topic: string) => void;
  onStartFlashcards: (topic: string) => void;
  onStartCATTest: () => void;
  onNavigate: (view: 'progress' | 'analytics' | 'forum' | 'group-study' | 'planner' | 'subscription' | 'books') => void;
  recentResults: QuizResult[];
  catResults: CATResult[];
}

const NCLEX_CATEGORIES = [
  { name: 'Management of Care', short: 'Mgmt', color: '#3b82f6' },
  { name: 'Safety & Infection', short: 'Safety', color: '#10b981' },
  { name: 'Health Promotion', short: 'Health', color: '#f59e0b' },
  { name: 'Psychosocial', short: 'Psych', color: '#8b5cf6' },
  { name: 'Basic Care', short: 'Basic', color: '#6366f1' },
  { name: 'Pharmacology', short: 'Pharm', color: '#ec4899' },
  { name: 'Risk Reduction', short: 'Risk', color: '#f97316' },
  { name: 'Physiological', short: 'Physio', color: '#ef4444' }
];

export function Dashboard({ 
  onStartQuiz, 
  onStartFlashcards, 
  onStartCATTest, 
  onNavigate, 
  recentResults,
  catResults 
}: DashboardProps) {
  const { user } = useAuth();

  // Calculate statistics
  const totalQuizzes = recentResults.length;
  const totalCATs = catResults.length;
  const averageScore = recentResults.length > 0 
    ? Math.round(recentResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / recentResults.length)
    : 0;
  
  const latestCAT = catResults.length > 0 ? catResults[catResults.length - 1] : null;
  const passingConfidence = latestCAT 
    ? Math.round(latestCAT.passingProbability * 100) 
    : 0;

  // Study streak calculation (mock data for now)
  const studyStreak = 7;
  const hoursStudied = 24;

  // Confidence over time data
  const confidenceData = catResults.map((result, index) => ({
    test: `CAT ${index + 1}`,
    confidence: Math.round(result.passingProbability * 100),
    ability: result.abilityEstimate,
    date: new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Add mock data if no CAT results
  if (confidenceData.length === 0) {
    confidenceData.push(
      { test: 'CAT 1', confidence: 45, ability: -0.5, date: 'Jan 1' },
      { test: 'CAT 2', confidence: 58, ability: 0.1, date: 'Jan 8' },
      { test: 'CAT 3', confidence: 67, ability: 0.4, date: 'Jan 15' },
      { test: 'CAT 4', confidence: 73, ability: 0.7, date: 'Jan 22' }
    );
  }

  // Category performance data
  const categoryPerformance = NCLEX_CATEGORIES.map(cat => {
    const relevantResults = recentResults.filter(r => 
      r.topic.toLowerCase().includes(cat.short.toLowerCase())
    );
    const score = relevantResults.length > 0
      ? Math.round(relevantResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / relevantResults.length)
      : Math.floor(Math.random() * 30) + 60; // Mock data
    
    return {
      subject: cat.short,
      score: score,
      fullMark: 100,
      color: cat.color
    };
  });

  // Weekly activity data
  const weeklyActivity = [
    { day: 'Mon', questions: 45, time: 60 },
    { day: 'Tue', questions: 32, time: 45 },
    { day: 'Wed', questions: 58, time: 75 },
    { day: 'Thu', questions: 41, time: 55 },
    { day: 'Fri', questions: 67, time: 90 },
    { day: 'Sat', questions: 53, time: 70 },
    { day: 'Sun', questions: 38, time: 50 }
  ];

  // Recent activity
  const recentActivity = [
    { action: 'Completed CAT Test', score: '82%', time: '2 hours ago', type: 'cat' },
    { action: 'Pharmacology Quiz', score: '90%', time: '5 hours ago', type: 'quiz' },
    { action: 'Safety Protocol Flashcards', score: '45/50', time: '1 day ago', type: 'flashcard' },
    { action: 'Practice Quiz - Basic Care', score: '78%', time: '2 days ago', type: 'quiz' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Let's continue your journey to NCLEX success</p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NCLEX Confidence */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 dark:from-blue-700 dark:to-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Target className="size-5" />
              NCLEX Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl mb-1 text-white">{passingConfidence}%</div>
            <p className="text-blue-100 text-sm">
              {passingConfidence >= 70 ? '🎉 High pass probability!' : passingConfidence >= 50 ? '📈 Keep improving!' : '💪 Building foundation'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Progress value={passingConfidence} className="h-2 bg-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
              <Flame className="size-5 text-orange-500 dark:text-orange-400" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl text-orange-600 dark:text-orange-400 mb-1">{studyStreak} days</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Keep it going! 🔥</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 flex-1 rounded ${
                    i < studyStreak ? 'bg-orange-500 dark:bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
              <TrendingUp className="size-5 text-green-500 dark:text-green-400" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl text-green-600 dark:text-green-400 mb-1">{averageScore}%</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {totalQuizzes} practice sessions
            </p>
            <div className="mt-3">
              <Progress value={averageScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Time Invested */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg dark:text-white">
              <Clock className="size-5 text-indigo-500 dark:text-indigo-400" />
              Time Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl text-indigo-600 dark:text-indigo-400 mb-1">{hoursStudied}h</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">This week</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Activity className="size-4" />
              <span>+3.5h from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NCLEX Passing Confidence Trend */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                    <TrendingUp className="size-5 text-white" />
                  </div>
                  NCLEX Passing Confidence
                </CardTitle>
                <CardDescription className="mt-2 dark:text-gray-400">
                  Track your improvement over time and readiness
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {confidenceData.length > 0 ? confidenceData[confidenceData.length - 1].confidence : 0}%
              </Badge>
            </div>
            
            {/* Confidence Indicator */}
            {confidenceData.length > 0 && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Readiness</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {confidenceData[confidenceData.length - 1].confidence}%
                  </span>
                </div>
                <Progress 
                  value={confidenceData[confidenceData.length - 1].confidence} 
                  className="h-3"
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={
                    confidenceData[confidenceData.length - 1].confidence >= 70 
                      ? "text-green-600 dark:text-green-400 font-semibold" 
                      : "text-orange-600 dark:text-orange-400"
                  }>
                    {confidenceData[confidenceData.length - 1].confidence >= 90 ? "🎉 Excellent - Exam Ready!" :
                     confidenceData[confidenceData.length - 1].confidence >= 70 ? "✅ Good - On Track to Pass" :
                     confidenceData[confidenceData.length - 1].confidence >= 50 ? "📈 Improving - Keep Going" :
                     "💪 Building Foundation"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">70% Pass Threshold</span>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {confidenceData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceData}>
                    <defs>
                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorAbility" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      className="dark:stroke-gray-500"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#9ca3af" 
                      className="dark:stroke-gray-500"
                      tick={{ fill: '#9ca3af' }}
                      label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: any) => [`${value}%`, '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConfidence)" 
                      name="Passing Confidence"
                    />
                    {/* Reference line at 70% */}
                    <Line 
                      type="monotone" 
                      dataKey={() => 70} 
                      stroke="#10b981" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                      dot={false}
                      name="Pass Threshold"
                    />
                    {/* Reference line at 90% (Excellence) */}
                    <Line 
                      type="monotone" 
                      dataKey={() => 90} 
                      stroke="#eab308" 
                      strokeDasharray="3 3" 
                      strokeWidth={1}
                      dot={false}
                      name="Excellence"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                {/* Legend & Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Your Confidence</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {confidenceData[confidenceData.length - 1].confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-3 h-1 bg-green-500 rounded"></div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pass Threshold</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">70%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                {confidenceData.length >= 2 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-blue-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {confidenceData[confidenceData.length - 1].confidence > confidenceData[confidenceData.length - 2].confidence ? (
                        <>
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              +{(confidenceData[confidenceData.length - 1].confidence - confidenceData[confidenceData.length - 2].confidence).toFixed(1)}% Improvement
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Great progress! Keep up the excellent work 🎯
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <Target className="size-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Keep Practicing
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Focus on weak areas to boost your confidence
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
                  <Target className="size-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start Your Journey
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Take your first CAT test to track your passing confidence and monitor your progress over time
                </p>
                <Button 
                  onClick={onStartCATTest}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Target className="size-4 mr-2" />
                  Start CAT Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance Radar */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <BarChart3 className="size-5 text-purple-600 dark:text-purple-400" />
              Category Performance
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Strengths across NCLEX categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={categoryPerformance}>
                <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {categoryPerformance.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-gray-600 dark:text-gray-400">{NCLEX_CATEGORIES[idx].name}: {cat.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-b dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl dark:text-white">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                    <Activity className="size-5 text-white" />
                  </div>
                  Weekly Activity
                </CardTitle>
                <CardDescription className="mt-2 dark:text-gray-400">
                  Your daily practice performance and consistency
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {weeklyActivity.reduce((acc, day) => acc + day.questions, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">questions</div>
              </div>
            </div>

            {/* Week Summary Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg/Day</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(weeklyActivity.reduce((acc, day) => acc + day.questions, 0) / 7)}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="size-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Best Day</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.max(...weeklyActivity.map(d => d.questions))}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="size-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Total Time</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.round(weeklyActivity.reduce((acc, day) => acc + day.time, 0) / 60)}h
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  className="dark:stroke-gray-500"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  className="dark:stroke-gray-500"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Questions', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'questions') return [value, 'Questions'];
                    if (name === 'time') return [`${value} min`, 'Study Time'];
                    return [value, name];
                  }}
                />
                <Bar 
                  dataKey="questions" 
                  fill="url(#colorQuestions)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Day-by-Day Breakdown */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                <span className="font-semibold">Daily Breakdown</span>
                <span className="font-semibold">Questions • Time</span>
              </div>
              {weeklyActivity.map((day, idx) => {
                const isToday = idx === new Date().getDay() || (new Date().getDay() === 0 && idx === 6);
                const maxQuestions = Math.max(...weeklyActivity.map(d => d.questions));
                const percentage = (day.questions / maxQuestions) * 100;
                
                return (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isToday 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                    <div className={`text-xs font-semibold w-8 ${
                      isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs min-w-[100px] justify-end">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {day.questions}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {day.time} min
                          </span>
                        </div>
                      </div>
                    </div>
                    {day.questions >= 50 && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                        Goal ✓
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Weekly Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-green-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {weeklyActivity.filter(d => d.questions >= 50).length} days above goal this week! 
                    {weeklyActivity.filter(d => d.questions >= 50).length >= 5 ? ' 🎉' : ' 💪'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {weeklyActivity.filter(d => d.questions >= 50).length >= 5 
                      ? "Outstanding consistency! You're building strong study habits."
                      : `You're ${7 - weeklyActivity.filter(d => d.questions >= 50).length} day(s) away from a perfect week. Keep pushing!`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl">
                    {weeklyActivity.filter(d => d.questions >= 50).length >= 5 ? '🏆' : '🎯'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Start your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onStartCATTest}
            >
              <Target className="size-4 mr-2" />
              Take CAT Test
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartQuiz('management-of-care')}
            >
              <Brain className="size-4 mr-2" />
              Practice Quiz
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onStartFlashcards('pharmacological-therapies')}
            >
              <BookOpen className="size-4 mr-2" />
              Study Flashcards
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('books')}
            >
              <BookMarked className="size-4 mr-2" />
              Read Books
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Study Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Clock className="size-5 text-orange-600 dark:text-orange-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Your latest study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'cat' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                    activity.type === 'quiz' ? 'bg-purple-100 dark:bg-purple-900/30' : 
                    'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {activity.type === 'cat' && <Target className="size-5 text-blue-600 dark:text-blue-400" />}
                    {activity.type === 'quiz' && <Brain className="size-5 text-purple-600 dark:text-purple-400" />}
                    {activity.type === 'flashcard' && <BookOpen className="size-5 text-green-600 dark:text-green-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                    {activity.score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Goals */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Award className="size-5 text-yellow-600 dark:text-yellow-400" />
              Study Goals
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Track your weekly targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">Daily Practice Questions</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">45/50</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">Weekly Study Hours</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">18/20h</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">Flashcard Reviews</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">120/150</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">CAT Tests Completed</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">3/4</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate('planner')}>
              <Calendar className="size-4 mr-2" />
              View Study Planner
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Community & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700" onClick={() => onNavigate('forum')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <MessageSquare className="size-5 text-blue-600 dark:text-blue-400" />
              Discussion Forum
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Connect with other students</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">423 active discussions</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">52 new posts today</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700" onClick={() => onNavigate('group-study')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Users className="size-5 text-purple-600 dark:text-purple-400" />
              Group Study
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Study with peers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">12 study groups available</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Next session in 2 hours</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700" onClick={() => onNavigate('analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <BarChart3 className="size-5 text-green-600 dark:text-green-400" />
              AI Analytics
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Detailed performance insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">View detailed breakdown</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get AI recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription CTA (for Free tier) */}
      {user?.subscription === 'Free' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl mb-2 flex items-center gap-2 dark:text-white">
                  <Award className="size-6 text-yellow-600 dark:text-yellow-400" />
                  Unlock Your Full Potential
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upgrade to Pro or Premium for unlimited practice questions, advanced analytics, and personalized study plans
                </p>
                <Button 
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                  onClick={() => onNavigate('subscription')}
                >
                  View Plans
                </Button>
              </div>
              <GraduationCap className="size-24 text-yellow-600 dark:text-yellow-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
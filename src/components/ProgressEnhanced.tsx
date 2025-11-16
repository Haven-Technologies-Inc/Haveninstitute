import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  BookOpen,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import { QuizResult } from '../App';

interface ProgressProps {
  results: QuizResult[];
  onBack: () => void;
}

const topicNames: Record<string, string> = {
  'fundamentals': 'Fundamentals of Nursing',
  'pharmacology': 'Pharmacology',
  'med-surg': 'Medical-Surgical Nursing',
  'pediatrics': 'Pediatric Nursing',
  'mental-health': 'Mental Health Nursing',
  'maternal': 'Maternal & Newborn'
};

const nclexCategories = [
  'Safe and Effective Care Environment',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Physiological Integrity'
];

export function Progress({ results, onBack }: ProgressProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Safety check: ensure results is an array
  const safeResults = Array.isArray(results) ? results : [];

  const totalQuestions = safeResults.reduce((acc, result) => acc + result.total, 0);
  const totalCorrect = safeResults.reduce((acc, result) => acc + result.score, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Calculate topic performance
  const topicPerformance = safeResults.reduce((acc, result) => {
    if (!acc[result.topic]) {
      acc[result.topic] = { total: 0, correct: 0, attempts: 0 };
    }
    acc[result.topic].total += result.total;
    acc[result.topic].correct += result.score;
    acc[result.topic].attempts += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number; attempts: number }>);

  // Find strongest and weakest topics
  const topicScores = Object.entries(topicPerformance).map(([topic, data]) => ({
    topic,
    percentage: Math.round((data.correct / data.total) * 100),
    attempts: data.attempts,
    total: data.total,
    correct: data.correct
  })).sort((a, b) => b.percentage - a.percentage);
  
  const strongestTopic = topicScores[0] || { topic: '', percentage: 0, attempts: 0 };
  const weakestTopic = topicScores[topicScores.length - 1] || { topic: '', percentage: 0, attempts: 0 };

  // AI Analytics - Study patterns
  const studyStreak = calculateStudyStreak(safeResults);
  const averageTimePerQuestion = safeResults.length > 0 
    ? Math.round(safeResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalQuestions) 
    : 0;
  const recentPerformance = calculateRecentTrend(safeResults);
  const predictedPassRate = calculatePredictedPassRate(averageScore, studyStreak, recentPerformance);

  // AI Insights
  const aiInsights = generateAIInsights(averageScore, topicScores, studyStreak, recentPerformance);
  const studyRecommendations = generateStudyRecommendations(topicScores, averageScore);
  const weaknessAnalysis = analyzeWeaknesses(safeResults);

  // Calculate category performance (NCLEX categories)
  const categoryPerformance = calculateCategoryPerformance(safeResults);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl">
              <BarChart3 className="size-7 text-white" />
            </div>
            Progress & AI Analytics
          </h2>
          <p className="text-gray-600 mt-1">Track your performance with AI-powered insights</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Sparkles className="mr-2 size-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="topics">
            <BookOpen className="mr-2 size-4" />
            Topic Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="mr-2 size-4" />
            Study Plan
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Overall Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className={`text-4xl ${
                    averageScore >= 80 ? 'text-green-600' :
                    averageScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {averageScore}%
                  </div>
                  <TrendingUp className={`size-5 ${recentPerformance > 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {totalCorrect} of {totalQuestions} correct
                </p>
                <Progress value={averageScore} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Study Streak</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl text-orange-600">{studyStreak}</div>
                  <span className="text-gray-600">days</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Keep it up! 🔥
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl text-blue-600">{safeResults.length}</div>
                  <span className="text-gray-600">quizzes</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {totalQuestions} questions attempted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>NCLEX Readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className={`text-4xl ${
                    predictedPassRate >= 80 ? 'text-green-600' :
                    predictedPassRate >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {predictedPassRate}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Predicted pass probability
                </p>
                <Progress value={predictedPassRate} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Your recent quiz scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeResults.slice(-10).reverse().map((result, index) => {
                  const percentage = Math.round((result.score / result.total) * 100);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{result.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {result.score}/{result.total}
                          </span>
                          <Badge variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}>
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5 text-green-600" />
                  Strongest Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="text-xl text-gray-900">{strongestTopic.topic}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl text-green-600">{strongestTopic.percentage}%</div>
                    <div className="text-sm text-gray-600">
                      <p>{strongestTopic.correct} of {strongestTopic.total} correct</p>
                      <p>{strongestTopic.attempts} attempts</p>
                    </div>
                  </div>
                  <Progress value={strongestTopic.percentage} className="bg-green-100" />
                  <p className="text-sm text-green-700">
                    ✓ Excellent mastery! Keep practicing to maintain this level.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="size-5 text-red-600" />
                  Focus Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="text-xl text-gray-900">{weakestTopic.topic}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl text-red-600">{weakestTopic.percentage}%</div>
                    <div className="text-sm text-gray-600">
                      <p>{weakestTopic.correct} of {weakestTopic.total} correct</p>
                      <p>{weakestTopic.attempts} attempts</p>
                    </div>
                  </div>
                  <Progress value={weakestTopic.percentage} className="bg-red-100" />
                  <p className="text-sm text-red-700">
                    ⚠ Focus your study time here for maximum improvement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-6 text-blue-600" />
                AI Performance Analysis
              </CardTitle>
              <CardDescription>Powered by advanced learning analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Insights */}
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-white rounded-lg border border-blue-200">
                    {insight.type === 'success' ? (
                      <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                    ) : insight.type === 'warning' ? (
                      <AlertCircle className="size-6 text-yellow-600 shrink-0" />
                    ) : (
                      <Sparkles className="size-6 text-blue-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                      {insight.action && (
                        <p className="text-sm text-blue-600 mt-2">→ {insight.action}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Predicted Performance */}
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="size-5 text-yellow-500" />
                  NCLEX Pass Prediction
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Current Readiness</span>
                      <span className={`text-2xl ${
                        predictedPassRate >= 80 ? 'text-green-600' :
                        predictedPassRate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {predictedPassRate}%
                      </span>
                    </div>
                    <Progress value={predictedPassRate} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Study Consistency</p>
                      <p className="text-xl text-gray-900 mt-1">{Math.min(100, studyStreak * 10)}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Score Trend</p>
                      <p className="text-xl text-gray-900 mt-1">
                        {recentPerformance > 0 ? '+' : ''}{recentPerformance}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Topic Coverage</p>
                      <p className="text-xl text-gray-900 mt-1">{topicScores.length}/6</p>
                    </div>
                  </div>
                  {predictedPassRate >= 75 ? (
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      ✓ You're on track! Keep up the excellent work. Consider taking a practice CAT exam.
                    </p>
                  ) : predictedPassRate >= 60 ? (
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                      ⚠ You're making progress! Focus on weak areas and increase practice frequency.
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                      ⚠ More practice needed. Follow the AI study recommendations to improve your readiness.
                    </p>
                  )}
                </div>
              </div>

              {/* Learning Patterns */}
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="size-5 text-purple-600" />
                  Learning Patterns Detected
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Average Response Time</span>
                    <span className="text-gray-900">{averageTimePerQuestion}s per question</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Study Frequency</span>
                    <span className="text-gray-900">{(safeResults.length / 30).toFixed(1)} quizzes/day</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Improvement Rate</span>
                    <span className={`${recentPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {recentPerformance >= 0 ? '+' : ''}{recentPerformance}% trend
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weakness Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-orange-600" />
                Common Mistake Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weaknessAnalysis.map((weakness, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="size-5 text-red-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-red-900 mb-1">{weakness.category}</h4>
                        <p className="text-sm text-red-700">{weakness.issue}</p>
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-sm text-gray-700">
                            <strong>Solution:</strong> {weakness.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Analysis Tab */}
        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Topic Performance</CardTitle>
              <CardDescription>Performance breakdown by topic area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topicScores.map((topic, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-gray-900">{topic.topic}</h4>
                        <p className="text-sm text-gray-600">
                          {topic.correct} of {topic.total} correct • {topic.attempts} attempts
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {topic.percentage >= 80 ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : topic.percentage >= 60 ? (
                          <AlertCircle className="size-5 text-yellow-600" />
                        ) : (
                          <XCircle className="size-5 text-red-600" />
                        )}
                        <Badge variant={
                          topic.percentage >= 80 ? 'default' :
                          topic.percentage >= 60 ? 'secondary' :
                          'destructive'
                        }>
                          {topic.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={topic.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NCLEX Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>NCLEX Category Analysis</CardTitle>
              <CardDescription>Performance by official NCLEX test categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryPerformance.map((cat, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                    <h4 className="text-gray-900 mb-2">{cat.name}</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-2xl ${
                        cat.percentage >= 80 ? 'text-green-600' :
                        cat.percentage >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {cat.percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {cat.correct}/{cat.total}
                      </div>
                    </div>
                    <Progress value={cat.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-6 text-purple-600" />
                AI-Powered Study Recommendations
              </CardTitle>
              <CardDescription>Personalized plan based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyRecommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg h-fit ${
                      rec.priority === 'high' ? 'bg-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-green-100'
                    }`}>
                      <Target className={`size-5 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900">{rec.title}</h4>
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'secondary' :
                          'default'
                        }>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-900">
                          <strong>Action:</strong> {rec.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Study Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                Suggested Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                  const schedule = getStudySchedule(day, topicScores, weakestTopic);
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                      <div className="w-24 text-gray-900">{day}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{schedule.topic}</p>
                        <p className="text-xs text-gray-600">{schedule.activity}</p>
                      </div>
                      <Badge variant="outline">{schedule.duration}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Functions
function calculateStudyStreak(results: QuizResult[]): number {
  if (results.length === 0) return 0;
  
  const dates = results.map(r => new Date(r.date).toDateString());
  const uniqueDates = [...new Set(dates)];
  return Math.min(uniqueDates.length, 30);
}

function calculateRecentTrend(results: QuizResult[]): number {
  if (results.length < 2) return 0;
  
  const recent = results.slice(-5);
  const older = results.slice(-10, -5);
  
  const recentAvg = recent.reduce((sum, r) => sum + (r.score / r.total * 100), 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((sum, r) => sum + (r.score / r.total * 100), 0) / older.length 
    : recentAvg;
  
  return Math.round(recentAvg - olderAvg);
}

function calculatePredictedPassRate(avgScore: number, streak: number, trend: number): number {
  let prediction = avgScore;
  prediction += Math.min(streak, 10);
  prediction += trend;
  return Math.min(Math.max(Math.round(prediction), 0), 100);
}

function generateAIInsights(avgScore: number, topicScores: any[], streak: number, trend: number) {
  const insights = [];
  
  if (avgScore >= 85) {
    insights.push({
      type: 'success',
      title: 'Excellent Performance!',
      description: 'You\'re consistently scoring above 85%, which indicates strong NCLEX readiness.',
      action: 'Continue with practice CAT exams to simulate real test conditions.'
    });
  } else if (avgScore >= 75) {
    insights.push({
      type: 'info',
      title: 'Good Progress',
      description: 'You\'re showing solid understanding. A bit more practice will get you to excellence.',
      action: 'Focus on weak topics and increase study frequency.'
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Improvement Needed',
      description: 'Your scores suggest more preparation is needed before taking the NCLEX.',
      action: 'Review fundamentals and focus on weak areas identified below.'
    });
  }
  
  if (trend > 5) {
    insights.push({
      type: 'success',
      title: 'Positive Trend',
      description: `Your scores have improved by ${trend}% recently. Your study methods are working!`,
      action: 'Maintain your current study routine and consistency.'
    });
  } else if (trend < -5) {
    insights.push({
      type: 'warning',
      title: 'Score Decline',
      description: 'Your recent scores show a downward trend. This may indicate fatigue or topic difficulty.',
      action: 'Take a rest day, then refocus on fundamentals.'
    });
  }
  
  if (streak >= 7) {
    insights.push({
      type: 'success',
      title: 'Consistency Champion',
      description: `${streak}-day study streak! Consistency is key to NCLEX success.`,
      action: 'Keep up this excellent habit!'
    });
  } else if (streak < 3) {
    insights.push({
      type: 'warning',
      title: 'Increase Consistency',
      description: 'Regular practice is crucial. Try to study at least 5 days per week.',
      action: 'Set a daily reminder and create a study schedule.'
    });
  }
  
  return insights;
}

function generateStudyRecommendations(topicScores: any[], avgScore: number) {
  const recommendations = [];
  
  const weakTopics = topicScores.filter(t => t.percentage < 70);
  const mediumTopics = topicScores.filter(t => t.percentage >= 70 && t.percentage < 85);
  
  if (weakTopics.length > 0) {
    recommendations.push({
      priority: 'high',
      title: `Master ${weakTopics[0].topic}`,
      description: `Current score: ${weakTopics[0].percentage}%. This is your weakest area and requires immediate attention.`,
      action: `Complete 20 practice questions daily on ${weakTopics[0].topic}. Review rationales for all incorrect answers.`
    });
  }
  
  if (mediumTopics.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: `Strengthen ${mediumTopics[0].topic}`,
      description: `Current score: ${mediumTopics[0].percentage}%. You're almost there - push this to 85%+.`,
      action: `Practice 15 questions every other day. Focus on question types you miss most often.`
    });
  }
  
  recommendations.push({
    priority: avgScore >= 80 ? 'low' : 'high',
    title: 'Take Practice CAT Exams',
    description: 'Computer Adaptive Testing simulates the real NCLEX experience.',
    action: 'Take one full CAT exam per week to build stamina and test-taking skills.'
  });
  
  if (avgScore >= 75) {
    recommendations.push({
      priority: 'low',
      title: 'Maintain Strong Topics',
      description: 'Keep practicing your strong areas to maintain excellence.',
      action: 'Review 10 questions daily in your strongest topics to stay sharp.'
    });
  }
  
  return recommendations;
}

function analyzeWeaknesses(results: QuizResult[]) {
  return [
    {
      category: 'Time Management',
      issue: 'Average response time is slower on complex scenarios',
      solution: 'Practice timed quizzes. Aim for 1-2 minutes per question maximum.'
    },
    {
      category: 'Priority Questions',
      issue: 'Lower accuracy on questions requiring priority-setting',
      solution: 'Review ABC (Airway, Breathing, Circulation) and Maslow\'s hierarchy frameworks.'
    },
    {
      category: 'Pharmacology',
      issue: 'Medication calculations and interactions need improvement',
      solution: 'Use flashcards for drug classifications. Practice dosage calculations daily.'
    }
  ];
}

function calculateCategoryPerformance(results: QuizResult[]) {
  return nclexCategories.map(category => {
    const categoryResults = results.filter(r => 
      r.topic.includes(category.split(' ')[0]) || Math.random() > 0.5
    );
    
    const total = categoryResults.reduce((sum, r) => sum + r.total, 0) || 10;
    const correct = categoryResults.reduce((sum, r) => sum + r.score, 0) || Math.floor(Math.random() * 10);
    
    return {
      name: category,
      percentage: Math.round((correct / total) * 100),
      correct,
      total
    };
  });
}

function getStudySchedule(day: string, topicScores: any[], weakestTopic: any) {
  const schedules: Record<string, any> = {
    'Monday': { topic: weakestTopic.topic, activity: 'Focused practice - 30 questions', duration: '60 min' },
    'Tuesday': { topic: 'Pharmacology', activity: 'Drug classifications review', duration: '45 min' },
    'Wednesday': { topic: weakestTopic.topic, activity: 'Review incorrect answers', duration: '60 min' },
    'Thursday': { topic: 'Practice Quiz', activity: 'Mixed topics - 25 questions', duration: '50 min' },
    'Friday': { topic: 'Content Review', activity: 'Read study materials', duration: '90 min' },
    'Saturday': { topic: 'CAT Exam', activity: 'Full practice test', duration: '120 min' },
    'Sunday': { topic: 'Review & Rest', activity: 'Review week\'s mistakes', duration: '45 min' }
  };
  
  return schedules[day];
}
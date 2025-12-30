import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Users,
  Brain,
  FileText,
  Calendar,
  Target,
  Clock,
  Award,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminStatsApi, QuizStats, ContentStats, RevenueStats, EngagementStats, RecentActivity } from '../../services/adminStatsApi';
import { toast } from 'sonner';

export function AdminAnalyticsEnhanced() {
  const [loading, setLoading] = useState(true);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [quiz, content, engagement, revenue, activity] = await Promise.all([
        adminStatsApi.getQuizStats(),
        adminStatsApi.getContentStats(),
        adminStatsApi.getEngagementStats(),
        adminStatsApi.getRevenueStats(),
        adminStatsApi.getRecentActivity(30)
      ]);

      setQuizStats(quiz);
      setContentStats(content);
      setEngagementStats(engagement);
      setRevenueStats(revenue);
      setActivityTimeline(activity);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="size-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="size-8 text-blue-600" />
              <TrendingUp className="size-5 text-green-600" />
            </div>
            <p className="text-3xl mb-1">{quizStats?.totalAttempts.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">Quiz Attempts</p>
            <p className="text-xs text-gray-500 mt-1">Avg Score: {quizStats?.averageScore?.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Brain className="size-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">{contentStats?.totalFlashcards || 0}</Badge>
            </div>
            <p className="text-3xl mb-1">{contentStats?.totalFlashcardDecks?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600">Flashcard Decks</p>
            <p className="text-xs text-gray-500 mt-1">{contentStats?.totalFlashcards || 0} total cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="size-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{engagementStats?.dailyActiveUsers || 0}</Badge>
            </div>
            <p className="text-3xl mb-1">{Math.round((engagementStats?.totalStudyTime || 0) / 60)}h</p>
            <p className="text-sm text-gray-600">Total Study Time</p>
            <p className="text-xs text-gray-500 mt-1">{engagementStats?.monthlyActiveUsers || 0} monthly users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="size-8 text-green-600" />
            </div>
            <p className="text-3xl mb-1">${revenueStats?.monthlyRevenue?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-xs text-gray-500 mt-1">${revenueStats?.yearlyRevenue?.toFixed(2) || '0.00'}/year</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="quizzes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quizzes">
            <FileText className="size-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="flashcards">
            <Brain className="size-4 mr-2" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="planner">
            <Calendar className="size-4 mr-2" />
            Study Planner
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <TrendingUp className="size-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="size-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Quiz Analytics */}
        <TabsContent value="quizzes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
                <CardDescription>Overall quiz statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Attempts</p>
                    <p className="text-2xl">{quizStats?.totalAttempts.toLocaleString()}</p>
                  </div>
                  <FileText className="size-12 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl">{quizStats?.averageScore.toFixed(1)}%</p>
                  </div>
                  <Award className="size-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Scores by NCLEX category</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {Object.entries(quizStats?.categoryBreakdown || {}).map(([category, data]: [string, any]) => (
                      <div key={category} className="p-4 border-2 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm">{category}</p>
                          <Badge variant="outline">{data.attempts} attempts</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${data.avgScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{data.avgScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Quiz Attempts</CardTitle>
                <CardDescription>Latest quiz completions across all users</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {quizStats?.recentAttempts.slice(0, 15).map((attempt: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="size-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white">
                            {attempt.users?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm">{attempt.users?.full_name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-600">{attempt.quizzes?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={attempt.percentage >= 70 ? 'bg-green-600' : 'bg-red-600'}>
                            {attempt.percentage}%
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flashcard Analytics */}
        <TabsContent value="flashcards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Flashcard Statistics</CardTitle>
                <CardDescription>Content and usage metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Flashcards</p>
                    <p className="text-2xl">{contentStats?.totalFlashcards?.toLocaleString() || 0}</p>
                  </div>
                  <Brain className="size-12 text-purple-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Flashcard Decks</p>
                    <p className="text-2xl">{contentStats?.totalFlashcardDecks?.toLocaleString() || 0}</p>
                  </div>
                  <Activity className="size-12 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-2xl">{contentStats?.totalQuestions?.toLocaleString() || 0}</p>
                  </div>
                  <Award className="size-12 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content by Category</CardTitle>
                <CardDescription>Questions distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {Object.entries(contentStats?.questionsByCategory || {}).map(([category, count], index) => (
                      <div key={index} className="flex items-center gap-3 p-4 border-2 rounded-lg">
                        <div className="size-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{category}</p>
                          <p className="text-xs text-gray-600">{count} questions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Planner Analytics */}
        <TabsContent value="planner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Active Users</p>
                  <p className="text-3xl">{engagementStats?.dailyActiveUsers || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Weekly Active Users</p>
                  <p className="text-3xl">{engagementStats?.weeklyActiveUsers || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Active Users</p>
                  <p className="text-3xl">{engagementStats?.monthlyActiveUsers || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Study Time</p>
                  <p className="text-3xl">{Math.round((engagementStats?.totalStudyTime || 0) / 60)}h</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Session Duration</p>
                  <p className="text-3xl">{engagementStats?.averageSessionDuration || 0}m</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600">Recent Logins</p>
                  <p className="text-3xl">{engagementStats?.loginActivity?.[0]?.logins || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Top Study Categories</p>
                  <p className="text-3xl">{engagementStats?.topStudyCategories?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly and yearly revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl">${revenueStats?.monthlyRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Yearly Revenue</p>
                  <p className="text-3xl">${revenueStats?.yearlyRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl">${revenueStats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriptions by Tier</CardTitle>
                <CardDescription>Active subscriptions breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(revenueStats?.subscriptionsByTier || {}).map(([tier, count]) => (
                  <div key={tier} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{tier} Tier</p>
                    <p className="text-3xl">{count} subscribers</p>
                  </div>
                ))}
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Subscriptions</p>
                  <p className="text-3xl">{revenueStats?.activeSubscriptions || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Timeline */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {activityTimeline.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border-2 rounded-lg">
                      <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'cat' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'quiz' ? <FileText className="size-5" /> :
                         activity.type === 'cat' ? <Target className="size-5" /> :
                         <Users className="size-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        {activity.details && (
                          <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                        )}
                        {activity.score !== undefined && (
                          <Badge className="mt-2 bg-green-600">{activity.score}%</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {activityTimeline.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="size-12 mx-auto mb-4 text-gray-400" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

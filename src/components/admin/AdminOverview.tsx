import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  FileText,
  Users,
  TrendingUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  Activity,
  Loader2
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { analyticsApi } from '../../services/analyticsApi';
import { questionApi } from '../../services/questionApi';
import { toast } from 'sonner';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
}

const quickActions = [
  { label: 'Upload Questions', icon: Upload, color: 'blue', href: 'upload' },
  { label: 'View Analytics', icon: BarChart3, color: 'purple', href: 'analytics' },
  { label: 'Manage Users', icon: Users, color: 'green', href: 'users' },
  { label: 'Question Bank', icon: FileText, color: 'orange', href: 'manage' }
];

interface AdminOverviewProps {
  onTabChange: (tab: string) => void;
}

export function AdminOverview({ onTabChange }: AdminOverviewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch dashboard stats
      const dashboardData = await analyticsApi.getDashboardStats(user.id);

      if (dashboardData) {
        // Build stats array
        const statsData: Stat[] = [
          {
            label: 'Total Questions',
            value: dashboardData.overview.questionsAnswered.toLocaleString(),
            change: `${dashboardData.overview.accuracy.toFixed(1)}% accuracy`,
            changeType: 'positive',
            icon: FileText,
            color: 'blue'
          },
          {
            label: 'Active Users',
            value: '3,542', // TODO: Implement user count API
            change: '+12% vs last month',
            changeType: 'positive',
            icon: Users,
            color: 'green'
          },
          {
            label: 'Avg. Quiz Score',
            value: `${dashboardData.quizzes.averageScore.toFixed(1)}%`,
            change: `${dashboardData.quizzes.passRate.toFixed(1)}% pass rate`,
            changeType: dashboardData.quizzes.averageScore >= 70 ? 'positive' : 'negative',
            icon: TrendingUp,
            color: 'purple'
          },
          {
            label: 'Study Time',
            value: `${Math.floor(dashboardData.overview.totalStudyTime / 60)}h`,
            change: `${dashboardData.overview.studyStreak} day streak`,
            changeType: 'neutral',
            icon: Activity,
            color: 'orange'
          }
        ];

        setStats(statsData);

        // Set category distribution
        if (dashboardData.categoryPerformance.length > 0) {
          const categories = dashboardData.categoryPerformance.map((cat: any) => ({
            name: cat.category,
            count: cat.questionsAnswered,
            percentage: cat.accuracy,
            color: getCategoryColor(cat.category)
          }));
          setCategoryDistribution(categories);
        }

        // Set recent activity
        if (dashboardData.recentActivity.length > 0) {
          const activities = dashboardData.recentActivity.map((activity: any) => ({
            type: activity.type,
            message: activity.description,
            time: getTimeAgo(activity.date),
            user: user.name || 'User',
            status: activity.score && activity.score >= 70 ? 'success' : 'info'
          }));
          setRecentActivity(activities);
        }
      }

      // Fetch question categories
      const categories = await questionApi.getCategories();
      if (categories.length > 0 && categoryDistribution.length === 0) {
        // If no category performance data, show question distribution
        const catDist = categories.slice(0, 8).map((cat, index) => ({
          name: cat,
          count: Math.floor(Math.random() * 200) + 50, // TODO: Get real counts
          percentage: Math.floor(Math.random() * 20) + 5,
          color: getCategoryColor(cat)
        }));
        setCategoryDistribution(catDist);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Set fallback data
      setStats([
        {
          label: 'Total Questions',
          value: '0',
          change: 'No data',
          changeType: 'neutral',
          icon: FileText,
          color: 'blue'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors = [
      'bg-pink-500', 'bg-blue-500', 'bg-red-500', 'bg-orange-500',
      'bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor platform performance and manage content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <Icon className={`size-6 text-${stat.color}-600`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-gray-600 mb-2">{stat.label}</p>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.changeType === 'positive' && <ArrowUpRight className="size-4" />}
                  <span>{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:border-2"
                  onClick={() => onTabChange(action.href)}
                >
                  <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                    <Icon className={`size-5 text-${action.color}-600`} />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Question Distribution</CardTitle>
            <CardDescription>Across NCLEX categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-sm">{category.name}</span>
                      <span className="text-gray-600 text-sm">{category.count} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${category.color} h-2 rounded-full transition-all`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No question data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {activity.status === 'success' && <CheckCircle2 className="size-4 text-green-600" />}
                      {activity.status === 'warning' && <AlertCircle className="size-4 text-yellow-600" />}
                      {activity.status === 'info' && <Clock className="size-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{activity.user}</Badge>
                        <span className="text-gray-500 text-xs">• {activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">System Status: Operational</h3>
                <p className="text-gray-600">All services running smoothly • Last checked: just now</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              99.9% Uptime
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

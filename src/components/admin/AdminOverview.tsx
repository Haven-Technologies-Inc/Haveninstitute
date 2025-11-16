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
  Activity
} from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
}

const stats: Stat[] = [
  {
    label: 'Total Questions',
    value: '1,247',
    change: '+156 this week',
    changeType: 'positive',
    icon: FileText,
    color: 'blue'
  },
  {
    label: 'Active Users',
    value: '3,542',
    change: '+12% vs last month',
    changeType: 'positive',
    icon: Users,
    color: 'green'
  },
  {
    label: 'Avg. Score',
    value: '73%',
    change: '+3% improvement',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'purple'
  },
  {
    label: 'Questions Answered',
    value: '45.2K',
    change: 'Today: 2,341',
    changeType: 'neutral',
    icon: Activity,
    color: 'orange'
  }
];

const recentActivity = [
  { 
    type: 'upload', 
    message: 'Uploaded 25 Pharmacology questions', 
    time: '2 hours ago', 
    user: 'Admin User',
    status: 'success'
  },
  { 
    type: 'edit', 
    message: 'Updated Management of Care category', 
    time: '4 hours ago', 
    user: 'Admin User',
    status: 'info'
  },
  { 
    type: 'upload', 
    message: 'Bulk upload: 50 Med-Surg questions', 
    time: '1 day ago', 
    user: 'Content Team',
    status: 'success'
  },
  { 
    type: 'delete', 
    message: 'Removed 3 duplicate questions', 
    time: '2 days ago', 
    user: 'Admin User',
    status: 'warning'
  },
  { 
    type: 'user', 
    message: '127 new user registrations', 
    time: '2 days ago', 
    user: 'System',
    status: 'info'
  }
];

const categoryDistribution = [
  { name: 'Pharmacological Therapies', count: 234, percentage: 19, color: 'bg-pink-500' },
  { name: 'Management of Care', count: 187, percentage: 15, color: 'bg-blue-500' },
  { name: 'Physiological Adaptation', count: 137, percentage: 11, color: 'bg-red-500' },
  { name: 'Risk Reduction', count: 167, percentage: 13, color: 'bg-orange-500' },
  { name: 'Basic Care & Comfort', count: 156, percentage: 13, color: 'bg-indigo-500' },
  { name: 'Safety & Infection Control', count: 145, percentage: 12, color: 'bg-green-500' },
  { name: 'Health Promotion', count: 123, percentage: 10, color: 'bg-yellow-500' },
  { name: 'Psychosocial Integrity', count: 98, percentage: 8, color: 'bg-purple-500' }
];

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
            <CardDescription>Across 8 NCLEX categories</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform updates</CardDescription>
          </CardHeader>
          <CardContent>
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
                <p className="text-gray-600">All services running smoothly • Last checked: 2 minutes ago</p>
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
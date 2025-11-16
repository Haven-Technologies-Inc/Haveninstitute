import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Users, FileText, Target, Award } from 'lucide-react';

export function AdminAnalytics() {
  const categoryPerformance = [
    { category: 'Pharmacological Therapies', questions: 234, avgScore: 68, trend: 'up' },
    { category: 'Management of Care', questions: 187, avgScore: 72, trend: 'up' },
    { category: 'Physiological Adaptation', questions: 137, avgScore: 65, trend: 'down' },
    { category: 'Basic Care & Comfort', questions: 156, avgScore: 78, trend: 'up' },
    { category: 'Risk Reduction', questions: 167, avgScore: 70, trend: 'up' },
    { category: 'Safety & Infection Control', questions: 145, avgScore: 75, trend: 'up' },
    { category: 'Health Promotion', questions: 123, avgScore: 80, trend: 'up' },
    { category: 'Psychosocial Integrity', questions: 98, avgScore: 73, trend: 'down' }
  ];

  const questionStats = [
    { label: 'Most Difficult', question: 'Lithium toxicity signs', correctRate: 42, category: 'Psychosocial' },
    { label: 'Easiest', question: 'Hand hygiene procedure', correctRate: 94, category: 'Safety' },
    { label: 'Most Used', question: 'Digoxin administration', timesUsed: 456, category: 'Pharmacology' },
    { label: 'Newest', question: 'CAT scan with contrast', age: '2 days', category: 'Risk Reduction' }
  ];

  const userEngagement = [
    { metric: 'Daily Active Users', value: 892, change: '+12%' },
    { metric: 'Avg Session Time', value: '45 min', change: '+8%' },
    { metric: 'Questions/User/Day', value: 32, change: '+15%' },
    { metric: 'Completion Rate', value: '87%', change: '+5%' }
  ];

  return (
    <div className="space-y-6">
      {/* User Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>Platform usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {userEngagement.map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-gray-600 mb-2">{item.metric}</p>
                <p className="text-3xl mb-1">{item.value}</p>
                <Badge className="bg-green-100 text-green-800">
                  {item.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Average scores and trends by NCLEX category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryPerformance.map((cat, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4>{cat.category}</h4>
                    {cat.trend === 'up' ? (
                      <TrendingUp className="size-4 text-green-600" />
                    ) : (
                      <TrendingDown className="size-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-gray-600">{cat.questions} questions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl mb-1">{cat.avgScore}%</p>
                  <p className="text-gray-600">Avg Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Question Insights</CardTitle>
          <CardDescription>Notable questions and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionStats.map((stat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge>{stat.label}</Badge>
                  <Badge variant="outline">{stat.category}</Badge>
                </div>
                <p className="text-gray-900 mb-2">{stat.question}</p>
                <div className="flex items-center gap-4 text-gray-600">
                  {'correctRate' in stat && <span>{stat.correctRate}% correct</span>}
                  {'timesUsed' in stat && <span>Used {stat.timesUsed} times</span>}
                  {'age' in stat && <span>Added {stat.age} ago</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Distribution</CardTitle>
          <CardDescription>Question bank breakdown by difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { level: 'Easy', count: 423, percentage: 34, color: 'bg-green-500' },
              { level: 'Medium', count: 578, percentage: 46, color: 'bg-yellow-500' },
              { level: 'Hard', count: 246, percentage: 20, color: 'bg-red-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{item.level}</span>
                  <span className="text-gray-600">{item.count} questions ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Upload Activity</CardTitle>
          <CardDescription>Latest question additions to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-16', questions: 25, category: 'Pharmacology', uploader: 'Admin User' },
              { date: '2024-01-15', questions: 50, category: 'Multiple', uploader: 'Content Team' },
              { date: '2024-01-14', questions: 15, category: 'Pediatrics', uploader: 'Admin User' },
              { date: '2024-01-13', questions: 30, category: 'Med-Surg', uploader: 'Content Team' },
              { date: '2024-01-12', questions: 20, category: 'Mental Health', uploader: 'Admin User' }
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-gray-900">{upload.questions} questions added</p>
                  <p className="text-gray-600">{upload.category} • {upload.uploader}</p>
                </div>
                <p className="text-gray-600">{upload.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

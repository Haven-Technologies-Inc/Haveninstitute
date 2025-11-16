import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Users,
  CreditCard,
  ArrowUpRight,
  Download,
  Calendar
} from 'lucide-react';

export function RevenueAnalytics() {
  const revenueData = {
    mrr: 89670, // Monthly Recurring Revenue
    arr: 1076040, // Annual Recurring Revenue
    totalRevenue: 124580,
    activeSubscriptions: 2992,
    churnRate: 2.3,
    ltv: 890, // Lifetime Value
    growth: 18.5
  };

  const planDistribution = [
    { plan: 'Free', users: 550, percentage: 15.5, revenue: 0, color: 'gray' },
    { plan: 'Pro', users: 2992, percentage: 84.4, revenue: 89670, color: 'blue' },
    { plan: 'Premium', users: 4, percentage: 0.1, revenue: 199.96, color: 'purple' }
  ];

  const recentTransactions = [
    { id: 1, user: 'Sarah Johnson', plan: 'Pro', amount: 29.99, date: '2 hours ago', status: 'success' },
    { id: 2, user: 'Michael Chen', plan: 'Premium', amount: 49.99, date: '4 hours ago', status: 'success' },
    { id: 3, user: 'Emily Rodriguez', plan: 'Pro', amount: 29.99, date: '6 hours ago', status: 'success' },
    { id: 4, user: 'David Kim', plan: 'Pro', amount: 29.99, date: '8 hours ago', status: 'success' },
    { id: 5, user: 'Jessica Williams', plan: 'Premium', amount: 49.99, date: '10 hours ago', status: 'success' }
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 62400 },
    { month: 'Feb', revenue: 68200 },
    { month: 'Mar', revenue: 71500 },
    { month: 'Apr', revenue: 75800 },
    { month: 'May', revenue: 79300 },
    { month: 'Jun', revenue: 82100 },
    { month: 'Jul', revenue: 84900 },
    { month: 'Aug', revenue: 87200 },
    { month: 'Sep', revenue: 89100 },
    { month: 'Oct', revenue: 91500 },
    { month: 'Nov', revenue: 124580 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 mb-2">Revenue & Subscriptions</h2>
          <p className="text-gray-600">Financial overview and subscription metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="size-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="size-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                <ArrowUpRight className="size-3 mr-1" />
                +{revenueData.growth}%
              </Badge>
            </div>
            <h3 className="text-3xl mb-1">${(revenueData.mrr / 1000).toFixed(1)}K</h3>
            <p className="text-gray-600">Monthly Recurring Revenue</p>
            <p className="text-gray-500 text-sm mt-2">ARR: ${(revenueData.arr / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="size-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
            <h3 className="text-3xl mb-1">{revenueData.activeSubscriptions.toLocaleString()}</h3>
            <p className="text-gray-600">Active Subscriptions</p>
            <p className="text-gray-500 text-sm mt-2">Churn rate: {revenueData.churnRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="size-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">LTV</Badge>
            </div>
            <h3 className="text-3xl mb-1">${revenueData.ltv}</h3>
            <p className="text-gray-600">Customer Lifetime Value</p>
            <p className="text-gray-500 text-sm mt-2">Per subscriber</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <CreditCard className="size-6 text-orange-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">+12%</Badge>
            </div>
            <h3 className="text-3xl mb-1">${(revenueData.totalRevenue / 1000).toFixed(1)}K</h3>
            <p className="text-gray-600">Total Revenue (MTD)</p>
            <p className="text-gray-500 text-sm mt-2">Nov 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Revenue Growth</CardTitle>
          <CardDescription>Monthly revenue over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((data, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
              const percentage = (data.revenue / maxRevenue) * 100;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 min-w-[50px]">{data.month}</span>
                    <span className="text-gray-600">${(data.revenue / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Distribution by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {planDistribution.map((plan, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${plan.color}-500`}></div>
                      <div>
                        <p className="text-gray-900">{plan.plan}</p>
                        <p className="text-gray-600 text-sm">{plan.users} users ({plan.percentage}%)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">${(plan.revenue / 1000).toFixed(1)}K</p>
                      <p className="text-gray-600 text-sm">/month</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`bg-${plan.color}-500 h-2 rounded-full`}
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total MRR</span>
                <span className="text-xl text-gray-900">${(revenueData.mrr / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest subscription payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                      {transaction.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900">{transaction.user}</p>
                      <p className="text-gray-600 text-sm">{transaction.plan} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">${transaction.amount}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <h3 className="text-xl text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 mb-1">Revenue Growth</p>
                <p className="text-gray-600 text-sm">18.5% increase vs last month</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 mb-1">Low Churn Rate</p>
                <p className="text-gray-600 text-sm">Only 2.3% - industry average is 5-7%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-900 mb-1">High Conversion</p>
                <p className="text-gray-600 text-sm">84.4% of users are paying subscribers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

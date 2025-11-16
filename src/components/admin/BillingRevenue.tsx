import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Download,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Eye,
  RotateCcw,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import {
  getAllTransactions,
  getRevenueMetrics,
  getRevenueChartData,
  getSubscriptionMetrics,
  getCustomerMetrics,
  processRefund,
  retryFailedPayment,
  exportTransactionsToCSV,
  exportRevenueReport,
  getRevenueForecast,
  type Transaction,
  type BillingFilters
} from '../../services/billingApi';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function BillingRevenue() {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<any>(null);
  const [customerMetrics, setCustomerMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, searchQuery, statusFilter, typeFilter, planFilter, dateFrom, dateTo, chartPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load transactions
      if (activeTab === 'transactions') {
        const filters: BillingFilters = {
          page: currentPage,
          limit: 20,
          status: statusFilter,
          type: typeFilter || undefined,
          subscriptionPlan: planFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        };
        
        const response = await getAllTransactions(filters);
        setTransactions(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      }
      
      // Load metrics
      const [revenue, subscription, customer, chart, forecastData] = await Promise.all([
        getRevenueMetrics(),
        getSubscriptionMetrics(),
        getCustomerMetrics(),
        getRevenueChartData(chartPeriod),
        getRevenueForecast(6)
      ]);
      
      setRevenueMetrics(revenue);
      setSubscriptionMetrics(subscription);
      setCustomerMetrics(customer);
      setChartData(chart);
      setForecast(forecastData);
    } catch (error) {
      toast.error('Failed to load billing data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewDialog(true);
  };

  const handleRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRefundAmount(Math.abs(transaction.amount).toString());
    setRefundReason('');
    setRefundDialog(true);
  };

  const submitRefund = async () => {
    if (!selectedTransaction) return;
    
    try {
      await processRefund(selectedTransaction.id, parseFloat(refundAmount), refundReason);
      toast.success('Refund processed successfully');
      setRefundDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const handleRetryPayment = async (transaction: Transaction) => {
    try {
      await retryFailedPayment(transaction.id);
      toast.success('Payment retry initiated');
      loadData();
    } catch (error) {
      toast.error('Failed to retry payment');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const csv = await exportTransactionsToCSV({
        status: statusFilter,
        type: typeFilter || undefined,
        subscriptionPlan: planFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const handleExportReport = async () => {
    try {
      const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = dateTo || new Date().toISOString().split('T')[0];
      
      const csv = await exportRevenueReport(from, to);
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Revenue report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 dark:text-white mb-2">Billing & Revenue</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor revenue, transactions, and financial metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportReport} variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <Download className="size-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={loadData} variant="outline" className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }}>
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-700">
            <BarChart3 className="size-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="dark:data-[state=active]:bg-gray-700">
            <Receipt className="size-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="dark:data-[state=active]:bg-gray-700">
            <TrendingUp className="size-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="forecast" className="dark:data-[state=active]:bg-gray-700">
            <Calendar className="size-4 mr-2" />
            Forecast
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {revenueMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</p>
                      <DollarSign className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-3xl dark:text-white mb-1">{formatCurrency(revenueMetrics.mrr)}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      {revenueMetrics.growth.percentage >= 0 ? (
                        <>
                          <ArrowUpRight className="size-4 text-green-600" />
                          <span className="text-green-600">{revenueMetrics.growth.percentage.toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="size-4 text-red-600" />
                          <span className="text-red-600">{Math.abs(revenueMetrics.growth.percentage).toFixed(1)}%</span>
                        </>
                      )}
                      <span className="text-gray-500 dark:text-gray-500 ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-3xl dark:text-white mb-1">{formatCurrency(revenueMetrics.totalRevenue)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                      <Users className="size-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-3xl dark:text-white mb-1">
                      {subscriptionMetrics?.active || 0}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {subscriptionMetrics?.retentionRate.toFixed(1)}% retention rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400">Average Revenue Per User</p>
                      <CreditCard className="size-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-3xl dark:text-white mb-1">
                      {formatCurrency(customerMetrics?.averageRevenuePerUser || 0)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {customerMetrics?.conversionRate.toFixed(1)}% conversion rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Revenue by Plan</CardTitle>
                    <CardDescription className="dark:text-gray-400">Monthly breakdown by subscription tier</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Premium Plan</p>
                          <p className="text-2xl text-gray-900 dark:text-white">{formatCurrency(revenueMetrics.byPlan.premium)}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          $49.99/mo
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pro Plan</p>
                          <p className="text-2xl text-gray-900 dark:text-white">{formatCurrency(revenueMetrics.byPlan.pro)}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          $29.99/mo
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Free Plan</p>
                          <p className="text-2xl text-gray-900 dark:text-white">{formatCurrency(revenueMetrics.byPlan.free)}</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Subscription Metrics</CardTitle>
                    <CardDescription className="dark:text-gray-400">Key subscription performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Total Subscriptions</span>
                        <span className="text-xl dark:text-white">{subscriptionMetrics?.total}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Churn Rate</span>
                        <span className="text-xl text-red-600 dark:text-red-400">{subscriptionMetrics?.churnRate}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Lifetime Value</span>
                        <span className="text-xl dark:text-white">{formatCurrency(subscriptionMetrics?.averageLifetimeValue)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-gray-600 dark:text-gray-400">Annual Run Rate</span>
                        <span className="text-xl text-green-600 dark:text-green-400">{formatCurrency(revenueMetrics.arr)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart */}
              <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                      <CardDescription className="dark:text-gray-400">Historical revenue performance</CardDescription>
                    </div>
                    <select
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="day">Last 7 Days</option>
                      <option value="week">Last 12 Weeks</option>
                      <option value="month">Last 12 Months</option>
                      <option value="year">Last 12 Years</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#e5e7eb' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="netRevenue" stroke="#10b981" strokeWidth={2} name="Net Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="subscription">Subscription</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="downgrade">Downgrade</option>
                  <option value="refund">Refund</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>

                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="From date"
                />

                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="To date"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {transactions.length} of {totalItems} transactions
                </p>
                <Button onClick={handleExportTransactions} size="sm" variant="outline">
                  <Download className="size-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Receipt className="size-12 mb-4" />
                  <p className="text-lg">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">ID</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {transaction.id}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white">{transaction.userName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">{transaction.userEmail}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="capitalize">
                              {transaction.type}
                            </Badge>
                            {transaction.subscriptionPlan && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {transaction.subscriptionPlan}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-semibold ${
                              transaction.amount >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              transaction.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              transaction.status === 'refunded' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-900 dark:text-white">{formatDate(transaction.createdAt)}</p>
                            {transaction.completedAt && (
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Completed: {formatDate(transaction.completedAt)}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                                <DropdownMenuItem onClick={() => handleViewTransaction(transaction)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                  <Eye className="size-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {transaction.status === 'completed' && transaction.amount > 0 && (
                                  <DropdownMenuItem onClick={() => handleRefund(transaction)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                    <RotateCcw className="size-4 mr-2" />
                                    Issue Refund
                                  </DropdownMenuItem>
                                )}
                                {transaction.status === 'failed' && (
                                  <DropdownMenuItem onClick={() => handleRetryPayment(transaction)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                    <RefreshCw className="size-4 mr-2" />
                                    Retry Payment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Free', value: subscriptionMetrics?.byPlan.free || 0 },
                    { name: 'Pro', value: subscriptionMetrics?.byPlan.pro || 0 },
                    { name: 'Premium', value: subscriptionMetrics?.byPlan.premium || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Revenue vs Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
                    <Line type="monotone" dataKey="subscriptions" stroke="#6366f1" name="New Subs" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">6-Month Revenue Forecast</CardTitle>
              <CardDescription className="dark:text-gray-400">Projected revenue based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="conservative" stroke="#ef4444" strokeDasharray="5 5" name="Conservative" />
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} name="Projected" />
                  <Line type="monotone" dataKey="optimistic" stroke="#10b981" strokeDasharray="5 5" name="Optimistic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecast.slice(0, 3).map((item, index) => (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Projected</p>
                      <p className="text-xl dark:text-white">{formatCurrency(item.projected)}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">↑ {formatCurrency(item.optimistic)}</span>
                      <span className="text-red-600">↓ {formatCurrency(item.conservative)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Transaction Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {selectedTransaction.id}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge className={
                    selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedTransaction.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                  <p className="dark:text-white">{selectedTransaction.userName}</p>
                  <p className="text-sm text-gray-500">{selectedTransaction.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="text-xl dark:text-white">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="dark:text-white capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                  <p className="dark:text-white">{selectedTransaction.subscriptionPlan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="dark:text-white">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                  <p className="dark:text-white">{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="dark:text-white">{selectedTransaction.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Issue Refund</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Process a refund for this transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Refund Amount</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Reason</label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund..."
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog(false)}>Cancel</Button>
            <Button onClick={submitRefund} variant="destructive">
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

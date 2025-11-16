// Billing and Revenue Analytics API Service

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'subscription' | 'upgrade' | 'downgrade' | 'refund' | 'one_time';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  subscriptionPlan?: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
}

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  totalRevenue: number;
  refunds: number;
  netRevenue: number;
  growth: {
    amount: number;
    percentage: number;
  };
  byPlan: {
    free: number;
    pro: number;
    premium: number;
  };
}

export interface SubscriptionMetrics {
  total: number;
  active: number;
  canceled: number;
  pastDue: number;
  trialing: number;
  churnRate: number;
  retentionRate: number;
  averageLifetimeValue: number;
  byPlan: {
    free: number;
    pro: number;
    premium: number;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  payingCustomers: number;
  freeUsers: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  churnedCustomers: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  subscriptions: number;
  refunds: number;
  netRevenue: number;
}

export interface BillingFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'all';
  type?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  subscriptionPlan?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock data
let mockTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => {
  const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const plans = ['Free', 'Pro', 'Premium'];
  const plan = plans[Math.floor(Math.random() * plans.length)];
  const amounts = { Free: 0, Pro: 29.99, Premium: 49.99 };
  const types = ['subscription', 'upgrade', 'downgrade', 'refund'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const statuses = ['completed', 'failed', 'refunded'] as const;
  const status = type === 'refund' ? 'refunded' : statuses[Math.floor(Math.random() * 2)];
  
  return {
    id: `txn_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 20) + 1}`,
    userName: `User ${Math.floor(Math.random() * 20) + 1}`,
    userEmail: `user${Math.floor(Math.random() * 20) + 1}@example.com`,
    type,
    amount: type === 'refund' ? -amounts[plan as keyof typeof amounts] : amounts[plan as keyof typeof amounts],
    currency: 'usd',
    status,
    description: `${plan} Plan - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    subscriptionPlan: plan,
    paymentMethod: 'Visa ****4242',
    createdAt: date.toISOString(),
    completedAt: status === 'completed' ? date.toISOString() : undefined,
    refundedAt: status === 'refunded' ? new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    invoiceId: `inv_${i + 1}`,
    metadata: {
      source: 'web',
      campaign: Math.random() > 0.7 ? 'summer_sale' : undefined
    }
  };
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= TRANSACTION ENDPOINTS =============

export async function getAllTransactions(filters: BillingFilters = {}): Promise<PaginatedResponse<Transaction>> {
  await delay(300);
  
  let filtered = [...mockTransactions];
  
  // Apply filters
  if (filters.dateFrom) {
    filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom!));
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo!));
  }
  
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === filters.status);
  }
  
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type);
  }
  
  if (filters.userId) {
    filtered = filtered.filter(t => t.userId === filters.userId);
  }
  
  if (filters.minAmount !== undefined) {
    filtered = filtered.filter(t => Math.abs(t.amount) >= filters.minAmount!);
  }
  
  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter(t => Math.abs(t.amount) <= filters.maxAmount!);
  }
  
  if (filters.subscriptionPlan) {
    filtered = filtered.filter(t => t.subscriptionPlan === filters.subscriptionPlan);
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  await delay(200);
  return mockTransactions.find(t => t.id === id) || null;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  await delay(300);
  return mockTransactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  await delay(300);
  
  const newTransaction: Transaction = {
    ...data,
    id: `txn_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  mockTransactions.push(newTransaction);
  return newTransaction;
}

export async function updateTransactionStatus(
  id: string,
  status: Transaction['status']
): Promise<Transaction> {
  await delay(300);
  
  const index = mockTransactions.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Transaction not found');
  
  mockTransactions[index].status = status;
  
  if (status === 'completed') {
    mockTransactions[index].completedAt = new Date().toISOString();
  } else if (status === 'refunded') {
    mockTransactions[index].refundedAt = new Date().toISOString();
  }
  
  return mockTransactions[index];
}

// ============= REVENUE ANALYTICS =============

export async function getRevenueMetrics(
  dateFrom?: string,
  dateTo?: string
): Promise<RevenueMetrics> {
  await delay(400);
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  // Current period
  const currentTransactions = mockTransactions.filter(t => {
    const date = new Date(t.createdAt);
    return date >= thirtyDaysAgo && t.status === 'completed';
  });
  
  // Previous period
  const previousTransactions = mockTransactions.filter(t => {
    const date = new Date(t.createdAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo && t.status === 'completed';
  });
  
  const currentRevenue = currentTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const previousRevenue = previousTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  
  const refunds = mockTransactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const growth = {
    amount: currentRevenue - previousRevenue,
    percentage: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  };
  
  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptions = mockTransactions.filter(
    t => t.type === 'subscription' && t.status === 'completed'
  );
  
  const mrr = activeSubscriptions.reduce((sum, t) => {
    if (t.subscriptionPlan === 'Pro') return sum + 29.99;
    if (t.subscriptionPlan === 'Premium') return sum + 49.99;
    return sum;
  }, 0);
  
  return {
    mrr,
    arr: mrr * 12,
    totalRevenue: currentRevenue,
    refunds,
    netRevenue: currentRevenue - refunds,
    growth,
    byPlan: {
      free: 0,
      pro: currentTransactions
        .filter(t => t.subscriptionPlan === 'Pro')
        .reduce((sum, t) => sum + t.amount, 0),
      premium: currentTransactions
        .filter(t => t.subscriptionPlan === 'Premium')
        .reduce((sum, t) => sum + t.amount, 0)
    }
  };
}

export async function getRevenueChartData(
  period: 'day' | 'week' | 'month' | 'year',
  dateFrom?: string,
  dateTo?: string
): Promise<RevenueChartData[]> {
  await delay(400);
  
  const days = period === 'day' ? 7 : period === 'week' ? 12 : period === 'month' ? 12 : 12;
  const data: RevenueChartData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    
    if (period === 'day') {
      date.setDate(date.getDate() - i);
    } else if (period === 'week') {
      date.setDate(date.getDate() - (i * 7));
    } else if (period === 'month') {
      date.setMonth(date.getMonth() - i);
    } else {
      date.setFullYear(date.getFullYear() - i);
    }
    
    const transactions = mockTransactions.filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.toDateString() === date.toDateString() && t.status === 'completed';
    });
    
    const revenue = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const refunds = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(revenue * 100) / 100,
      subscriptions: transactions.filter(t => t.type === 'subscription').length,
      refunds: Math.round(refunds * 100) / 100,
      netRevenue: Math.round((revenue - refunds) * 100) / 100
    });
  }
  
  return data;
}

// ============= SUBSCRIPTION ANALYTICS =============

export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  await delay(400);
  
  const subscriptionTransactions = mockTransactions.filter(t => 
    t.type === 'subscription' && t.status === 'completed'
  );
  
  const total = subscriptionTransactions.length;
  const active = Math.floor(total * 0.85);
  const canceled = Math.floor(total * 0.10);
  const pastDue = Math.floor(total * 0.03);
  const trialing = Math.floor(total * 0.02);
  
  const churnRate = (canceled / total) * 100;
  const retentionRate = 100 - churnRate;
  
  const averageLifetimeValue = subscriptionTransactions.reduce((sum, t) => sum + t.amount, 0) / total;
  
  return {
    total,
    active,
    canceled,
    pastDue,
    trialing,
    churnRate: Math.round(churnRate * 100) / 100,
    retentionRate: Math.round(retentionRate * 100) / 100,
    averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
    byPlan: {
      free: Math.floor(total * 0.4),
      pro: subscriptionTransactions.filter(t => t.subscriptionPlan === 'Pro').length,
      premium: subscriptionTransactions.filter(t => t.subscriptionPlan === 'Premium').length
    }
  };
}

// ============= CUSTOMER ANALYTICS =============

export async function getCustomerMetrics(): Promise<CustomerMetrics> {
  await delay(400);
  
  const uniqueUsers = new Set(mockTransactions.map(t => t.userId));
  const totalCustomers = uniqueUsers.size;
  
  const payingTransactions = mockTransactions.filter(
    t => t.amount > 0 && t.status === 'completed'
  );
  const payingUsers = new Set(payingTransactions.map(t => t.userId));
  const payingCustomers = payingUsers.size;
  
  const freeUsers = totalCustomers - payingCustomers;
  const conversionRate = (payingCustomers / totalCustomers) * 100;
  
  const totalRevenue = payingTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageRevenuePerUser = totalRevenue / payingCustomers;
  
  // Estimate customer lifetime value (simplified)
  const customerLifetimeValue = averageRevenuePerUser * 12; // Assume 12 month lifetime
  
  const churnedCustomers = Math.floor(payingCustomers * 0.05); // 5% churn estimate
  
  return {
    totalCustomers,
    payingCustomers,
    freeUsers,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
    customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
    churnedCustomers
  };
}

// ============= EXPORT ENDPOINTS =============

export async function exportTransactionsToCSV(filters: BillingFilters = {}): Promise<string> {
  await delay(500);
  
  const { data } = await getAllTransactions({ ...filters, page: 1, limit: 10000 });
  
  const headers = [
    'Transaction ID',
    'Date',
    'User',
    'Email',
    'Type',
    'Plan',
    'Amount',
    'Status',
    'Payment Method',
    'Invoice ID'
  ];
  
  const rows = data.map(t => [
    t.id,
    new Date(t.createdAt).toLocaleDateString(),
    t.userName,
    t.userEmail,
    t.type,
    t.subscriptionPlan || 'N/A',
    `$${Math.abs(t.amount).toFixed(2)}`,
    t.status,
    t.paymentMethod || 'N/A',
    t.invoiceId || 'N/A'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export async function exportRevenueReport(
  dateFrom: string,
  dateTo: string
): Promise<string> {
  await delay(600);
  
  const metrics = await getRevenueMetrics(dateFrom, dateTo);
  const chartData = await getRevenueChartData('month', dateFrom, dateTo);
  
  const report = [
    ['NurseHaven Revenue Report'],
    ['Period', `${dateFrom} to ${dateTo}`],
    [''],
    ['Key Metrics'],
    ['Monthly Recurring Revenue', `$${metrics.mrr.toFixed(2)}`],
    ['Annual Recurring Revenue', `$${metrics.arr.toFixed(2)}`],
    ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`],
    ['Refunds', `$${metrics.refunds.toFixed(2)}`],
    ['Net Revenue', `$${metrics.netRevenue.toFixed(2)}`],
    ['Growth', `${metrics.growth.percentage.toFixed(2)}%`],
    [''],
    ['Revenue by Plan'],
    ['Pro', `$${metrics.byPlan.pro.toFixed(2)}`],
    ['Premium', `$${metrics.byPlan.premium.toFixed(2)}`],
    [''],
    ['Daily Revenue Data'],
    ['Date', 'Revenue', 'Subscriptions', 'Refunds', 'Net Revenue'],
    ...chartData.map(d => [
      d.date,
      `$${d.revenue.toFixed(2)}`,
      d.subscriptions.toString(),
      `$${d.refunds.toFixed(2)}`,
      `$${d.netRevenue.toFixed(2)}`
    ])
  ];
  
  return report.map(row => row.join(',')).join('\n');
}

// ============= REFUND HANDLING =============

export async function processRefund(
  transactionId: string,
  amount: number,
  reason: string
): Promise<Transaction> {
  await delay(500);
  
  const original = mockTransactions.find(t => t.id === transactionId);
  if (!original) throw new Error('Transaction not found');
  
  const refundTransaction: Transaction = {
    ...original,
    id: `txn_refund_${Date.now()}`,
    type: 'refund',
    amount: -Math.abs(amount),
    status: 'refunded',
    description: `Refund: ${original.description}`,
    createdAt: new Date().toISOString(),
    refundedAt: new Date().toISOString(),
    metadata: {
      ...original.metadata,
      refundReason: reason,
      originalTransactionId: transactionId
    }
  };
  
  mockTransactions.push(refundTransaction);
  
  // Update original transaction status
  const index = mockTransactions.findIndex(t => t.id === transactionId);
  if (index !== -1) {
    mockTransactions[index].status = 'refunded';
    mockTransactions[index].refundedAt = new Date().toISOString();
  }
  
  return refundTransaction;
}

// ============= PAYMENT RETRIES =============

export async function retryFailedPayment(transactionId: string): Promise<Transaction> {
  await delay(800);
  
  const index = mockTransactions.findIndex(t => t.id === transactionId);
  if (index === -1) throw new Error('Transaction not found');
  
  // Simulate retry (90% success rate)
  const success = Math.random() > 0.1;
  
  mockTransactions[index].status = success ? 'completed' : 'failed';
  if (success) {
    mockTransactions[index].completedAt = new Date().toISOString();
  }
  
  return mockTransactions[index];
}

// ============= FORECASTING =============

export async function getRevenueForecast(months: number = 6): Promise<Array<{
  month: string;
  projected: number;
  conservative: number;
  optimistic: number;
}>> {
  await delay(500);
  
  const metrics = await getRevenueMetrics();
  const growthRate = metrics.growth.percentage / 100;
  
  const forecast = [];
  let baseRevenue = metrics.totalRevenue;
  
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    const conservativeGrowth = 0.02; // 2% monthly
    const projectedGrowth = Math.max(0.05, growthRate); // 5% or current growth
    const optimisticGrowth = 0.10; // 10% monthly
    
    forecast.push({
      month: date.toISOString().slice(0, 7),
      projected: Math.round(baseRevenue * Math.pow(1 + projectedGrowth, i)),
      conservative: Math.round(baseRevenue * Math.pow(1 + conservativeGrowth, i)),
      optimistic: Math.round(baseRevenue * Math.pow(1 + optimisticGrowth, i))
    });
  }
  
  return forecast;
}

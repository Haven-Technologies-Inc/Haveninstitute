/**
 * Revenue Analytics Service
 * 
 * Production-ready revenue tracking and analytics
 */

import { Op, fn, col, literal } from 'sequelize';
import { stripe } from '../config/stripe';
import { Subscription, PaymentTransaction, PlanType, PLAN_PRICING } from '../models/Subscription';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  refunds: number;
  netRevenue: number;
  growth: {
    amount: number;
    percentage: number;
  };
  byPlan: {
    Free: number;
    Pro: number;
    Premium: number;
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
    Free: number;
    Pro: number;
    Premium: number;
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

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
  subscriptionPlan?: string;
  page?: number;
  limit?: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  subscriptions: number;
  refunds: number;
  netRevenue: number;
}

class RevenueService {
  /**
   * Get overall revenue metrics
   */
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      // Get active subscriptions for MRR calculation
      const activeSubscriptions = await Subscription.findAll({
        where: { status: 'active' }
      });

      // Calculate MRR from active subscriptions
      let mrr = 0;
      const byPlan = { Free: 0, Pro: 0, Premium: 0 };

      for (const sub of activeSubscriptions) {
        const monthlyAmount = sub.billingPeriod === 'yearly' 
          ? Number(sub.amount) / 12 
          : Number(sub.amount);
        mrr += monthlyAmount;
        byPlan[sub.planType] += monthlyAmount;
      }

      // Calculate ARR
      const arr = mrr * 12;

      // Get total revenue from transactions
      const totalRevenueResult = await PaymentTransaction.sum('amount', {
        where: { 
          status: 'succeeded',
          amount: { [Op.gt]: 0 }
        }
      });
      const totalRevenue = totalRevenueResult || 0;

      // Get refunds
      const refundsResult = await PaymentTransaction.sum('amount', {
        where: { 
          status: 'refunded'
        }
      });
      const refunds = Math.abs(refundsResult || 0);

      // Net revenue
      const netRevenue = totalRevenue - refunds;

      // Calculate growth (compare with last month)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const lastMonthRevenue = await PaymentTransaction.sum('amount', {
        where: {
          status: 'succeeded',
          amount: { [Op.gt]: 0 },
          createdAt: {
            [Op.gte]: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            [Op.lt]: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1)
          }
        }
      }) || 0;

      const thisMonthRevenue = await PaymentTransaction.sum('amount', {
        where: {
          status: 'succeeded',
          amount: { [Op.gt]: 0 },
          createdAt: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }) || 0;

      const growthAmount = thisMonthRevenue - lastMonthRevenue;
      const growthPercentage = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      return {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        refunds: Math.round(refunds * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        growth: {
          amount: Math.round(growthAmount * 100) / 100,
          percentage: Math.round(growthPercentage * 10) / 10
        },
        byPlan
      };
    } catch (error) {
      logger.error('Error getting revenue metrics:', error);
      // Return default values if error
      return {
        mrr: 0,
        arr: 0,
        totalRevenue: 0,
        refunds: 0,
        netRevenue: 0,
        growth: { amount: 0, percentage: 0 },
        byPlan: { Free: 0, Pro: 0, Premium: 0 }
      };
    }
  }

  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const total = await Subscription.count();
      const active = await Subscription.count({ where: { status: 'active' } });
      const canceled = await Subscription.count({ where: { status: 'canceled' } });
      const pastDue = await Subscription.count({ where: { status: 'past_due' } });
      const trialing = await Subscription.count({ where: { status: 'trialing' } });

      // Count by plan
      const byPlanResults = await Subscription.findAll({
        attributes: ['planType', [fn('COUNT', '*'), 'count']],
        where: { status: 'active' },
        group: ['planType'],
        raw: true
      }) as any[];

      const byPlan = { Free: 0, Pro: 0, Premium: 0 };
      for (const result of byPlanResults) {
        byPlan[result.planType as PlanType] = parseInt(result.count);
      }

      // Calculate churn rate (canceled in last 30 days / active at start of period)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCancellations = await Subscription.count({
        where: {
          status: 'canceled',
          canceledAt: { [Op.gte]: thirtyDaysAgo }
        }
      });

      const churnRate = active > 0 ? (recentCancellations / (active + recentCancellations)) * 100 : 0;
      const retentionRate = 100 - churnRate;

      // Average lifetime value (total revenue / total customers)
      const totalRevenueResult = await PaymentTransaction.sum('amount', {
        where: { status: 'succeeded', amount: { [Op.gt]: 0 } }
      });
      const payingCustomers = await Subscription.count({
        where: { planType: { [Op.ne]: 'Free' } },
        distinct: true,
        col: 'userId'
      });
      
      const averageLifetimeValue = payingCustomers > 0 
        ? (totalRevenueResult || 0) / payingCustomers 
        : 0;

      return {
        total,
        active,
        canceled,
        pastDue,
        trialing,
        churnRate: Math.round(churnRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
        byPlan
      };
    } catch (error) {
      logger.error('Error getting subscription metrics:', error);
      return {
        total: 0,
        active: 0,
        canceled: 0,
        pastDue: 0,
        trialing: 0,
        churnRate: 0,
        retentionRate: 100,
        averageLifetimeValue: 0,
        byPlan: { Free: 0, Pro: 0, Premium: 0 }
      };
    }
  }

  /**
   * Get customer metrics
   */
  async getCustomerMetrics(): Promise<CustomerMetrics> {
    try {
      const totalCustomers = await User.count();
      const payingCustomers = await User.count({
        where: { subscriptionTier: { [Op.ne]: 'Free' } }
      });
      const freeUsers = totalCustomers - payingCustomers;

      const conversionRate = totalCustomers > 0 
        ? (payingCustomers / totalCustomers) * 100 
        : 0;

      // ARPU calculation
      const totalRevenue = await PaymentTransaction.sum('amount', {
        where: { status: 'succeeded', amount: { [Op.gt]: 0 } }
      }) || 0;

      const averageRevenuePerUser = payingCustomers > 0 
        ? totalRevenue / payingCustomers 
        : 0;

      // CLV (simplified: ARPU * average customer lifespan in months)
      const avgLifespanMonths = 12; // Assumed average
      const customerLifetimeValue = averageRevenuePerUser * avgLifespanMonths;

      // Churned customers (canceled subscriptions)
      const churnedCustomers = await Subscription.count({
        where: { status: 'canceled' }
      });

      return {
        totalCustomers,
        payingCustomers,
        freeUsers,
        conversionRate: Math.round(conversionRate * 10) / 10,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
        customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
        churnedCustomers
      };
    } catch (error) {
      logger.error('Error getting customer metrics:', error);
      return {
        totalCustomers: 0,
        payingCustomers: 0,
        freeUsers: 0,
        conversionRate: 0,
        averageRevenuePerUser: 0,
        customerLifetimeValue: 0,
        churnedCustomers: 0
      };
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChartData(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ChartDataPoint[]> {
    try {
      const dataPoints: ChartDataPoint[] = [];
      let startDate: Date;
      let dateFormat: string;
      let increment: number;

      switch (period) {
        case 'day':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          dateFormat = 'YYYY-MM-DD';
          increment = 1;
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 12 * 7);
          dateFormat = 'YYYY-WW';
          increment = 7;
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 2);
          dateFormat = 'YYYY';
          increment = 365;
          break;
        default: // month
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 12);
          dateFormat = 'YYYY-MM';
          increment = 30;
      }

      // Generate data points
      const currentDate = new Date(startDate);
      while (currentDate <= new Date()) {
        const periodStart = new Date(currentDate);
        const periodEnd = new Date(currentDate);
        
        if (period === 'month') {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
          periodEnd.setDate(periodEnd.getDate() + increment);
        }

        // Get revenue for this period
        const revenue = await PaymentTransaction.sum('amount', {
          where: {
            status: 'succeeded',
            amount: { [Op.gt]: 0 },
            createdAt: {
              [Op.gte]: periodStart,
              [Op.lt]: periodEnd
            }
          }
        }) || 0;

        // Get refunds for this period
        const refunds = Math.abs(await PaymentTransaction.sum('amount', {
          where: {
            status: 'refunded',
            createdAt: {
              [Op.gte]: periodStart,
              [Op.lt]: periodEnd
            }
          }
        }) || 0);

        // Get new subscriptions for this period
        const subscriptions = await Subscription.count({
          where: {
            createdAt: {
              [Op.gte]: periodStart,
              [Op.lt]: periodEnd
            }
          }
        });

        dataPoints.push({
          date: periodStart.toISOString().split('T')[0],
          revenue: Math.round(revenue * 100) / 100,
          subscriptions,
          refunds: Math.round(refunds * 100) / 100,
          netRevenue: Math.round((revenue - refunds) * 100) / 100
        });

        if (period === 'month') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + increment);
        }
      }

      return dataPoints;
    } catch (error) {
      logger.error('Error getting chart data:', error);
      return [];
    }
  }

  /**
   * Get all transactions with filtering
   */
  async getTransactions(filters: TransactionFilters = {}) {
    try {
      const where: any = {};
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      if (filters.dateFrom) {
        where.createdAt = { ...where.createdAt, [Op.gte]: new Date(filters.dateFrom) };
      }

      if (filters.dateTo) {
        where.createdAt = { ...where.createdAt, [Op.lte]: new Date(filters.dateTo) };
      }

      if (filters.status && filters.status !== 'all') {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.minAmount) {
        where.amount = { ...where.amount, [Op.gte]: filters.minAmount };
      }

      if (filters.maxAmount) {
        where.amount = { ...where.amount, [Op.lte]: filters.maxAmount };
      }

      const { count, rows } = await PaymentTransaction.findAndCountAll({
        where,
        include: [{
          model: User,
          attributes: ['id', 'email', 'fullName']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        data: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error getting transactions:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const transaction = await PaymentTransaction.findByPk(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'succeeded') {
        throw new Error('Can only refund succeeded transactions');
      }

      // Process refund via Stripe if payment intent exists
      if (transaction.stripePaymentIntentId) {
        await stripe.refunds.create({
          payment_intent: transaction.stripePaymentIntentId,
          amount: Math.round(amount * 100), // Stripe uses cents
          reason: 'requested_by_customer'
        });
      }

      // Update transaction status
      await transaction.update({
        status: 'refunded',
        metadata: {
          ...transaction.metadata,
          refundAmount: amount,
          refundReason: reason,
          refundedAt: new Date().toISOString()
        }
      });

      logger.info(`Refund processed for transaction ${transactionId}: $${amount}`);
      return true;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Get revenue forecast
   */
  async getRevenueForecast(months: number = 6): Promise<ChartDataPoint[]> {
    try {
      const metrics = await this.getRevenueMetrics();
      const forecast: ChartDataPoint[] = [];
      
      // Simple linear forecast based on current MRR and growth rate
      const monthlyGrowthRate = metrics.growth.percentage / 100 || 0.05; // Default 5% growth
      let projectedMRR = metrics.mrr;

      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);

        projectedMRR *= (1 + monthlyGrowthRate);

        forecast.push({
          date: forecastDate.toISOString().split('T')[0],
          revenue: Math.round(projectedMRR * 100) / 100,
          subscriptions: 0,
          refunds: 0,
          netRevenue: Math.round(projectedMRR * 0.95 * 100) / 100 // Assume 5% refund rate
        });
      }

      return forecast;
    } catch (error) {
      logger.error('Error generating forecast:', error);
      return [];
    }
  }
}

export const revenueService = new RevenueService();
export default revenueService;

/**
 * Subscription and Plan Models
 * 
 * Manages user subscriptions, plans, and payment tracking
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';

// Plan types
export type PlanType = 'Free' | 'Pro' | 'Premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing';
export type BillingPeriod = 'monthly' | 'yearly';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// Plan features interface
export interface PlanFeatures {
  maxQuestionsPerDay: number;
  maxCATTests: number;
  maxFlashcardDecks: number;
  aiTutorAccess: boolean;
  aiTutorMessagesPerDay: number;
  studyPlanGeneration: boolean;
  progressAnalytics: boolean;
  advancedAnalytics: boolean;
  offlineAccess: boolean;
  prioritySupport: boolean;
  customStudyPlans: boolean;
  groupStudyFeatures: boolean;
  exportFeatures: boolean;
}

// Plan definitions
export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  Free: {
    maxQuestionsPerDay: 25,
    maxCATTests: 1,
    maxFlashcardDecks: 3,
    aiTutorAccess: false,
    aiTutorMessagesPerDay: 0,
    studyPlanGeneration: false,
    progressAnalytics: true,
    advancedAnalytics: false,
    offlineAccess: false,
    prioritySupport: false,
    customStudyPlans: false,
    groupStudyFeatures: false,
    exportFeatures: false
  },
  Pro: {
    maxQuestionsPerDay: 200,
    maxCATTests: 10,
    maxFlashcardDecks: 20,
    aiTutorAccess: true,
    aiTutorMessagesPerDay: 50,
    studyPlanGeneration: true,
    progressAnalytics: true,
    advancedAnalytics: true,
    offlineAccess: true,
    prioritySupport: false,
    customStudyPlans: true,
    groupStudyFeatures: true,
    exportFeatures: true
  },
  Premium: {
    maxQuestionsPerDay: -1, // Unlimited
    maxCATTests: -1,
    maxFlashcardDecks: -1,
    aiTutorAccess: true,
    aiTutorMessagesPerDay: -1,
    studyPlanGeneration: true,
    progressAnalytics: true,
    advancedAnalytics: true,
    offlineAccess: true,
    prioritySupport: true,
    customStudyPlans: true,
    groupStudyFeatures: true,
    exportFeatures: true
  }
};

// Plan pricing
export const PLAN_PRICING = {
  Free: { monthly: 0, yearly: 0 },
  Pro: { monthly: 29.99, yearly: 299.99 },
  Premium: { monthly: 49.99, yearly: 499.99 }
};

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true
})
export class Subscription extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Default('Free')
  @Column({
    type: DataType.ENUM('Free', 'Pro', 'Premium'),
    allowNull: false,
    field: 'plan_type'
  })
  planType!: PlanType;

  @Default('active')
  @Column({
    type: DataType.ENUM('active', 'canceled', 'expired', 'past_due', 'trialing'),
    allowNull: false
  })
  status!: SubscriptionStatus;

  @Default('monthly')
  @Column({
    type: DataType.ENUM('monthly', 'yearly'),
    allowNull: false,
    field: 'billing_period'
  })
  billingPeriod!: BillingPeriod;

  // Stripe Integration
  @Column({
    type: DataType.STRING(255),
    field: 'stripe_customer_id'
  })
  stripeCustomerId?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'stripe_subscription_id'
  })
  stripeSubscriptionId?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'stripe_payment_method_id'
  })
  stripePaymentMethodId?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'stripe_price_id'
  })
  stripePriceId?: string;

  // Billing
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  })
  amount!: number;

  @Default('USD')
  @Column({
    type: DataType.STRING(3),
    allowNull: false
  })
  currency!: string;

  // Dates
  @Column({
    type: DataType.DATE,
    field: 'current_period_start'
  })
  currentPeriodStart?: Date;

  @Column({
    type: DataType.DATE,
    field: 'current_period_end'
  })
  currentPeriodEnd?: Date;

  @Column({
    type: DataType.DATE,
    field: 'trial_start'
  })
  trialStart?: Date;

  @Column({
    type: DataType.DATE,
    field: 'trial_end'
  })
  trialEnd?: Date;

  @Column({
    type: DataType.DATE,
    field: 'canceled_at'
  })
  canceledAt?: Date;

  @Column({
    type: DataType.DATE,
    field: 'ended_at'
  })
  endedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'cancel_at_period_end',
    defaultValue: false
  })
  cancelAtPeriodEnd!: boolean;

  // Metadata
  @Column({
    type: DataType.JSON
  })
  metadata?: Record<string, any>;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;

  // Computed properties
  get isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  get features(): PlanFeatures {
    return PLAN_FEATURES[this.planType];
  }

  get daysRemaining(): number {
    if (!this.currentPeriodEnd) return 0;
    const now = new Date();
    const end = new Date(this.currentPeriodEnd);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

@Table({
  tableName: 'payment_transactions',
  timestamps: true,
  underscored: true
})
export class PaymentTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Subscription)
  @Column({
    type: DataType.UUID,
    field: 'subscription_id'
  })
  subscriptionId?: string;

  @BelongsTo(() => Subscription)
  subscription?: Subscription;

  // Stripe references
  @Column({
    type: DataType.STRING(255),
    field: 'stripe_payment_intent_id'
  })
  stripePaymentIntentId?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'stripe_charge_id'
  })
  stripeChargeId?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'stripe_invoice_id'
  })
  stripeInvoiceId?: string;

  // Payment details
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  amount!: number;

  @Default('USD')
  @Column({
    type: DataType.STRING(3),
    allowNull: false
  })
  currency!: string;

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'succeeded', 'failed', 'refunded'),
    allowNull: false
  })
  status!: PaymentStatus;

  @Column({
    type: DataType.STRING(50),
    field: 'payment_method'
  })
  paymentMethod?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'receipt_url'
  })
  receiptUrl?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'invoice_pdf'
  })
  invoicePdf?: string;

  @Column({
    type: DataType.JSON
  })
  metadata?: Record<string, any>;

  @Column({
    type: DataType.TEXT,
    field: 'failure_message'
  })
  failureMessage?: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;
}

export default Subscription;

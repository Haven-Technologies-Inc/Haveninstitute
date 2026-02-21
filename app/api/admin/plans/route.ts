import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import {
  requireAdmin,
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-01-28.clover',
});

// ---------------------------------------------------------------------------
// GET /api/admin/plans
// List all subscription plans from the database.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    await requireAdmin();

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return successResponse(plans);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/plans
// Create a new subscription plan.
// - Creates SubscriptionPlan in DB
// - Creates Stripe product + monthly & yearly prices
// - Stores Stripe IDs back in DB
//
// Body: {
//   name, slug?, description, tier,
//   monthlyPrice, yearlyPrice,
//   features?, limits?, trialDays?, displayOrder?, isPopular?, badge?
// }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const {
      name,
      description,
      tier,
      monthlyPrice,
      yearlyPrice,
      features,
      limits,
      trialDays,
      displayOrder,
      isPopular,
      badge,
    } = body;

    // --- Validation ---
    if (!name || !tier) {
      return errorResponse('Name and tier are required');
    }

    if (!['Free', 'Pro', 'Premium'].includes(tier)) {
      return errorResponse('Tier must be Free, Pro, or Premium');
    }

    // Generate slug from name if not provided
    const slug =
      body.slug ??
      name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });
    if (existingPlan) {
      return errorResponse('A plan with this slug already exists', 409);
    }

    const monthlyPriceCents = Math.round((monthlyPrice ?? 0) * 100);
    const yearlyPriceCents = Math.round((yearlyPrice ?? 0) * 100);

    // --- Create Stripe product ---
    const stripeProduct = await stripe.products.create({
      name,
      description: description ?? `${name} subscription plan`,
      metadata: { tier, slug },
    });

    // --- Create Stripe prices (monthly & yearly) ---
    let stripeMonthlyPriceId: string | null = null;
    let stripeYearlyPriceId: string | null = null;

    if (monthlyPriceCents > 0) {
      const monthlyStripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: monthlyPriceCents,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier, slug, period: 'monthly' },
      });
      stripeMonthlyPriceId = monthlyStripePrice.id;
    }

    if (yearlyPriceCents > 0) {
      const yearlyStripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: yearlyPriceCents,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { tier, slug, period: 'yearly' },
      });
      stripeYearlyPriceId = yearlyStripePrice.id;
    }

    // --- Create plan in database ---
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug,
        description: description ?? null,
        tier,
        monthlyPrice: monthlyPrice ?? 0,
        yearlyPrice: yearlyPrice ?? 0,
        stripeProductId: stripeProduct.id,
        stripeMonthlyPriceId,
        stripeYearlyPriceId,
        features: features ?? [],
        limits: limits ?? {},
        trialDays: trialDays ?? 0,
        displayOrder: displayOrder ?? 0,
        isPopular: isPopular ?? false,
        badge: badge ?? null,
        isActive: true,
      },
    });

    return successResponse(plan, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

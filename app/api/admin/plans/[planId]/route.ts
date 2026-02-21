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
// PATCH /api/admin/plans/[planId]
// Update a subscription plan.
// If prices change, creates new Stripe prices and archives old ones.
//
// Body: {
//   name?, description?, features?, limits?,
//   monthlyPrice?, yearlyPrice?,
//   isActive?, isPopular?, displayOrder?, badge?, trialDays?
// }
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    await requireAdmin();
    const { planId } = await params;
    const body = await request.json();

    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return errorResponse('Plan not found', 404);
    }

    // Build the update payload from allowlisted fields
    const data: Record<string, unknown> = {};

    const stringFields = ['name', 'description', 'badge'];
    const jsonFields = ['features', 'limits'];
    const boolFields = ['isActive', 'isPopular'];
    const intFields = ['displayOrder', 'trialDays'];

    for (const field of stringFields) {
      if (field in body && typeof body[field] === 'string') {
        data[field] = body[field];
      }
    }
    for (const field of jsonFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }
    for (const field of boolFields) {
      if (field in body && typeof body[field] === 'boolean') {
        data[field] = body[field];
      }
    }
    for (const field of intFields) {
      if (field in body && typeof body[field] === 'number') {
        data[field] = body[field];
      }
    }

    // --- Sync product metadata to Stripe ---
    if (existingPlan.stripeProductId) {
      const productUpdate: Record<string, unknown> = {};
      if (data.name) productUpdate.name = data.name;
      if (data.description !== undefined)
        productUpdate.description = data.description;
      if ('isActive' in data) productUpdate.active = data.isActive;

      if (Object.keys(productUpdate).length > 0) {
        await stripe.products.update(
          existingPlan.stripeProductId,
          productUpdate as Stripe.ProductUpdateParams
        );
      }
    }

    // --- Handle monthly price change ---
    const monthlyPriceChanged =
      'monthlyPrice' in body &&
      typeof body.monthlyPrice === 'number' &&
      Number(existingPlan.monthlyPrice) !== body.monthlyPrice;

    if (monthlyPriceChanged && existingPlan.stripeProductId) {
      const newAmountCents = Math.round(body.monthlyPrice * 100);

      // Archive old Stripe price
      if (existingPlan.stripeMonthlyPriceId) {
        await stripe.prices.update(existingPlan.stripeMonthlyPriceId, {
          active: false,
        });
      }

      if (newAmountCents > 0) {
        const newPrice = await stripe.prices.create({
          product: existingPlan.stripeProductId,
          unit_amount: newAmountCents,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: {
            tier: existingPlan.tier,
            slug: existingPlan.slug,
            period: 'monthly',
          },
        });
        data.stripeMonthlyPriceId = newPrice.id;
      } else {
        data.stripeMonthlyPriceId = null;
      }

      data.monthlyPrice = body.monthlyPrice;
    }

    // --- Handle yearly price change ---
    const yearlyPriceChanged =
      'yearlyPrice' in body &&
      typeof body.yearlyPrice === 'number' &&
      Number(existingPlan.yearlyPrice) !== body.yearlyPrice;

    if (yearlyPriceChanged && existingPlan.stripeProductId) {
      const newAmountCents = Math.round(body.yearlyPrice * 100);

      if (existingPlan.stripeYearlyPriceId) {
        await stripe.prices.update(existingPlan.stripeYearlyPriceId, {
          active: false,
        });
      }

      if (newAmountCents > 0) {
        const newPrice = await stripe.prices.create({
          product: existingPlan.stripeProductId,
          unit_amount: newAmountCents,
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: {
            tier: existingPlan.tier,
            slug: existingPlan.slug,
            period: 'yearly',
          },
        });
        data.stripeYearlyPriceId = newPrice.id;
      } else {
        data.stripeYearlyPriceId = null;
      }

      data.yearlyPrice = body.yearlyPrice;
    }

    if (Object.keys(data).length === 0) {
      return errorResponse('No valid fields to update');
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });

    return successResponse(updatedPlan);
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/plans/[planId]
// Soft-delete a plan (set isActive=false) and archive in Stripe.
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    await requireAdmin();
    const { planId } = await params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return errorResponse('Plan not found', 404);
    }

    // Archive in Stripe: prices first, then product
    if (plan.stripeProductId) {
      if (plan.stripeMonthlyPriceId) {
        await stripe.prices.update(plan.stripeMonthlyPriceId, {
          active: false,
        });
      }
      if (plan.stripeYearlyPriceId) {
        await stripe.prices.update(plan.stripeYearlyPriceId, {
          active: false,
        });
      }
      await stripe.products.update(plan.stripeProductId, { active: false });
    }

    // Soft delete in DB
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return successResponse(updatedPlan);
  } catch (error) {
    return handleApiError(error);
  }
}

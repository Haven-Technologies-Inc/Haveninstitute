import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price.id;

          // Determine tier from price ID
          let tier: 'Pro' | 'Premium' = 'Pro';
          if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ||
              priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
            tier = 'Premium';
          }

          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionTier: tier },
          });

          await prisma.subscription.create({
            data: {
              userId,
              planType: tier,
              status: 'active',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: priceId,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'canceled', canceledAt: new Date() },
        });

        // Find user and downgrade
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (subscription) {
          await prisma.user.update({
            where: { id: subscription.userId },
            data: { subscriptionTier: 'Free' },
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer) {
          const subscription = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });
          if (subscription) {
            await prisma.paymentTransaction.create({
              data: {
                userId: subscription.userId,
                subscriptionId: subscription.id,
                stripeInvoiceId: invoice.id,
                amount: (invoice.amount_paid ?? 0) / 100,
                currency: invoice.currency?.toUpperCase() ?? 'USD',
                status: 'succeeded',
                receiptUrl: invoice.hosted_invoice_url,
                invoicePdf: invoice.invoice_pdf,
              },
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }

  return NextResponse.json({ received: true });
}

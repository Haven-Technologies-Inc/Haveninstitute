const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  const webhook = await stripe.webhookEndpoints.create({
    url: 'https://api.havenstudy.com/api/v1/subscriptions/webhook',
    enabled_events: [
      'customer.subscription.created',
      'customer.subscription.updated', 
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
      'checkout.session.completed'
    ]
  });
  console.log('SECRET:', webhook.secret);
})();

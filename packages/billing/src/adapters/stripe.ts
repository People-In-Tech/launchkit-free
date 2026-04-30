import type Stripe from 'stripe';
import type {
  BillingAdapter,
  CheckoutParams,
  CheckoutResult,
  PortalParams,
  PortalResult,
  WebhookEvent,
} from '../types';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    // Dynamic require keeps the package build-time safe (no env vars needed at build)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const StripeLib = require('stripe') as typeof import('stripe');
    const StripeConstructor = (StripeLib as unknown as { default: typeof Stripe }).default ?? StripeLib;
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new StripeConstructor(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Lazy-initialized Stripe adapter.
 * All SDK access is deferred until the first method call so the package is
 * safe to import without any environment variables present at build time.
 */
export class StripeAdapter implements BillingAdapter {
  // -------------------------------------------------------------------------
  // Checkout
  // -------------------------------------------------------------------------
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const stripe = getStripe();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: params.priceId, quantity: params.seats ?? 1 },
    ];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        organizationId: params.organizationId,
        plan: params.plan,
        userId: params.userId,
      },
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a URL');
    }
    return { url: session.url };
  }

  // -------------------------------------------------------------------------
  // Portal
  // -------------------------------------------------------------------------
  async createPortal(params: PortalParams): Promise<PortalResult> {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { url: session.url };
  }

  // -------------------------------------------------------------------------
  // Webhook
  // -------------------------------------------------------------------------
  async parseWebhook(body: string, signature: string): Promise<WebhookEvent> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as Stripe.Event;

    return this._normalizeEvent(event);
  }

  private _normalizeEvent(event: Stripe.Event): WebhookEvent {
    switch (event.type) {
      case 'checkout.session.completed':
        return { type: 'checkout.completed', data: event.data.object };
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return { type: 'subscription.updated', data: event.data.object };
      case 'customer.subscription.deleted':
        return { type: 'subscription.deleted', data: event.data.object };
      case 'invoice.payment_succeeded':
        return { type: 'invoice.paid', data: event.data.object };
      case 'charge.refunded':
        return { type: 'charge.refunded', data: event.data.object };
      default:
        return { type: 'subscription.updated', data: { _raw: event } };
    }
  }

  // -------------------------------------------------------------------------
  // Seat management
  // -------------------------------------------------------------------------
  async updateSubscriptionSeats(subscriptionId: string, seats: number): Promise<void> {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];
    if (!item) {
      throw new Error(`Subscription ${subscriptionId} has no items`);
    }
    await stripe.subscriptionItems.update(item.id, { quantity: seats });
  }

  // -------------------------------------------------------------------------
  // Metered usage
  // -------------------------------------------------------------------------
  async reportUsage(subscriptionItemId: string, quantity: number): Promise<void> {
    const stripe = getStripe();
    // Use the usage records API for metered billing items
    await (stripe as unknown as {
      subscriptionItems: {
        createUsageRecord: (
          id: string,
          params: { quantity: number; timestamp: 'now'; action: 'increment' },
        ) => Promise<unknown>;
      };
    }).subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: 'now',
      action: 'increment',
    });
  }

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  }
}

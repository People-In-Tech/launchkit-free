import { createHmac } from 'crypto';
import type {
  BillingAdapter,
  CheckoutParams,
  CheckoutResult,
  PortalParams,
  PortalResult,
  WebhookEvent,
} from '../types';

// ---------------------------------------------------------------------------
// Types for the Paddle SDK surface we use
// ---------------------------------------------------------------------------
interface PaddleSDK {
  // TODO: Import from @paddle/paddle-node-sdk
  transactions: {
    create(data: Record<string, unknown>): Promise<{ data?: { id?: string; checkout?: { url?: string } } }>;
  };
  subscriptions: {
    get(id: string): Promise<{ data?: { managementUrls?: { cancel?: string; updatePaymentMethod?: string }; status?: string } }>;
    update(id: string, data: Record<string, unknown>): Promise<unknown>;
    cancel(id: string, data: Record<string, unknown>): Promise<unknown>;
  };
}

let _paddle: PaddleSDK | null = null;

function getPaddle(): PaddleSDK {
  if (!_paddle) {
    // TODO: Initialize Paddle SDK
    // const { Paddle } = require('@paddle/paddle-node-sdk');
    // const apiKey = process.env.PADDLE_API_KEY;
    // if (!apiKey) throw new Error('PADDLE_API_KEY is not set');
    // _paddle = new Paddle(apiKey);
    throw new Error(
      'Paddle SDK not yet initialized. Install @paddle/paddle-node-sdk and set PADDLE_API_KEY.',
    );
  }
  return _paddle;
}

/**
 * Paddle billing adapter.
 * All SDK access is deferred until first call so the package is safe to import
 * without any environment variables present at build time.
 */
export class PaddleAdapter implements BillingAdapter {
  // -------------------------------------------------------------------------
  // Checkout
  // -------------------------------------------------------------------------
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const paddle = getPaddle();

    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId: params.priceId,
          quantity: params.seats ?? 1,
        },
      ],
      customData: {
        organizationId: params.organizationId,
        userId: params.userId,
        plan: params.plan,
      },
      checkout: {
        url: params.successUrl,
      },
    });

    const url = transaction?.data?.checkout?.url;
    if (!url) {
      throw new Error('Paddle transaction did not return a checkout URL');
    }
    return { url };
  }

  // -------------------------------------------------------------------------
  // Portal
  // -------------------------------------------------------------------------
  async createPortal(params: PortalParams): Promise<PortalResult> {
    const paddle = getPaddle();
    // Paddle uses subscription management URLs rather than a portal session
    const sub = await paddle.subscriptions.get(params.customerId);
    const cancelUrl = sub?.data?.managementUrls?.cancel;
    const updateUrl = sub?.data?.managementUrls?.updatePaymentMethod;
    const url = updateUrl ?? cancelUrl;
    if (!url) {
      throw new Error('Paddle did not return a management URL');
    }
    return { url };
  }

  // -------------------------------------------------------------------------
  // Webhook — Paddle signature verification
  // -------------------------------------------------------------------------
  async parseWebhook(body: string, signature: string): Promise<WebhookEvent> {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('PADDLE_WEBHOOK_SECRET is not set');
    }

    // TODO: Use Paddle's official webhook verification
    // Paddle Billing uses ts + h1 signature format
    const parts = Object.fromEntries(
      signature.split(';').map((p) => {
        const [k, v] = p.split('=');
        return [k, v];
      }),
    );

    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) {
      throw new Error('Invalid Paddle webhook signature format');
    }

    const computed = createHmac('sha256', secret)
      .update(`${ts}:${body}`)
      .digest('hex');

    if (computed !== h1) {
      throw new Error('Paddle webhook signature verification failed');
    }

    const payload = JSON.parse(body) as {
      event_type?: string;
      data?: unknown;
    };

    return this._normalizeEvent(payload.event_type ?? '', payload);
  }

  private _normalizeEvent(
    eventType: string,
    payload: { event_type?: string; data?: unknown },
  ): WebhookEvent {
    const data: any = payload.data ?? {};

    switch (eventType) {
      case 'transaction.completed':
        return { type: 'checkout.completed', data };
      case 'subscription.updated':
        return { type: 'subscription.updated', data };
      case 'subscription.canceled':
        return { type: 'subscription.deleted', data };
      case 'transaction.payment_failed':
        // Map to invoice.paid for consistency — downstream should check status
        return { type: 'invoice.paid', data };
      default:
        return { type: 'subscription.updated', data: { _raw: payload } };
    }
  }

  // -------------------------------------------------------------------------
  // Seat management
  // -------------------------------------------------------------------------
  async updateSubscriptionSeats(subscriptionId: string, seats: number): Promise<void> {
    const paddle = getPaddle();
    // TODO: Get the first item from the subscription and update its quantity
    await paddle.subscriptions.update(subscriptionId, {
      items: [
        // Need to get priceId from existing subscription first
        { quantity: seats },
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Metered usage — Paddle does not currently support metered billing the same
  // way Stripe does. Usage should be tracked externally and billed via
  // one-time charges or subscription adjustments.
  // -------------------------------------------------------------------------
  async reportUsage(subscriptionItemId: string, quantity: number): Promise<void> {
    console.warn(
      `[Paddle] reportUsage called for item ${subscriptionItemId} qty=${quantity}. ` +
        'Paddle does not support metered billing via API — implement a custom meter.',
    );
  }

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const paddle = getPaddle();
    await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: 'next_billing_period',
    });
  }
}

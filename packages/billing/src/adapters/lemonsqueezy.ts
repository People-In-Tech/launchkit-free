import type {
  BillingAdapter,
  CheckoutParams,
  CheckoutResult,
  PortalParams,
  PortalResult,
  WebhookEvent,
} from '../types';
import { createHmac } from 'crypto';

// ---------------------------------------------------------------------------
// Types for the parts of the Lemon Squeezy SDK we actually use
// ---------------------------------------------------------------------------
interface LSCheckout {
  data?: { attributes?: { url?: string } };
}

interface LSSubscription {
  data?: {
    id?: string;
    attributes?: {
      urls?: { customer_portal?: string };
      status?: string;
      variant_id?: number;
      product_id?: number;
      customer_id?: number;
      created_at?: string;
      renews_at?: string;
      ends_at?: string | null;
      first_subscription_item?: { id?: number; quantity?: number };
    };
  };
}

interface LSSDK {
  lemonSqueezySetup(config: { apiKey: string }): void;
  createCheckout(
    storeId: string,
    variantId: string,
    options: Record<string, unknown>,
  ): Promise<LSCheckout>;
  getSubscription(subscriptionId: string): Promise<LSSubscription>;
  updateSubscriptionItem(
    itemId: string,
    data: { quantity: number },
  ): Promise<unknown>;
  cancelSubscription(subscriptionId: string): Promise<unknown>;
}

let _sdk: LSSDK | null = null;

function getLemonSqueezy(): LSSDK {
  if (!_sdk) {
    // Dynamic require keeps the package build-time safe
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk = require('@lemonsqueezy/lemonsqueezy.js') as LSSDK;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      throw new Error('LEMONSQUEEZY_API_KEY is not set');
    }
    sdk.lemonSqueezySetup({ apiKey });
    _sdk = sdk;
  }
  return _sdk;
}

/**
 * Lemon Squeezy billing adapter.
 * All SDK access is deferred until first call so the package is safe to import
 * without any environment variables present at build time.
 */
export class LemonSqueezyAdapter implements BillingAdapter {
  // -------------------------------------------------------------------------
  // Checkout
  // -------------------------------------------------------------------------
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const sdk = getLemonSqueezy();
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
      throw new Error('LEMONSQUEEZY_STORE_ID is not set');
    }

    // params.priceId is the Lemon Squeezy variant ID for LS checkouts
    const checkout = await sdk.createCheckout(storeId, params.priceId, {
      checkoutOptions: {
        embed: false,
      },
      checkoutData: {
        custom: {
          organizationId: params.organizationId,
          userId: params.userId,
          plan: params.plan,
        },
      },
      productOptions: {
        redirectUrl: params.successUrl,
      },
    });

    const url = checkout?.data?.attributes?.url;
    if (!url) {
      throw new Error('Lemon Squeezy checkout did not return a URL');
    }
    return { url };
  }

  // -------------------------------------------------------------------------
  // Portal
  // -------------------------------------------------------------------------
  async createPortal(params: PortalParams): Promise<PortalResult> {
    const sdk = getLemonSqueezy();
    // Retrieve the subscription to get the customer portal URL
    const sub = await sdk.getSubscription(params.customerId);
    const portalUrl = sub?.data?.attributes?.urls?.customer_portal;
    if (!portalUrl) {
      throw new Error('Lemon Squeezy did not return a customer portal URL');
    }
    return { url: portalUrl };
  }

  // -------------------------------------------------------------------------
  // Webhook — HMAC-SHA256 signature verification
  // -------------------------------------------------------------------------
  async parseWebhook(body: string, signature: string): Promise<WebhookEvent> {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    }

    const digest = createHmac('sha256', secret).update(body).digest('hex');
    if (digest !== signature) {
      throw new Error('Lemon Squeezy webhook signature verification failed');
    }

    const payload = JSON.parse(body) as {
      meta?: { event_name?: string; custom_data?: Record<string, unknown> };
      data?: unknown;
    };

    const eventName = payload?.meta?.event_name ?? '';

    return this._normalizeEvent(eventName, payload);
  }

  private _normalizeEvent(
    eventName: string,
    payload: {
      meta?: { event_name?: string; custom_data?: Record<string, unknown> };
      data?: unknown;
    },
  ): WebhookEvent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      ...(typeof payload.data === 'object' && payload.data !== null ? payload.data : {}),
      _customData: payload.meta?.custom_data ?? {},
    };

    switch (eventName) {
      case 'order_created':
        return { type: 'checkout.completed', data };
      case 'subscription_updated':
        return { type: 'subscription.updated', data };
      case 'subscription_cancelled':
      case 'subscription_expired':
        return { type: 'subscription.deleted', data };
      case 'subscription_payment_success':
        return { type: 'invoice.paid', data };
      default:
        return { type: 'subscription.updated', data: { _raw: payload } };
    }
  }

  // -------------------------------------------------------------------------
  // Seat management
  // -------------------------------------------------------------------------
  async updateSubscriptionSeats(subscriptionId: string, seats: number): Promise<void> {
    const sdk = getLemonSqueezy();
    // Retrieve first subscription item id
    const sub = await sdk.getSubscription(subscriptionId);
    const itemId = sub?.data?.attributes?.first_subscription_item?.id;
    if (!itemId) {
      throw new Error(`Subscription ${subscriptionId} has no items`);
    }
    await sdk.updateSubscriptionItem(String(itemId), { quantity: seats });
  }

  // -------------------------------------------------------------------------
  // Metered usage — Lemon Squeezy does not expose a standalone usage reporting
  // API equivalent to Stripe's usage records. We log the usage and it should
  // be handled via a separate metering integration or custom implementation.
  // -------------------------------------------------------------------------
  async reportUsage(subscriptionItemId: string, quantity: number): Promise<void> {
    // Lemon Squeezy does not currently support metered usage reporting via API.
    // This is a no-op placeholder. Implementations should use a dedicated
    // metering service (e.g. Lago, OpenMeter) and sync totals manually.
    console.warn(
      `[LemonSqueezy] reportUsage called for item ${subscriptionItemId} qty=${quantity}. ` +
        'Lemon Squeezy does not support metered billing via API — implement a custom meter.',
    );
  }

  // -------------------------------------------------------------------------
  // Cancellation
  // -------------------------------------------------------------------------
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const sdk = getLemonSqueezy();
    await sdk.cancelSubscription(subscriptionId);
  }
}

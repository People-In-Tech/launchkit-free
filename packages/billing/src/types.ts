export type BillingProvider = 'stripe' | 'lemonsqueezy' | 'paddle';

export interface BillingConfig {
  provider: BillingProvider;
  plans: PlanConfig[];
}

export interface PlanConfig {
  id: string;
  name: string;
  priceId: { monthly: string; yearly: string };
  features: string[];
  limits: { seats: number; aiCreditsPerMonth: number };
}

export interface CheckoutParams {
  organizationId: string;
  userId: string;
  plan: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  seats?: number;
}

export interface CheckoutResult {
  url: string;
}

export interface PortalParams {
  customerId: string;
  returnUrl: string;
}

export interface PortalResult {
  url: string;
}

export interface WebhookEvent {
  type: 'checkout.completed' | 'subscription.updated' | 'subscription.deleted' | 'invoice.paid' | 'charge.refunded';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface BillingAdapter {
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  createPortal(params: PortalParams): Promise<PortalResult>;
  parseWebhook(body: string, signature: string): Promise<WebhookEvent>;
  updateSubscriptionSeats(subscriptionId: string, seats: number): Promise<void>;
  reportUsage(subscriptionItemId: string, quantity: number): Promise<void>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

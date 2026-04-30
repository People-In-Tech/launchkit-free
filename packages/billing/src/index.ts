export * from './types';
export { StripeAdapter } from './adapters/stripe';
export { LemonSqueezyAdapter } from './adapters/lemonsqueezy';
export { PaddleAdapter } from './adapters/paddle';

import type { BillingAdapter, BillingProvider } from './types';
import { StripeAdapter } from './adapters/stripe';
import { LemonSqueezyAdapter } from './adapters/lemonsqueezy';
import { PaddleAdapter } from './adapters/paddle';

/**
 * Factory: returns a BillingAdapter for the configured provider.
 *
 * Resolution order:
 *   1. Explicit `provider` argument
 *   2. BILLING_PROVIDER environment variable
 *   3. Default: 'stripe'
 */
export function createBillingAdapter(provider?: BillingProvider): BillingAdapter {
  const p: BillingProvider =
    provider ??
    (process.env.BILLING_PROVIDER as BillingProvider | undefined) ??
    'stripe';

  switch (p) {
    case 'stripe':
      return new StripeAdapter();
    case 'lemonsqueezy':
      return new LemonSqueezyAdapter();
    case 'paddle':
      return new PaddleAdapter();
    default:
      throw new Error(`Unknown billing provider: ${p as string}`);
  }
}

import type { AnalyticsAdapter } from '../adapter';
import { NoOpAdapter } from './noop';

export type AnalyticsProvider = 'posthog' | 'plausible' | 'noop';

let analyticsInstance: AnalyticsAdapter | null = null;

/**
 * Creates an analytics adapter based on the configured provider.
 * Defaults to no-op if no provider is configured.
 */
export function createAnalyticsAdapter(provider?: AnalyticsProvider): AnalyticsAdapter {
  const p = provider ?? detectProvider();

  switch (p) {
    case 'posthog': {
      const { PostHogAdapter } = require('./posthog');
      return new PostHogAdapter();
    }
    case 'plausible': {
      const { PlausibleAdapter } = require('./plausible');
      return new PlausibleAdapter();
    }
    case 'noop':
    default:
      return new NoOpAdapter();
  }
}

function detectProvider(): AnalyticsProvider {
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) return 'posthog';
    if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return 'plausible';
  }
  return 'noop';
}

/**
 * Returns a singleton analytics adapter instance.
 * Auto-detects the provider from environment variables.
 */
export function getAnalytics(): AnalyticsAdapter {
  if (!analyticsInstance) {
    analyticsInstance = createAnalyticsAdapter();
  }
  return analyticsInstance;
}

export { PostHogAdapter } from './posthog';
export { PlausibleAdapter } from './plausible';
export { NoOpAdapter } from './noop';

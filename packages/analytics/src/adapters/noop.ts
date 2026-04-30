import type { AnalyticsAdapter } from '../adapter';

/**
 * No-op adapter used when analytics is disabled or no provider is configured.
 */
export class NoOpAdapter implements AnalyticsAdapter {
  identify(_userId: string, _traits?: Record<string, any>) {
    // No-op
  }

  track(_event: string, _properties?: Record<string, any>) {
    // No-op
  }

  page(_name?: string, _properties?: Record<string, any>) {
    // No-op
  }

  reset() {
    // No-op
  }
}

import type { AnalyticsAdapter } from '../adapter';

export class PlausibleAdapter implements AnalyticsAdapter {
  private domain: string;

  constructor() {
    this.domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '';
  }

  identify(_userId: string, _traits?: Record<string, any>) {
    // Plausible is privacy-first — no user identification
  }

  track(event: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, { props: properties });
    }
  }

  page(_name?: string, _properties?: Record<string, any>) {
    // Plausible automatically tracks page views via the script tag
  }

  reset() {
    // No-op for Plausible
  }
}

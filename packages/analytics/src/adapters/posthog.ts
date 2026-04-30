import type { AnalyticsAdapter } from '../adapter';

export class PostHogAdapter implements AnalyticsAdapter {
  private client: any;

  constructor() {
    if (typeof window !== 'undefined') {
      // Client-side
      const posthog = require('posthog-js').default;
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false, // We'll capture manually
        });
        this.client = posthog;
      }
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.client?.identify(userId, traits);
  }

  track(event: string, properties?: Record<string, any>) {
    this.client?.capture(event, properties);
  }

  page(name?: string, properties?: Record<string, any>) {
    this.client?.capture('$pageview', { ...properties, page_name: name });
  }

  reset() {
    this.client?.reset();
  }
}

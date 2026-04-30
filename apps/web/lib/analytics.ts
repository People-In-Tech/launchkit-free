import { PostHog } from 'posthog-node';

let posthogServer: PostHog | null = null;

export function getServerAnalytics() {
  if (!posthogServer && process.env.POSTHOG_API_KEY) {
    posthogServer = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    });
  }
  return posthogServer;
}

export function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, any>,
) {
  getServerAnalytics()?.capture({
    distinctId: userId,
    event,
    properties,
  });
}

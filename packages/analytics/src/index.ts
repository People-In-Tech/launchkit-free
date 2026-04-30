export type { AnalyticsAdapter, AnalyticsEvent } from './adapter';
export {
  createAnalyticsAdapter,
  getAnalytics,
  PostHogAdapter,
  PlausibleAdapter,
  NoOpAdapter,
} from './adapters';
export type { AnalyticsProvider } from './adapters';

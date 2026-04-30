export interface AnalyticsAdapter {
  identify(userId: string, traits?: Record<string, any>): void;
  track(event: string, properties?: Record<string, any>): void;
  page(name?: string, properties?: Record<string, any>): void;
  reset(): void;
}

// Pre-defined events for type safety
export type AnalyticsEvent =
  | 'user_signed_up'
  | 'user_signed_in'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_upgraded'
  | 'team_member_invited'
  | 'team_member_removed'
  | 'ai_chat_sent'
  | 'ai_credits_purchased'
  | 'feature_used'
  | 'page_viewed'
  | 'file_uploaded'
  | 'settings_updated';

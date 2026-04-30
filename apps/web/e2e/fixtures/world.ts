import { Page, APIResponse } from "@playwright/test";

/**
 * Custom Cucumber World — shared state for each scenario
 */
export interface ICustomWorld {
  page: Page;
  apiResponse?: APIResponse;
  stripeTestSessionId?: string;
  pendingScenario?: boolean;
}

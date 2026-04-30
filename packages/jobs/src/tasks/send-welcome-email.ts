/**
 * Background job: send-welcome-email
 *
 * Triggered after a user signs up. Sends the welcome email via Resend.
 * Runs asynchronously so the signup flow remains fast.
 *
 * Trigger in your Clerk webhook handler:
 *   import { tasks } from "@trigger.dev/sdk/v3";
 *   import type { SendWelcomeEmailPayload } from "@launchkit/jobs";
 *   await tasks.trigger<typeof sendWelcomeEmail>("send-welcome-email", {
 *     userId: event.data.id,
 *     email: event.data.email_addresses[0].email_address,
 *     firstName: event.data.first_name ?? undefined,
 *   });
 */

import { task, logger, retry } from "@trigger.dev/sdk/v3";
import { sendEmail, WelcomeEmail } from "@launchkit/email";
import * as React from "react";

export interface SendWelcomeEmailPayload {
  /** Clerk user ID */
  userId: string;
  /** Recipient email address */
  email: string;
  /** User's first name for personalization (optional) */
  firstName?: string;
}

export const sendWelcomeEmail = task({
  id: "send-welcome-email",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30_000,
  },

  run: async (payload: SendWelcomeEmailPayload) => {
    const { userId, email, firstName } = payload;

    logger.info("Sending welcome email", { userId, email });

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`;

    const result = await retry.onThrow(
      async () => {
        return sendEmail({
          to: email,
          subject: "Welcome to LaunchKit! 🚀",
          react: React.createElement(WelcomeEmail, { firstName, dashboardUrl }) as React.ReactElement,
        });
      },
      { maxAttempts: 2 }
    );

    logger.info("Welcome email sent", { userId, email, messageId: result.data?.id });

    return { success: true, messageId: result.data?.id };
  },
});

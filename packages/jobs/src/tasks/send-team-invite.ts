/**
 * Background job: send-team-invite
 *
 * Sends a team invitation email when a user is invited to an organization.
 * Trigger this from your team invite action.
 *
 * Usage:
 *   import { tasks } from "@trigger.dev/sdk/v3";
 *   await tasks.trigger("send-team-invite", {
 *     inviteeEmail: "user@example.com",
 *     inviterName: "Alice",
 *     organizationName: "Acme Corp",
 *     inviteUrl: "https://app.example.com/accept?token=xxx",
 *   });
 */

import { task, logger, retry } from "@trigger.dev/sdk/v3";
import { sendEmail, TeamInviteEmail } from "@launchkit/email";
import * as React from "react";

export interface SendTeamInvitePayload {
  /** Email address to send the invite to */
  inviteeEmail: string;
  /** Display name of the person who sent the invite */
  inviterName: string;
  /** Organization name */
  organizationName: string;
  /** Accept invitation URL (Clerk invite link) */
  inviteUrl: string;
  /** Organization ID for logging */
  organizationId?: string;
}

export const sendTeamInvite = task({
  id: "send-team-invite",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30_000,
  },

  run: async (payload: SendTeamInvitePayload) => {
    const { inviteeEmail, inviterName, organizationName, inviteUrl, organizationId } = payload;

    logger.info("Sending team invite email", {
      inviteeEmail,
      inviterName,
      organizationName,
      organizationId,
    });

    const result = await retry.onThrow(
      async () => {
        return sendEmail({
          to: inviteeEmail,
          subject: `${inviterName} invited you to join ${organizationName}`,
          react: React.createElement(TeamInviteEmail, {
            inviterName,
            organizationName,
            inviteUrl,
          }) as React.ReactElement,
        });
      },
      { maxAttempts: 2 }
    );

    logger.info("Team invite email sent", {
      inviteeEmail,
      organizationId,
      messageId: result.data?.id,
    });

    return { success: true, messageId: result.data?.id };
  },
});

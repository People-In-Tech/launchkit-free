/**
 * Background job: enroll-drip-campaign
 *
 * Triggered when a campaign trigger event fires (e.g. user.created, trial.expiring).
 * Creates an enrollment record with the first step's delay.
 * Skips if the user is already enrolled in this campaign.
 *
 * Usage:
 *   import { tasks } from "@trigger.dev/sdk/v3";
 *   import type { EnrollDripCampaignPayload } from "@launchkit/jobs";
 *   await tasks.trigger<typeof enrollDripCampaign>("enroll-drip-campaign", {
 *     userId: "user_xxx",
 *     trigger: "user.created",
 *   });
 */

import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@launchkit/database";
import {
  dripCampaigns,
  dripSteps,
  dripEnrollments,
  eq,
  and,
  asc,
} from "@launchkit/database";

export interface EnrollDripCampaignPayload {
  /** The user ID to enroll */
  userId: string;
  /** The trigger event name (e.g. "user.created", "trial.expiring") */
  trigger: string;
  /** Optional: specific campaign ID to enroll in (skips trigger matching) */
  campaignId?: string;
}

export const enrollDripCampaign = task({
  id: "enroll-drip-campaign",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30_000,
  },

  run: async (payload: EnrollDripCampaignPayload) => {
    const { userId, trigger, campaignId: specificCampaignId } = payload;

    logger.info("Enrolling user in drip campaign", { userId, trigger });

    // Find matching campaign
    let campaign;
    if (specificCampaignId) {
      const [found] = await db
        .select()
        .from(dripCampaigns)
        .where(
          and(
            eq(dripCampaigns.id, specificCampaignId),
            eq(dripCampaigns.enabled, true)
          )
        )
        .limit(1);
      campaign = found;
    } else {
      const [found] = await db
        .select()
        .from(dripCampaigns)
        .where(
          and(
            eq(dripCampaigns.trigger, trigger),
            eq(dripCampaigns.enabled, true)
          )
        )
        .limit(1);
      campaign = found;
    }

    if (!campaign) {
      logger.info("No matching enabled campaign found", { trigger });
      return { success: false, reason: "no_campaign" };
    }

    // Check if already enrolled
    const [existing] = await db
      .select()
      .from(dripEnrollments)
      .where(
        and(
          eq(dripEnrollments.userId, userId),
          eq(dripEnrollments.campaignId, campaign.id),
          eq(dripEnrollments.status, "active")
        )
      )
      .limit(1);

    if (existing) {
      logger.info("User already enrolled in this campaign", {
        userId,
        campaignId: campaign.id,
      });
      return { success: false, reason: "already_enrolled" };
    }

    // Get the first enabled step's delay
    const [firstStep] = await db
      .select()
      .from(dripSteps)
      .where(
        and(
          eq(dripSteps.campaignId, campaign.id),
          eq(dripSteps.enabled, true)
        )
      )
      .orderBy(asc(dripSteps.stepOrder))
      .limit(1);

    const delayMs = firstStep ? firstStep.delayMinutes * 60 * 1000 : 0;
    const nextSendAt = new Date(Date.now() + delayMs);

    const [enrollment] = await db
      .insert(dripEnrollments)
      .values({
        userId,
        campaignId: campaign.id,
        currentStep: 0,
        status: "active",
        nextSendAt,
      })
      .returning();

    logger.info("User enrolled in drip campaign", {
      userId,
      campaignId: campaign.id,
      enrollmentId: enrollment.id,
      nextSendAt: nextSendAt.toISOString(),
    });

    return {
      success: true,
      enrollmentId: enrollment.id,
      campaignName: campaign.name,
    };
  },
});

// @ts-nocheck
import { db } from "@launchkit/database";
import {
  dripCampaigns,
  dripSteps,
  dripEnrollments,
  dripSends,
} from "@launchkit/database";
import { eq, and, sql, count, asc } from "drizzle-orm";

/** Valid trigger events for drip campaigns */
export const CAMPAIGN_TRIGGERS = [
  "user.created",
  "trial.expiring",
  "user.inactive",
  "subscription.cancelled",
] as const;

export type CampaignTrigger = (typeof CAMPAIGN_TRIGGERS)[number];

/**
 * Enroll a user in a drip campaign matching the given trigger.
 * Skips if the user is already enrolled in this campaign.
 */
export async function enrollUser(
  userId: string,
  trigger: string
): Promise<string | null> {
  // Find an enabled campaign for this trigger
  const [campaign] = await db
    .select()
    .from(dripCampaigns)
    .where(
      and(eq(dripCampaigns.trigger, trigger), eq(dripCampaigns.enabled, true))
    )
    .limit(1);

  if (!campaign) return null;

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

  if (existing) return null;

  // Get the first step's delay
  const [firstStep] = await db
    .select()
    .from(dripSteps)
    .where(
      and(eq(dripSteps.campaignId, campaign.id), eq(dripSteps.enabled, true))
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

  return enrollment.id;
}

/**
 * Process a single enrollment: send the current step email and advance.
 */
export async function processEnrollment(enrollmentId: string): Promise<boolean> {
  const [enrollment] = await db
    .select()
    .from(dripEnrollments)
    .where(eq(dripEnrollments.id, enrollmentId))
    .limit(1);

  if (!enrollment || enrollment.status !== "active") return false;

  // Get all enabled steps for this campaign in order
  const steps = await db
    .select()
    .from(dripSteps)
    .where(
      and(
        eq(dripSteps.campaignId, enrollment.campaignId),
        eq(dripSteps.enabled, true)
      )
    )
    .orderBy(asc(dripSteps.stepOrder));

  const currentStepIndex = enrollment.currentStep ?? 0;
  const step = steps[currentStepIndex];

  if (!step) {
    // No more steps — mark as completed
    await db
      .update(dripEnrollments)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(dripEnrollments.id, enrollmentId));
    return true;
  }

  // Create a send record
  const [send] = await db
    .insert(dripSends)
    .values({
      enrollmentId,
      stepId: step.id,
      status: "pending",
    })
    .returning();

  try {
    // Mark as sent (actual email sending is done by the Trigger.dev task)
    await db
      .update(dripSends)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(dripSends.id, send.id));

    // Advance to next step
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= steps.length) {
      // Completed all steps
      await db
        .update(dripEnrollments)
        .set({
          currentStep: nextStepIndex,
          status: "completed",
          completedAt: new Date(),
          nextSendAt: null,
        })
        .where(eq(dripEnrollments.id, enrollmentId));
    } else {
      // Schedule next step
      const nextStep = steps[nextStepIndex];
      const nextSendAt = new Date(
        Date.now() + nextStep.delayMinutes * 60 * 1000
      );
      await db
        .update(dripEnrollments)
        .set({
          currentStep: nextStepIndex,
          nextSendAt,
        })
        .where(eq(dripEnrollments.id, enrollmentId));
    }

    return true;
  } catch {
    await db
      .update(dripSends)
      .set({ status: "failed", error: "Failed to send email" })
      .where(eq(dripSends.id, send.id));
    return false;
  }
}

/**
 * Get aggregate stats for a drip campaign.
 */
export async function getDripStats(campaignId: string) {
  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(dripEnrollments)
    .where(eq(dripEnrollments.campaignId, campaignId));

  const [activeCount] = await db
    .select({ count: count() })
    .from(dripEnrollments)
    .where(
      and(
        eq(dripEnrollments.campaignId, campaignId),
        eq(dripEnrollments.status, "active")
      )
    );

  const [completedCount] = await db
    .select({ count: count() })
    .from(dripEnrollments)
    .where(
      and(
        eq(dripEnrollments.campaignId, campaignId),
        eq(dripEnrollments.status, "completed")
      )
    );

  // Get send stats by joining
  const steps = await db
    .select()
    .from(dripSteps)
    .where(eq(dripSteps.campaignId, campaignId))
    .orderBy(asc(dripSteps.stepOrder));

  const stepIds = steps.map((s) => s.id);

  let totalSent = 0;
  let totalOpened = 0;
  let totalClicked = 0;

  if (stepIds.length > 0) {
    for (const stepId of stepIds) {
      const [sentCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(and(eq(dripSends.stepId, stepId), eq(dripSends.status, "sent")));
      totalSent += sentCount.count;

      const [openedCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(
          and(
            eq(dripSends.stepId, stepId),
            sql`${dripSends.openedAt} IS NOT NULL`
          )
        );
      totalOpened += openedCount.count;

      const [clickedCount] = await db
        .select({ count: count() })
        .from(dripSends)
        .where(
          and(
            eq(dripSends.stepId, stepId),
            sql`${dripSends.clickedAt} IS NOT NULL`
          )
        );
      totalClicked += clickedCount.count;
    }
  }

  return {
    totalEnrollments: enrollmentCount.count,
    activeEnrollments: activeCount.count,
    completedEnrollments: completedCount.count,
    totalSent,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
  };
}

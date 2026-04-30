// @ts-nocheck
import { db } from "@launchkit/database";
import { dripCampaigns, dripSteps } from "@launchkit/database";

/**
 * Seed pre-built drip campaigns with steps.
 * Safe to run multiple times — checks for existing campaigns by name.
 */
export async function seedDripCampaigns() {
  const campaigns = [
    {
      name: "Welcome Series",
      trigger: "user.created",
      description: "Onboard new users over their first week with helpful tips and guidance.",
      steps: [
        { stepOrder: 0, delayMinutes: 0, subject: "Welcome! Here's how to get started", templateName: "drip-welcome-day0" },
        { stepOrder: 1, delayMinutes: 1440, subject: "Quick tip: Set up your first feature", templateName: "drip-welcome-day1" },
        { stepOrder: 2, delayMinutes: 4320, subject: "3 things most users miss", templateName: "drip-welcome-day3" },
        { stepOrder: 3, delayMinutes: 10080, subject: "Your first week recap", templateName: "drip-welcome-day7" },
      ],
    },
    {
      name: "Trial Expiring",
      trigger: "trial.expiring",
      description: "Remind users before and after their trial expires.",
      steps: [
        { stepOrder: 0, delayMinutes: 0, subject: "Your trial expires in 3 days", templateName: "drip-trial-expiring" },
        { stepOrder: 1, delayMinutes: 4320, subject: "Your trial has expired — here's what you're missing", templateName: "drip-trial-expired" },
      ],
    },
    {
      name: "Upgrade Nudge",
      trigger: "user.inactive",
      description: "Nudge inactive free-tier users to upgrade.",
      steps: [
        { stepOrder: 0, delayMinutes: 20160, subject: "Unlock premium features", templateName: "drip-upgrade-nudge" },
      ],
    },
    {
      name: "Re-engagement",
      trigger: "subscription.cancelled",
      description: "Win back users who cancelled their subscription.",
      steps: [
        { stepOrder: 0, delayMinutes: 0, subject: "We're sorry to see you go", templateName: "drip-reengagement" },
        { stepOrder: 1, delayMinutes: 10080, subject: "Here's what's new since you left", templateName: "drip-reengagement" },
      ],
    },
  ];

  for (const campaign of campaigns) {
    const { steps, ...campaignData } = campaign;

    const [inserted] = await db
      .insert(dripCampaigns)
      .values(campaignData)
      .returning();

    for (const step of steps) {
      await db.insert(dripSteps).values({
        campaignId: inserted.id,
        ...step,
      });
    }
  }
}

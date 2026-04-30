// @ts-nocheck
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/leads-sequence
 *
 * Runs daily via Vercel Cron (see vercel.json).
 * Walks the lead nurture sequence for every non-converted, non-unsubscribed lead.
 *
 * Sequence:
 *   Step 0 — lead magnet (sent immediately at capture, emailSentAt is set)
 *   Step 1 — Day 2  "What could you ship this weekend?"
 *   Step 2 — Day 5  "How developers ship in 4 days with LaunchKit"
 *   Step 3 — Day 9  FOMO / last chance (sequence complete after this)
 */

import { NextResponse } from "next/server";
import { db, leads } from "@launchkit/database";
import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import {
  sendEmail,
  LeadNurtureDay2,
  LeadNurtureDay5,
  LeadNurtureDay9,
} from "@launchkit/email";

const DISCOUNT_CODE = process.env.LEAD_DISCOUNT_CODE ?? "LAUNCH10";

// Only allow requests from Vercel's cron service or with the secret header
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // skip auth if no secret set
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let skipped = 0;

  try {
    // Fetch all active leads that have received the initial email (emailSentAt set)
    // and haven't completed the sequence (sequenceStep < 3) and haven't converted or unsubscribed
    const activeLeads = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.unsubscribed, false),
          isNotNull(leads.emailSentAt),
          lt(leads.sequenceStep, 3),
          sql`${leads.convertedAt} IS NULL`
        )
      );

    for (const lead of activeLeads) {
      const createdAt = new Date(lead.createdAt);
      const daysSinceSignup = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      let shouldSend = false;
      let emailTemplate: React.ReactElement | null = null;
      let subject = "";
      let nextStep = lead.sequenceStep;

      if (lead.sequenceStep === 0 && daysSinceSignup >= 2) {
        // Day 2 follow-up
        shouldSend = true;
        subject = "What could you ship by this Sunday?";
        emailTemplate = LeadNurtureDay2({ discountCode: DISCOUNT_CODE });
        nextStep = 1;
      } else if (lead.sequenceStep === 1 && daysSinceSignup >= 5) {
        // Day 5 social proof
        shouldSend = true;
        subject = "How developers ship in 4 days with LaunchKit";
        emailTemplate = LeadNurtureDay5({ discountCode: DISCOUNT_CODE });
        nextStep = 2;
      } else if (lead.sequenceStep === 2 && daysSinceSignup >= 9) {
        // Day 9 FOMO / final
        shouldSend = true;
        subject = "Last email — your 10% code expires soon";
        emailTemplate = LeadNurtureDay9({ discountCode: DISCOUNT_CODE });
        nextStep = 3;
      }

      if (shouldSend && emailTemplate) {
        try {
          const result = await sendEmail({
            to: lead.email,
            subject,
            react: emailTemplate,
          });

          if (!result.error) {
            await db
              .update(leads)
              .set({ sequenceStep: nextStep })
              .where(eq(leads.id, lead.id));
            sent++;
          } else {
            console.error(`[leads-sequence] Failed to send to ${lead.email}:`, result.error);
            skipped++;
          }
        } catch (err) {
          console.error(`[leads-sequence] Error sending to ${lead.email}:`, err);
          skipped++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      processed: activeLeads.length,
      sent,
      skipped,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[leads-sequence] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db, leads } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { sendEmail, LeadMagnetEmail } from "@launchkit/email";

const DISCOUNT_CODE = process.env.LEAD_DISCOUNT_CODE ?? "LAUNCH10";
const DISCOUNT_PERCENT = Number(process.env.LEAD_DISCOUNT_PERCENT ?? "10");
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Caleb King at LaunchKit <hello@getlaunchkit.app>";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source = "unknown", page, utm_source, utm_medium, utm_campaign } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Rate limit: check if already a lead
    const existing = await db
      .select({ id: leads.id, emailSentAt: leads.emailSentAt })
      .from(leads)
      .where(eq(leads.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0 && existing[0].emailSentAt) {
      // Already emailed — don't spam, just acknowledge
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    // Upsert lead
    await db
      .insert(leads)
      .values({
        email: email.toLowerCase().trim(),
        source,
        page: page ?? null,
        utmSource: utm_source ?? null,
        utmMedium: utm_medium ?? null,
        utmCampaign: utm_campaign ?? null,
      })
      .onConflictDoUpdate({
        target: leads.email,
        set: {
          source,
          page: page ?? null,
          utmSource: utm_source ?? null,
        },
      });

    // Send lead magnet email
    const emailResult = await sendEmail({
      to: email,
      subject: `Your ${DISCOUNT_PERCENT}% off code + what's inside LaunchKit`,
      react: LeadMagnetEmail({
        discountCode: DISCOUNT_CODE,
        discountPercent: DISCOUNT_PERCENT,
      }),
    });

    if (!emailResult.error) {
      // Mark email as sent
      await db
        .update(leads)
        .set({ emailSentAt: new Date() })
        .where(eq(leads.email, email.toLowerCase().trim()));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/leads]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

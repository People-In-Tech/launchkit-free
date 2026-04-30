// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { waitlistEntries } from "@launchkit/database";
import { eq, desc, sql, count } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, referredBy } = (await req.json()) as {
      email: string;
      referredBy?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    // Check for duplicate email
    const existing = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      const entry = existing[0];
      const referralLink = `${getBaseUrl()}/waitlist?ref=${entry.referralCode}`;
      return NextResponse.json({
        position: entry.position,
        referralCode: entry.referralCode,
        referralLink,
        message: "You are already on the waitlist!",
      });
    }

    // Get the next position
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(waitlistEntries);

    const position = totalCount + 1;
    const referralCode = crypto.randomUUID().slice(0, 8);

    // Validate referral code if provided
    let validReferredBy: string | null = null;
    if (referredBy) {
      const referrer = await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.referralCode, referredBy))
        .limit(1);

      if (referrer.length > 0) {
        validReferredBy = referredBy;
      }
    }

    const [entry] = await db
      .insert(waitlistEntries)
      .values({
        email: email.toLowerCase().trim(),
        referralCode,
        referredBy: validReferredBy,
        position,
      })
      .returning();

    const referralLink = `${getBaseUrl()}/waitlist?ref=${entry.referralCode}`;

    return NextResponse.json({
      position: entry.position,
      referralCode: entry.referralCode,
      referralLink,
    });
  } catch (error) {
    console.error("[WAITLIST_POST]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await db
      .select()
      .from(waitlistEntries)
      .orderBy(waitlistEntries.position);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[WAITLIST_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist entries." },
      { status: 500 },
    );
  }
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

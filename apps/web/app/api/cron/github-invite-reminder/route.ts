// @ts-nocheck
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";
import { purchases } from "@launchkit/database";
import { and, eq, isNull, lt } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { sendEmail, GitHubInviteReminderEmail } from "@launchkit/email";
import { absoluteUrl } from "@/lib/utils";

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find paid purchases where no GitHub username submitted AND purchase is 24h+ old AND reminder not sent yet
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingPurchases = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.status, "paid"),
        isNull(purchases.githubUsername),
        isNull(purchases.invitedAt),
        lt(purchases.createdAt, twentyFourHoursAgo)
      )
    );

  let sent = 0;
  const clerk = await clerkClient();

  for (const purchase of pendingPurchases) {
    try {
      const user = await clerk.users.getUser(purchase.userId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      await sendEmail({
        to: email,
        subject: "Don't forget — claim your LaunchKit repo access",
        react: GitHubInviteReminderEmail({
          firstName: user.firstName ?? "there",
          planName: purchase.plan === "team" ? "Teams" : "Solo",
          portalUrl: absoluteUrl("/portal"),
        }),
      });
      sent++;
    } catch (err) {
      console.error(`[github-invite-reminder] Failed for userId ${purchase.userId}:`, err);
    }
  }

  return NextResponse.json({ ok: true, processed: pendingPurchases.length, sent });
}

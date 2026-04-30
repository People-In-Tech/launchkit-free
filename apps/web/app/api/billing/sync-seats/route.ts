// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncSeats } from "@/lib/billing-sync";
import { db } from "@launchkit/database";
import { organizationMemberships } from "@launchkit/database";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/billing/sync-seats
 *
 * Triggers a manual seat sync for the caller's organisation.
 * Protected: caller must be an org admin or owner.
 */
export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only org admins / owners may trigger a manual sync
  const membership = await db.query.organizationMemberships.findFirst({
    where: and(
      eq(organizationMemberships.organizationId, orgId),
      eq(organizationMemberships.userId, userId)
    ),
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Forbidden: admin role required" },
      { status: 403 }
    );
  }

  try {
    await syncSeats(orgId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[billing/sync-seats] Error:", err);
    return NextResponse.json(
      { error: "Failed to sync seats" },
      { status: 500 }
    );
  }
}

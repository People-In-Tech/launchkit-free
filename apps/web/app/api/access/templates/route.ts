import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { purchases } from "@launchkit/database";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/access/templates
 * Returns { hasAccess: boolean } — true if the authenticated user has an
 * active (non-refunded) LaunchKit purchase.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ hasAccess: false });
    }

    const purchase = await db.query.purchases.findFirst({
      where: and(eq(purchases.userId, userId), eq(purchases.status, "paid")),
      columns: { id: true },
    });

    return Response.json({ hasAccess: !!purchase });
  } catch {
    return Response.json({ hasAccess: false });
  }
}

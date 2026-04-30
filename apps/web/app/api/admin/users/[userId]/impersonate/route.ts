// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { sessionClaims, userId: adminId } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin" || !adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  const clerk = await clerkClient();
  const actorToken = await clerk.actorTokens.createActorToken({
    userId,
    actor: { sub: adminId },
    expiresInSeconds: 3600,
  });

  return NextResponse.json({ token: actorToken.token, url: actorToken.url });
}

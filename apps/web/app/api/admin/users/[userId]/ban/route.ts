import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const clerk = await clerkClient();
  await clerk.users.banUser(userId);
  return NextResponse.json({ banned: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const clerk = await clerkClient();
  await clerk.users.unbanUser(userId);
  return NextResponse.json({ banned: false });
}

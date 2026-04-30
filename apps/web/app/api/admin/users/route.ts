import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const clerk = await clerkClient();
  const { data: users, totalCount } = await clerk.users.getUserList({
    query: query || undefined,
    limit,
    offset,
    orderBy: "-created_at",
  });

  const mapped = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: u.imageUrl,
    role: (u.publicMetadata as Record<string, unknown>)?.role ?? "member",
    banned: u.banned,
    createdAt: u.createdAt,
    lastSignInAt: u.lastSignInAt,
  }));

  return NextResponse.json({ users: mapped, totalCount });
}

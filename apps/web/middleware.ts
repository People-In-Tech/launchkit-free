import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
  "/pricing",
  "/build",
  "/blog(.*)",
  "/changelog(.*)",
  "/terms",
  "/privacy",
  "/docs(.*)",
  "/help(.*)",
  "/waitlist",
  "/s/(.*)",
  "/api/webhooks(.*)",
  "/api/pusher(.*)",
  "/api/leads",
  "/api/access/(.*)",
  "/api/unsubscribe(.*)",
  "/api/cron(.*)",
  "/feedback",
  "/api/feedback(.*)",
  "/prompts",
  "/prompts/(.*)",
  "/showcase",
  "/templates",
  "/templates/(.*)",
  "/teams",
  "/plugins",
  "/plugins/(.*)",
];

const isPublicRoute = createRouteMatcher([
  ...publicRoutes,
  ...publicRoutes.map(r => `/es${r === '/' ? '' : r}`),
  ...publicRoutes.map(r => `/fr${r === '/' ? '' : r}`),
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isTeamsOnly = process.env.NEXT_PUBLIC_TEAMS_ONLY === "true";

// Check if Clerk is configured — if not, skip auth entirely
const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

function handleRequest(req: NextRequest) {
  // Teams-only redirects
  if (isTeamsOnly) {
    const { pathname } = req.nextUrl;
    if (pathname === "/settings/personal" || pathname === "/settings/profile") {
      const url = req.nextUrl.clone();
      url.pathname = "/settings/team";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Clerk-wrapped middleware for when auth keys are configured
const clerkHandler = clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/auth/sign-in", req.url).toString(),
    });
  }

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "super_admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  return handleRequest(req);
});

export default function middleware(req: NextRequest) {
  if (isClerkConfigured) {
    return clerkHandler(req, {} as any);
  }
  // No Clerk credentials — serve all pages without auth
  return handleRequest(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm)).*)",
    "/(api|trpc)(.*)",
  ],
};

// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { onboardingProgress } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { getOnboardingStatus } from "@/lib/onboarding";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getOnboardingStatus(userId);
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentStep, completedSteps, stackChoices, projectDescription, aiRecommendations } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (currentStep !== undefined) updates.currentStep = currentStep;
  if (completedSteps !== undefined) updates.completedSteps = completedSteps;
  if (stackChoices !== undefined) updates.stackChoices = stackChoices;
  if (projectDescription !== undefined) updates.projectDescription = projectDescription;
  if (aiRecommendations !== undefined) updates.aiRecommendations = aiRecommendations;

  const [updated] = await db
    .update(onboardingProgress)
    .set(updates)
    .where(eq(onboardingProgress.userId, userId))
    .returning();

  return NextResponse.json(updated);
}

export async function PATCH() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [updated] = await db
    .update(onboardingProgress)
    .set({ completed: true, updatedAt: new Date() })
    .where(eq(onboardingProgress.userId, userId))
    .returning();

  return NextResponse.json(updated);
}

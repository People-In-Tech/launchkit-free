// @ts-nocheck
import { db } from "@launchkit/database";
import { onboardingProgress } from "@launchkit/database";
import { eq } from "drizzle-orm";

export const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome", description: "Tell us about your project" },
  { id: "stack", title: "Choose Stack", description: "Select your preferred technologies" },
  { id: "auth", title: "Set Up Auth", description: "Configure authentication provider" },
  { id: "database", title: "Connect Database", description: "Set up your database connection" },
  { id: "billing", title: "Add Billing", description: "Configure payment processing" },
  { id: "deploy", title: "Deploy", description: "Deploy your application" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["id"];

export async function getOnboardingStatus(userId: string) {
  const [existing] = await db
    .select()
    .from(onboardingProgress)
    .where(eq(onboardingProgress.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(onboardingProgress)
    .values({ userId })
    .returning();

  return created;
}

export function getSystemPrompt(progress: {
  projectDescription?: string | null;
  stackChoices?: Record<string, string> | null;
  currentStep?: number | null;
}) {
  const currentStepInfo = ONBOARDING_STEPS[progress.currentStep ?? 0];

  return `You are a helpful onboarding assistant for LaunchKit, a Next.js SaaS boilerplate.
You help new users set up their project step by step.

LaunchKit includes:
- Next.js 15 with App Router
- Drizzle ORM with Neon PostgreSQL
- Clerk authentication
- Stripe billing
- Tailwind CSS + shadcn/ui
- Turborepo monorepo structure
- AI integration support
- Email templates with React Email
- Background jobs

Current onboarding step: ${currentStepInfo?.title ?? "Welcome"} — ${currentStepInfo?.description ?? ""}
${progress.projectDescription ? `User's project description: ${progress.projectDescription}` : ""}
${progress.stackChoices && Object.keys(progress.stackChoices).length > 0 ? `User's stack choices: ${JSON.stringify(progress.stackChoices)}` : ""}

Be concise, friendly, and practical. Give specific advice based on the user's project and chosen stack.
If asked about stack recommendations, consider the user's project description to give tailored advice.`;
}

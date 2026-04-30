import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/lib/onboarding";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const progress = await getOnboardingStatus(userId);

  if (progress.completed) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <OnboardingWizard
        initialProgress={{
          currentStep: progress.currentStep,
          completedSteps: progress.completedSteps,
          stackChoices: progress.stackChoices,
          projectDescription: progress.projectDescription,
          aiRecommendations: progress.aiRecommendations,
        }}
      />
    </div>
  );
}

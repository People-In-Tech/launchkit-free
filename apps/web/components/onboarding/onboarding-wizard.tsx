"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/lib/onboarding";
import { OnboardingChat } from "./onboarding-chat";
import { WelcomeStep } from "./steps/welcome-step";
import { StackStep } from "./steps/stack-step";
import { AuthStep } from "./steps/auth-step";
import { DatabaseStep } from "./steps/database-step";
import { BillingStep } from "./steps/billing-step";
import { DeployStep } from "./steps/deploy-step";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface OnboardingWizardProps {
  initialProgress: {
    currentStep: number | null;
    completedSteps: string[] | null;
    stackChoices: Record<string, string> | null;
    projectDescription: string | null;
    aiRecommendations: Record<string, string> | null;
  };
}

export function OnboardingWizard({ initialProgress }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialProgress.currentStep ?? 0);
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    initialProgress.completedSteps ?? []
  );
  const [stackChoices, setStackChoices] = useState<Record<string, string>>(
    initialProgress.stackChoices ?? {}
  );
  const [projectDescription, setProjectDescription] = useState(
    initialProgress.projectDescription ?? ""
  );
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, string>>(
    initialProgress.aiRecommendations ?? {}
  );

  const saveProgress = useCallback(
    async (updates: Record<string, unknown>) => {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    []
  );

  const completeStep = useCallback(
    async (stepId: string) => {
      const updated = completedSteps.includes(stepId)
        ? completedSteps
        : [...completedSteps, stepId];
      setCompletedSteps(updated);
      await saveProgress({ completedSteps: updated });
    },
    [completedSteps, saveProgress]
  );

  const goToStep = useCallback(
    async (step: number) => {
      setCurrentStep(step);
      await saveProgress({ currentStep: step });
    },
    [saveProgress]
  );

  const handleNext = async () => {
    const stepId = ONBOARDING_STEPS[currentStep].id;
    await completeStep(stepId);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      await goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const stepId = ONBOARDING_STEPS[currentStep].id;
    await completeStep(stepId);
    await fetch("/api/onboarding", { method: "PATCH" });
    window.location.href = "/dashboard";
  };

  const stepComponents = [
    <WelcomeStep
      key="welcome"
      projectDescription={projectDescription}
      onSave={async (desc) => {
        setProjectDescription(desc);
        await saveProgress({ projectDescription: desc });
      }}
    />,
    <StackStep
      key="stack"
      stackChoices={stackChoices}
      aiRecommendations={aiRecommendations}
      onSave={async (choices) => {
        setStackChoices(choices);
        await saveProgress({ stackChoices: choices });
      }}
      onLoadRecommendations={async () => {
        if (!projectDescription) return;
        const res = await fetch("/api/onboarding/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectDescription }),
        });
        const recs = await res.json();
        setAiRecommendations(recs);
        await saveProgress({ aiRecommendations: recs });
      }}
    />,
    <AuthStep key="auth" stackChoices={stackChoices} />,
    <DatabaseStep key="database" stackChoices={stackChoices} />,
    <BillingStep key="billing" stackChoices={stackChoices} />,
    <DeployStep key="deploy" stackChoices={stackChoices} onComplete={handleComplete} />,
  ];

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStep;
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "h-2 w-full rounded-full transition-colors",
                    isCompleted
                      ? "bg-primary"
                      : isCurrent
                        ? "bg-primary/50"
                        : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step header */}
        <div>
          <h2 className="text-2xl font-bold">{ONBOARDING_STEPS[currentStep].title}</h2>
          <p className="text-muted-foreground">
            {ONBOARDING_STEPS[currentStep].description}
          </p>
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="p-6">{stepComponents[currentStep]}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {isLastStep ? (
            <Button onClick={handleComplete}>
              <Check className="mr-2 h-4 w-4" />
              Complete Setup
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* AI Chat Panel */}
      <div className="lg:col-span-1">
        <OnboardingChat currentStep={ONBOARDING_STEPS[currentStep].id} />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const STACK_OPTIONS = {
  database: {
    label: "Database",
    options: ["Neon", "Supabase", "PlanetScale"],
  },
  auth: {
    label: "Authentication",
    options: ["Clerk", "Supabase Auth", "NextAuth"],
  },
  payments: {
    label: "Payments",
    options: ["Stripe", "Lemon Squeezy"],
  },
  hosting: {
    label: "Hosting",
    options: ["Vercel", "Railway", "Docker self-hosted"],
  },
} as const;

interface StackStepProps {
  stackChoices: Record<string, string>;
  aiRecommendations: Record<string, string>;
  onSave: (choices: Record<string, string>) => Promise<void>;
  onLoadRecommendations: () => Promise<void>;
}

export function StackStep({
  stackChoices,
  aiRecommendations,
  onSave,
  onLoadRecommendations,
}: StackStepProps) {
  const [choices, setChoices] = useState<Record<string, string>>({
    database: stackChoices.database ?? "Neon",
    auth: stackChoices.auth ?? "Clerk",
    payments: stackChoices.payments ?? "Stripe",
    hosting: stackChoices.hosting ?? "Vercel",
    ...stackChoices,
  });
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (Object.keys(aiRecommendations).length === 0) {
      setLoadingRecs(true);
      onLoadRecommendations().finally(() => setLoadingRecs(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = async (category: string, value: string) => {
    const updated = { ...choices, [category]: value };
    setChoices(updated);
    await onSave(updated);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Stack</h3>
        <p className="text-muted-foreground">
          Select the technologies you want to use. We&apos;ll configure LaunchKit accordingly.
        </p>
        {loadingRecs && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Loading AI recommendations...
          </p>
        )}
      </div>

      {Object.entries(STACK_OPTIONS).map(([category, config]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-medium">{config.label}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {config.options.map((option) => {
              const isSelected = choices[category] === option;
              const isRecommended =
                aiRecommendations[category] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(category, option)}
                  className={cn(
                    "relative flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-secondary",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <span className="font-medium text-sm">{option}</span>
                  {isRecommended && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Recommended
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

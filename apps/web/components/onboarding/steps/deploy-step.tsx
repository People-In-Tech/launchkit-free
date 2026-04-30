"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Rocket, ExternalLink } from "lucide-react";

const ENV_VARS = [
  { key: "DATABASE_URL", required: true },
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", required: true },
  { key: "CLERK_SECRET_KEY", required: true },
  { key: "STRIPE_SECRET_KEY", required: false },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", required: false },
  { key: "STRIPE_WEBHOOK_SECRET", required: false },
  { key: "OPENAI_API_KEY", required: false },
];

const DEPLOY_OPTIONS: Record<string, { label: string; url: string; command: string }> = {
  Vercel: {
    label: "Deploy to Vercel",
    url: "https://vercel.com/new",
    command: "npx vercel --prod",
  },
  Railway: {
    label: "Deploy to Railway",
    url: "https://railway.app/new",
    command: "railway up",
  },
  "Docker self-hosted": {
    label: "Deploy with Docker",
    url: "",
    command: "docker compose up -d",
  },
};

interface DeployStepProps {
  stackChoices: Record<string, string>;
  onComplete: () => Promise<void>;
}

export function DeployStep({ stackChoices, onComplete }: DeployStepProps) {
  const provider = stackChoices.hosting ?? "Vercel";
  const config = DEPLOY_OPTIONS[provider] ?? DEPLOY_OPTIONS.Vercel;
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Deploy Your Application
        </h3>
        <p className="text-muted-foreground">
          You&apos;re almost done! Deploy your LaunchKit application.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Environment Variables Checklist</h4>
        <div className="space-y-2">
          {ENV_VARS.map((envVar) => (
            <div
              key={envVar.key}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-2">
                <code className="text-sm">{envVar.key}</code>
                {envVar.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Deploy with {provider}</h4>
        {config.url && (
          <a
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" className="gap-2">
              {config.label}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        )}
        <div className="rounded-md border p-4 bg-muted/50">
          <h4 className="font-medium text-sm mb-2">Deploy Command</h4>
          <code className="text-sm block bg-background p-2 rounded">
            {config.command}
          </code>
        </div>
      </div>

      <div className="border-t pt-6">
        <Button onClick={handleComplete} disabled={completing} size="lg" className="w-full">
          {completing ? (
            "Completing..."
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

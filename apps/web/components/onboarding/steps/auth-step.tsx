"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

const AUTH_CONFIGS: Record<string, { envVars: string[]; docsUrl: string; instructions: string[] }> = {
  Clerk: {
    envVars: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    docsUrl: "https://clerk.com/docs",
    instructions: [
      "Create a Clerk application at clerk.com",
      "Copy your publishable and secret keys",
      "Add them to your .env.local file",
      "Clerk middleware is already configured in LaunchKit",
    ],
  },
  "Supabase Auth": {
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    docsUrl: "https://supabase.com/docs/guides/auth",
    instructions: [
      "Create a Supabase project at supabase.com",
      "Go to Settings > API to find your keys",
      "Add the URL and keys to your .env.local file",
      "Update the auth middleware to use Supabase Auth",
    ],
  },
  NextAuth: {
    envVars: ["NEXTAUTH_SECRET", "NEXTAUTH_URL"],
    docsUrl: "https://next-auth.js.org/getting-started/introduction",
    instructions: [
      "Generate a secret: openssl rand -base64 32",
      "Set NEXTAUTH_URL to your app URL",
      "Configure providers in your auth options",
      "Add the NextAuth API route and session provider",
    ],
  },
};

interface AuthStepProps {
  stackChoices: Record<string, string>;
}

export function AuthStep({ stackChoices }: AuthStepProps) {
  const provider = stackChoices.auth ?? "Clerk";
  const config = AUTH_CONFIGS[provider] ?? AUTH_CONFIGS.Clerk;
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    // Simulate verification check
    await new Promise((r) => setTimeout(r, 1500));
    setVerified(true);
    setVerifying(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Set Up {provider}</h3>
        <p className="text-muted-foreground">
          Follow these steps to configure {provider} for your project.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Steps</h4>
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          {config.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Environment Variables</h4>
        <div className="space-y-2">
          {config.envVars.map((envVar) => (
            <div
              key={envVar}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <code className="text-sm">{envVar}</code>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleVerify} disabled={verifying || verified} variant="outline">
          {verifying ? "Verifying..." : verified ? "Verified" : "Verify Connection"}
        </Button>
        {verified && (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        )}
        <a
          href={config.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
        >
          Documentation
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

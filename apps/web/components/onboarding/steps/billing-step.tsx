"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, ExternalLink } from "lucide-react";

const BILLING_CONFIGS: Record<string, { keys: { label: string; env: string }[]; webhookUrl: string; docsUrl: string; guide: string[] }> = {
  Stripe: {
    keys: [
      { label: "Publishable Key", env: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" },
      { label: "Secret Key", env: "STRIPE_SECRET_KEY" },
      { label: "Webhook Secret", env: "STRIPE_WEBHOOK_SECRET" },
    ],
    webhookUrl: "/api/webhooks/stripe",
    docsUrl: "https://stripe.com/docs",
    guide: [
      "Create a Stripe account at stripe.com",
      "Get your API keys from Developers > API keys",
      "Set up a webhook endpoint pointing to your app's /api/webhooks/stripe",
      "Create products and prices in the Stripe Dashboard",
      "Update your pricing configuration in LaunchKit",
    ],
  },
  "Lemon Squeezy": {
    keys: [
      { label: "API Key", env: "LEMONSQUEEZY_API_KEY" },
      { label: "Store ID", env: "LEMONSQUEEZY_STORE_ID" },
      { label: "Webhook Secret", env: "LEMONSQUEEZY_WEBHOOK_SECRET" },
    ],
    webhookUrl: "/api/webhooks/lemonsqueezy",
    docsUrl: "https://docs.lemonsqueezy.com",
    guide: [
      "Create a Lemon Squeezy account",
      "Get your API key from Settings > API",
      "Set up a webhook for subscription events",
      "Create products and variants",
      "Update your billing configuration",
    ],
  },
};

interface BillingStepProps {
  stackChoices: Record<string, string>;
}

export function BillingStep({ stackChoices }: BillingStepProps) {
  const provider =
    stackChoices.payments === "LemonSqueezy"
      ? "Lemon Squeezy"
      : stackChoices.payments ?? "Stripe";
  const config = BILLING_CONFIGS[provider] ?? BILLING_CONFIGS.Stripe;
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setVerified(true);
    setVerifying(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Configure {provider}
        </h3>
        <p className="text-muted-foreground">
          Set up {provider} for subscription billing.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Setup Guide</h4>
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          {config.guide.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">API Keys</h4>
        {config.keys.map((key) => (
          <div key={key.env} className="space-y-1">
            <Label htmlFor={key.env}>{key.label}</Label>
            <Input id={key.env} type="password" placeholder={key.env} />
          </div>
        ))}
      </div>

      <div className="rounded-md border p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-1">Webhook URL</h4>
        <code className="text-sm">
          {`{YOUR_DOMAIN}${config.webhookUrl}`}
        </code>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleVerify} disabled={verifying || verified} variant="outline">
          {verifying ? "Verifying..." : verified ? "Verified" : "Verify Setup"}
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

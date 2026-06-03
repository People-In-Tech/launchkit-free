"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "@/lib/use-optional-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  plan?: "pro" | "team";
  label?: React.ReactNode;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}

/**
 * One-click checkout button.
 * - Signed in  → POST to /api/billing/checkout, redirect to Stripe immediately
 * - Signed out → redirect to sign-up with redirect_url pointing at checkout,
 *                so the user lands on Stripe right after creating an account
 */
export function CheckoutButton({
  plan = "pro",
  label,
  size = "lg",
  variant,
  className,
}: CheckoutButtonProps) {
  const { isSignedIn, isLoaded } = useOptionalAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isLoaded) return;

    // Not signed in — send to sign-up then straight to Stripe after
    if (!isSignedIn) {
      const redirectUrl = encodeURIComponent(`/api/billing/checkout?plan=${plan}`);
      router.push(`/auth/sign-up?redirect_url=${redirectUrl}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(className)}
      onClick={handleClick}
      disabled={!isLoaded || loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
}

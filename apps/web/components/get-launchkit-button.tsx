"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface GetLaunchKitButtonProps extends ButtonProps {
  plan?: "pro" | "team";
  onBeforeStart?: () => void;
}

export function GetLaunchKitButton({
  plan = "pro",
  onBeforeStart,
  onClick,
  children,
  ...props
}: GetLaunchKitButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!isLoaded) return;

    onBeforeStart?.();

    if (!isSignedIn) {
      router.push(
        `/auth/sign-up?redirect_url=${encodeURIComponent(`/pricing?auto=${plan}`)}`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      router.push("/pricing?checkout_error=1");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button {...props} onClick={handleClick} disabled={props.disabled || loading}>
      {children}
    </Button>
  );
}

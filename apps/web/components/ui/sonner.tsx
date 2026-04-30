"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

/**
 * Sonner Toaster component — theme-aware.
 * Already included in the root layout via <Toaster /> from @/components/ui/toaster.
 * This file exists as a canonical re-export for shadcn/ui convention.
 */
export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      position="bottom-right"
      richColors
    />
  );
}

/**
 * Re-export toast from sonner directly.
 * Import in any client component:
 *   import { toast } from "@/components/ui/sonner";
 */
export { toast } from "sonner";

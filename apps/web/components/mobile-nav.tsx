"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Menu, X, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetLaunchKitButton } from "@/components/get-launchkit-button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/teams", label: "Teams" },
  { href: "/plugins", label: "Plugins" },
  { href: "/prompts", label: "Prompts" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-12 w-12 rounded-md hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-8 w-8" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel — flex column so CTAs stay pinned at bottom */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex flex-col w-[280px] bg-background border-l shadow-2xl md:hidden",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "16px" }}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <Logo size={28} />
            <span className="font-bold text-base">
              Launch<span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Kit</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links — flex-1 so it fills the remaining space */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
          ))}
        </nav>

        {/* CTAs — at the bottom, in natural flow */}
        <div
          className="flex flex-col gap-2 p-4 border-t bg-background"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full" size="sm">
              Sign In
            </Button>
          </Link>
          <GetLaunchKitButton
            plan="pro"
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 border-0"
            size="sm"
            onBeforeStart={() => setOpen(false)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Get LaunchKit — $149
          </GetLaunchKitButton>
        </div>
      </div>
    </>
  );
}

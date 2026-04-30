import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { MobileNav } from "@/components/mobile-nav";
import { GetLaunchKitButton } from "@/components/get-launchkit-button";
import { LanguageSwitcher } from "@/components/language-switcher";

// Keep this list in sync with MobileNav.navLinks — single source of truth
// would be nicer, but MobileNav is a client component with its own state so
// we duplicate the labels here deliberately (they're stable marketing copy).
const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/teams", label: "Teams" },
  { href: "/plugins", label: "Plugins" },
  { href: "/prompts", label: "Prompts" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
];

type SiteHeaderProps = {
  /** Show the amber urgency banner above the header. Homepage only. */
  showUrgencyBanner?: boolean;
  /** Show the "v1.0" version pill next to the logo. Homepage only. */
  showVersionBadge?: boolean;
};

export function SiteHeader({
  showUrgencyBanner = false,
  showVersionBadge = false,
}: SiteHeaderProps = {}) {
  return (
    <>
      {showUrgencyBanner && (
        <div className="bg-primary text-primary-foreground text-center py-2.5 px-4 text-xs sm:text-sm font-medium">
          ⚡ Launch pricing — $149 one-time (price increases after first 100 sales){" · "}
          <GetLaunchKitButton
            className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity p-0 h-auto bg-transparent hover:bg-transparent text-current hover:text-current"
          >
            Claim yours
          </GetLaunchKitButton>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Logo size={32} />
            <span className="font-bold text-lg tracking-tight">
              Launch
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Kit
              </span>
            </span>
            {showVersionBadge && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 leading-none">
                v1.0
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm whitespace-nowrap">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <span className="hidden md:flex"><LanguageSwitcher /></span>
            <Link href="/auth/sign-in" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Sign In
              </Button>
            </Link>
            <GetLaunchKitButton
              plan="pro"
              size="sm"
              className="hidden md:inline-flex gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 border-0 shadow-lg shadow-indigo-500/20"
            >
              Get LaunchKit
            </GetLaunchKitButton>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}

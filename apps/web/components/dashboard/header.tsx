import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileDashboardNav } from "./mobile-nav";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — hidden on md+ */}
        <MobileDashboardNav />
        <h2 className="text-base sm:text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/portal"
          className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Portal
        </Link>
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

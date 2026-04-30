"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  MessageSquare,
  BarChart3,
  Sparkles,
  FileText,
  ImageIcon,
  Bot,
  BookOpen,
  Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", href: "/dashboard/ai", icon: Sparkles },
  { label: "AI Images", href: "/dashboard/images", icon: ImageIcon },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Prompt Library", href: "/dashboard/prompts", icon: BookOpen },
  { label: "AI Usage", href: "/dashboard/team/ai-usage", icon: Activity },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
];

const settingsItems = [
  { label: "General", href: "/settings/general", icon: Settings },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Team", href: "/settings/team", icon: Users },
  { label: "Profile", href: "/settings/profile", icon: MessageSquare },
];

export function MobileDashboardNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger trigger — md:hidden */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel from left */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r shadow-2xl md:hidden",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-bold text-lg"
          >
            <Logo size={26} />
            LaunchKit
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="mb-1 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </p>
            <div className="space-y-0.5">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

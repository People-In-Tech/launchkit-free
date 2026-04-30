"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Logo } from "@/components/shared/logo";
import {
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Logo size={28} />
          LaunchKit
        </Link>
      </div>

      <div className="px-3 py-4">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger: "w-full justify-between border rounded-md px-3 py-2",
            },
          }}
        />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Main
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        <div className="mb-2 mt-6 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Settings
        </div>
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

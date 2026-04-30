"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, Blocks, Box, Receipt } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/portal", icon: LayoutDashboard },
  { name: "Products", href: "/portal/products", icon: Package },
  { name: "Plugins", href: "/portal/plugins", icon: Blocks },
  { name: "Components", href: "/portal/components", icon: Box },
  { name: "Settings", href: "/portal/settings", icon: Receipt },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-md font-medium text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

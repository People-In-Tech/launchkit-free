import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Users, Building, BarChart3, Sparkles, DollarSign, Flag, FileText, Globe, Search, Share2, Mail } from "lucide-react";

const adminNav = [
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Organizations", href: "/admin/organizations", icon: Building },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI Usage", href: "/admin/ai-usage", icon: Sparkles },
  { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  { label: "Regions", href: "/admin/regions", icon: Globe },
  { label: "SEO Pages", href: "/admin/seo", icon: Search },
  { label: "Referrals", href: "/admin/referrals", icon: Share2 },
  { label: "Campaigns", href: "/admin/campaigns", icon: Mail },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-background p-4">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

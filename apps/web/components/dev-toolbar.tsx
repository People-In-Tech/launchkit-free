"use client";

/**
 * Dev Toolbar — floating overlay only visible in development.
 * Shows: current user, feature flags, quick-nav shortcuts, MCP info.
 * Renders as a small pill in the corner; expands on click.
 *
 * Add to root layout: <DevToolbar /> (only renders in development).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, X, ChevronDown, ChevronUp, Database, Users, Flag,
  Settings, Terminal, BarChart3, Code2, Copy, Check,
  ExternalLink, Layers, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface DevSection {
  label: string;
  icon: React.ElementType;
  items: { label: string; href?: string; action?: () => void; code?: string }[];
}

const SHORTCUTS: DevSection[] = [
  {
    label: "Quick Nav",
    icon: Layers,
    items: [
      { label: "Admin Dashboard", href: "/admin" },
      { label: "Admin Users", href: "/admin/users" },
      { label: "Admin Revenue", href: "/admin/revenue" },
      { label: "Admin Feature Flags", href: "/admin/feature-flags" },
      { label: "Admin Analytics", href: "/admin/analytics" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },

    ],
  },
  {
    label: "APIs",
    icon: Code2,
    items: [
      { label: "GET /api/ai/chat  (model list)", href: "/api/ai/chat" },
      { label: "GET /api/health", href: "/api/health" },
      { label: "GET /api/webhooks/stripe", href: "/api/webhooks/stripe" },
    ],
  },
  {
    label: "MCP Tools",
    icon: Cpu,
    items: [
      { label: "query_db(sql)", code: 'use_mcp_tool("launchkit", "query_db", {"sql": "SELECT * FROM users LIMIT 5"})' },
      { label: "list_users()", code: 'use_mcp_tool("launchkit", "list_users", {"limit": 10})' },
      { label: "toggle_flag(name, enabled)", code: 'use_mcp_tool("launchkit", "toggle_flag", {"name": "my-flag", "enabled": true})' },
      { label: "send_email(to, subject, body)", code: 'use_mcp_tool("launchkit", "send_email", {"to": "test@example.com", "subject": "Test", "body": "Hello"})' },
    ],
  },
  {
    label: "pnpm scripts",
    icon: Terminal,
    items: [
      { label: "pnpm dev", code: "pnpm dev" },
      { label: "pnpm db:push", code: "pnpm db:push" },
      { label: "pnpm db:studio", code: "pnpm db:studio" },
      { label: "pnpm build", code: "pnpm build" },
      { label: "pnpm lint", code: "pnpm lint" },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-auto flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function DevToolbar() {
  // Don't render in production. Checked before any hooks so the component
  // is cheap and the production bundle can tree-shake Clerk usage below.
  if (process.env.NODE_ENV !== "development") return null;

  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return hasClerk ? <DevToolbarWithClerk /> : <DevToolbarBody user={null} />;
}

function DevToolbarWithClerk() {
  const { user } = useUser();
  return <DevToolbarBody user={user ?? null} />;
}

type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;

function DevToolbarBody({ user }: { user: ClerkUser | null }) {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Quick Nav"]));

  function toggleSection(label: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  return (
    <>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full px-3 py-2",
          "bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono font-semibold",
          "shadow-xl hover:border-indigo-500/60 transition-all",
          open && "border-indigo-500/60",
        )}
      >
        <Zap className={cn("h-3.5 w-3.5", open ? "text-indigo-400" : "text-zinc-400")} />
        DEV
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="fixed bottom-16 right-5 z-[9998] w-80 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-sans font-semibold text-zinc-100 text-sm">Dev Toolbar</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current user */}
          {user && (
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <img src={user.imageUrl} alt="" className="h-6 w-6 rounded-full" />
              <div>
                <div className="text-zinc-200 font-sans text-[11px] font-medium">{user.fullName}</div>
                <div className="text-zinc-500 text-[10px]">{user.primaryEmailAddress?.emailAddress}</div>
              </div>
              <span className="ml-auto rounded-full bg-indigo-500/20 text-indigo-400 px-2 py-0.5 text-[10px] font-semibold">
                {user.organizationMemberships?.[0]?.role ?? "user"}
              </span>
            </div>
          )}

          {/* Sections */}
          <div className="max-h-[420px] overflow-y-auto">
            {SHORTCUTS.map((section) => {
              const expanded = expandedSections.has(section.label);
              return (
                <div key={section.label} className="border-b border-zinc-800/60 last:border-0">
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                  >
                    <section.icon className="h-3 w-3" />
                    <span className="font-sans font-medium text-[11px]">{section.label}</span>
                    {expanded
                      ? <ChevronUp className="h-3 w-3 ml-auto" />
                      : <ChevronDown className="h-3 w-3 ml-auto" />
                    }
                  </button>

                  {expanded && (
                    <div className="pb-1">
                      {section.items.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 px-4 py-1.5 hover:bg-zinc-900/40 group">
                          {item.href ? (
                            <Link
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              className="text-zinc-400 hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 flex-1"
                            >
                              {item.label}
                              <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-zinc-500 truncate flex-1">{item.label}</span>
                          )}
                          {item.code && <CopyButton text={item.code} />}
                          {item.href && <CopyButton text={item.href} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-600 text-[10px] font-sans">Only visible in development</span>
            <span className="text-zinc-500 text-[10px]">LaunchKit</span>
          </div>
        </div>
      )}
    </>
  );
}

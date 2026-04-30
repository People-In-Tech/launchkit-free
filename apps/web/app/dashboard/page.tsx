import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ImageIcon,
  Bot,
  BookOpen,
  Activity,
  FileText,
  ArrowRight,
  Zap,
  Server,
  Rocket,
} from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  {
    title: "AI Chat",
    description: "Stream multi-provider chat (OpenAI, Anthropic, Google, 8+).",
    href: "/dashboard/ai",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Image Generation",
    description: "DALL·E 3, Stable Diffusion, Flux — one API, every provider.",
    href: "/dashboard/images",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "AI Agents",
    description: "Tool-calling agents with web search, code analysis, and RAG.",
    href: "/dashboard/agents",
    icon: Bot,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Prompt Library",
    description: "Share and version prompts across your team.",
    href: "/dashboard/prompts",
    icon: BookOpen,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "AI Usage",
    description: "Token + cost analytics broken down by model and feature.",
    href: "/dashboard/team/ai-usage",
    icon: Activity,
    color: "from-sky-500 to-cyan-500",
  },
  {
    title: "Documents",
    description: "Upload docs into pgvector for RAG-powered answers.",
    href: "/dashboard/documents",
    icon: FileText,
    color: "from-violet-500 to-fuchsia-500",
  },
] as const;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Hero */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Zap className="h-3 w-3" />
          Reference workspace
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your workspace.</h1>
        <p className="text-muted-foreground max-w-2xl">
          A working demo of every LaunchKit module — AI chat, agents, RAG, prompts, and
          team usage. Use it to explore what you can ship with your copy, then build on
          top of the same patterns.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="space-y-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.color} text-white shadow-sm`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center gap-1">
                    {f.title}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {f.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quickstart strip */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" />
              MCP Server
            </CardTitle>
            <CardDescription>
              Connect Claude Code or Cursor to query your DB, list users, toggle feature
              flags, and send emails — from inside your AI agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md border bg-muted px-3 py-2 text-xs overflow-x-auto">
              <code>.mcp.json → launchkit (8 tools)</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-primary" />
              Start a new project
            </CardTitle>
            <CardDescription>
              Scaffold a fresh LaunchKit project with the CLI. Pick your stack in 60
              seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="rounded-md border bg-muted px-3 py-2 text-xs overflow-x-auto">
              <code>pnpm create launchkit@latest my-app</code>
            </pre>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/portal">
                Manage your license <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

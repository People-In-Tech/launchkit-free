import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const posts: Record<string, { title: string; date: string; readTime: string; tag: string; content: string[] }> = {
  "ship-saas-with-claude-code": {
    title: "How to ship a SaaS in a weekend with Claude Code + LaunchKit",
    date: "April 1, 2026",
    readTime: "8 min read",
    tag: "Tutorial",
    content: [
      "Shipping a production SaaS used to take weeks of boilerplate — auth, billing, teams, admin panels, email templates. With LaunchKit and an AI coding agent like Claude Code, you can compress that into a single weekend.",
      "The key insight is that LaunchKit comes with a CLAUDE.md file and an MCP server that teaches your AI agent the entire codebase structure. Instead of hand-holding your agent through every file, it already knows where auth lives, how billing is wired, and what patterns to follow when adding a new feature.",
      "Here's the workflow: clone LaunchKit, point Claude Code at it, and start describing features in plain English. Need a new API endpoint? Claude Code reads the existing routes, matches the pattern, and scaffolds it. Need a new settings page? It follows the same layout conventions automatically.",
      "The result is a fully-featured SaaS — auth with Clerk, billing with Stripe, team management, admin dashboard, email with Resend, background jobs with Trigger.dev — all deployed on Vercel with a Neon database. What used to be two weeks of setup is now two days of building the parts that actually make your product unique.",
    ],
  },
  "mcp-server-explained": {
    title: "What is an MCP Server and why does your SaaS boilerplate need one?",
    date: "March 20, 2026",
    readTime: "6 min read",
    tag: "Deep Dive",
    content: [
      "Model Context Protocol (MCP) is a standard that lets AI coding agents connect to external tools and data sources. Think of it as a USB port for your AI — plug in an MCP server and your agent gains new capabilities.",
      "LaunchKit ships with a built-in MCP server that exposes 20+ tools to your coding agent. These tools let the agent query your database schema, inspect your auth configuration, check billing status, and understand the full project structure — all without you manually copy-pasting context.",
      "Why does this matter? Traditional boilerplates give you code, but they don't give your AI agent any way to understand that code. You end up spending half your time explaining the architecture. With an MCP server, the agent can explore the project on its own.",
      "The practical impact is significant: Claude Code with LaunchKit's MCP server can add a complete new feature — database migration, API route, UI component, tests — in a single session, because it has full context about how every piece fits together.",
    ],
  },
  "configurable-stack-design": {
    title: "Why we made LaunchKit's stack fully configurable",
    date: "March 10, 2026",
    readTime: "5 min read",
    tag: "Product",
    content: [
      "Most SaaS boilerplates force you into a specific stack. Postgres or nothing. Clerk or roll your own. Stripe or bust. We think that's the wrong approach.",
      "LaunchKit lets you choose your database (Neon, Supabase, or Firebase), your auth provider (Clerk, NextAuth, or Firebase Auth), and your payment processor (Stripe or Lemon Squeezy). Everything is swappable from the CLI at project creation time.",
      "Under the hood, this works through adapter patterns. Each integration — billing, auth, database — has a clean interface. The Stripe adapter and the Lemon Squeezy adapter implement the same contract. Swapping one for the other doesn't touch your application code.",
      "The benefit isn't just choice — it's future-proofing. When a new payment processor gains traction, we add an adapter. When a new auth provider launches, we add an adapter. Your application code stays the same. That's the power of designing for configurability from day one.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.content[0],
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Organization", name: "LaunchKit" },
    publisher: { "@type": "Organization", name: "LaunchKit" },
    description: post.content[0],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7">
              <rect x="2" y="2" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
              <path d="M9 19V12l5-5 5 5v7" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            LaunchKit
          </Link>
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> All Posts
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
              {post.tag}
            </span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-muted-foreground mb-6">
              {paragraph}
            </p>
          ))}
        </article>

        <div className="mt-12 pt-8 border-t">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <span>&copy; 2026 LaunchKit. All rights reserved.</span>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

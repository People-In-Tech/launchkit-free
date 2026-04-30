import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog | LaunchKit",
  description: "Tutorials, tips, and updates for SaaS builders using LaunchKit.",
};

const posts = [
  {
    slug: "ship-saas-with-claude-code",
    title: "How to ship a SaaS in a weekend with Claude Code + LaunchKit",
    excerpt: "A step-by-step walkthrough of building and deploying a production SaaS using AI-assisted development.",
    date: "April 1, 2026",
    readTime: "8 min read",
    tag: "Tutorial",
  },
  {
    slug: "mcp-server-explained",
    title: "What is an MCP Server and why does your SaaS boilerplate need one?",
    excerpt: "Model Context Protocol unlocks a new level of AI-assisted development. Here's how LaunchKit's built-in MCP server works.",
    date: "March 20, 2026",
    readTime: "6 min read",
    tag: "Deep Dive",
  },
  {
    slug: "configurable-stack-design",
    title: "Why we made LaunchKit's stack fully configurable",
    excerpt: "Neon vs Supabase. Clerk vs NextAuth. Why forcing a single stack is the wrong call, and how we solved it.",
    date: "March 10, 2026",
    readTime: "5 min read",
    tag: "Product",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7">
              <rect x="2" y="2" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" />
              <path d="M9 19V12l5-5 5 5v7" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            LaunchKit
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-muted-foreground">
            Tutorials, deep dives, and product updates for AI-first SaaS builders.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="group rounded-xl border bg-card p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                  {post.tag}
                </span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
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

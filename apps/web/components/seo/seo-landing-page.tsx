import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SeoLandingPageProps {
  title: string;
  description: string;
  body: string;
  slug: string;
  structuredData?: Record<string, unknown>;
}

export function SeoLandingPage({
  title,
  description,
  body,
  slug,
  structuredData,
}: SeoLandingPageProps) {
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="container mx-auto max-w-4xl px-4 pt-6">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{title}</span>
          </nav>
        </div>

        {/* Header */}
        <header className="container mx-auto max-w-4xl px-4 py-12">
          <Badge variant="secondary" className="mb-4">
            LaunchKit
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {description}
          </p>
        </header>

        {/* Body content */}
        <main className="container mx-auto max-w-4xl px-4 pb-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </main>

        {/* CTA */}
        <section className="border-t bg-muted/50">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Build Your SaaS?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              LaunchKit gives you everything you need to build, launch, and scale
              your SaaS product. Authentication, billing, AI, and more — all
              pre-configured.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Get Started with LaunchKit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

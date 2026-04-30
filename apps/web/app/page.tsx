import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Your SaaS MVP is ready.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          This is a boilerplate marketing page. To generate your actual marketing site, run <code>npx create-launchkit@latest</code> and follow the AI prompts!
        </p>
        <div className="flex items-center gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

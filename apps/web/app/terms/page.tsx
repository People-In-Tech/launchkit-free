import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | LaunchKit",
  description: "Terms of Service for LaunchKit — the production-ready SaaS boilerplate.",
};

export default function TermsPage() {
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
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 28, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">1. Agreement to Terms</h2>
            <p>
              By purchasing or using LaunchKit (&quot;the Product&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). LaunchKit is a product of People In Tech LLC (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). If you do not agree to these Terms, do not purchase or use the Product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">2. License Grant</h2>
            <p>
              Upon purchase, we grant you a non-exclusive, non-transferable license to use the LaunchKit source code under the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Solo License:</strong> One individual developer may use the Product to create unlimited end-products for personal or commercial use.</li>
              <li><strong>Team License:</strong> Up to five (5) developers within the same organization may use the Product to create unlimited end-products.</li>
              <li>You may modify, adapt, and build upon the source code for your own projects or client projects.</li>
              <li>You may deploy the Product to any number of production environments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">3. Restrictions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may <strong>not</strong> redistribute, resell, sublicense, or share the LaunchKit source code, in whole or in part, as a standalone product or boilerplate/starter kit.</li>
              <li>You may <strong>not</strong> create derivative boilerplate products that compete directly with LaunchKit.</li>
              <li>You may <strong>not</strong> share your license credentials or repository access with individuals outside your licensed team.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">4. Payment Terms</h2>
            <p>
              Payments are processed securely by Stripe or Lemon Squeezy. Prices are listed in USD and are tax inclusive.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">5. Refund Policy</h2>
            <p>
              Due to the non-returnable nature of the private digital repository and source-code access, all sales are final. We do not offer refunds once access is granted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">6. Updates and Support</h2>
            <p>
              Your purchase includes lifetime access to the private repository and all future updates. Email support is available at{" "}
              <a href="mailto:hello@peopleintech.io" className="text-primary hover:underline">hello@peopleintech.io</a>.
              We aim to respond within 48 business hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">7. Intellectual Property</h2>
            <p>
              LaunchKit, including all code, documentation, and design, is owned by People In Tech LLC and is protected by intellectual property laws. Your license grants usage rights only — ownership of the Product remains with People In Tech LLC. End-products you build using LaunchKit are entirely yours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">8. Limitation of Liability</h2>
            <p>
              The Product is provided &quot;as is&quot; without warranty of any kind, express or implied. In no event shall People In Tech LLC or its creators be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from the use or inability to use the Product. People In Tech LLC&apos;s total liability shall not exceed the amount paid for the Product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Arizona, United States, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts of Maricopa County, Arizona.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">10. Contact</h2>
            <p>
              People In Tech LLC |{" "}
              <a href="mailto:hello@peopleintech.io" className="text-primary hover:underline">hello@peopleintech.io</a>{" "}
              |{" "}
              <a href="https://getlaunchkit.app" className="text-primary hover:underline">https://getlaunchkit.app</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} People In Tech LLC. All rights reserved.</span>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

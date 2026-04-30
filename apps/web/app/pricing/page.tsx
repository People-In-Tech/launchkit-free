import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for our SaaS.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />

      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Simple, transparent pricing.
          </h1>
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Run the AI marketing generator from the create-launchkit CLI to build your custom pricing table.
          </p>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  );
}

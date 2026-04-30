import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LaunchKit",
  description: "Privacy Policy for LaunchKit — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 28, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">1. Introduction</h2>
            <p>
              People In Tech LLC (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates LaunchKit (getlaunchkit.app) and is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you purchase or use our Product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-medium text-foreground mt-4 mb-2">Information you provide:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> Name, email address, and profile details when you create an account.</li>
              <li><strong>Payment information:</strong> Payment details are processed securely by Stripe. We do not store credit card numbers on our servers.</li>
              <li><strong>Communications:</strong> Messages you send to us via email or our support channels.</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-4 mb-2">Information collected automatically:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage data:</strong> Pages visited, features used, and interactions with the Product, collected via PostHog analytics.</li>
              <li><strong>Device information:</strong> Browser type, operating system, and device identifiers.</li>
              <li><strong>Log data:</strong> IP address, access times, and referring URLs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Product delivery:</strong> To process your purchase, grant repository access, and deliver the Product.</li>
              <li><strong>Support:</strong> To respond to your questions and provide technical assistance.</li>
              <li><strong>Improvements:</strong> To analyze usage patterns and improve the Product.</li>
              <li><strong>Marketing:</strong> To send product updates, new features, and promotional content. You can opt out at any time by clicking &quot;unsubscribe&quot; in any email.</li>
              <li><strong>Legal compliance:</strong> To comply with applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate LaunchKit:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Stripe</strong> — Payment processing. Stripe&apos;s privacy policy: <a href="https://stripe.com/privacy" className="text-primary hover:underline">stripe.com/privacy</a></li>
              <li><strong>Clerk</strong> — Authentication and user management. Clerk&apos;s privacy policy: <a href="https://clerk.com/privacy" className="text-primary hover:underline">clerk.com/privacy</a></li>
              <li><strong>PostHog</strong> — Product analytics. PostHog&apos;s privacy policy: <a href="https://posthog.com/privacy" className="text-primary hover:underline">posthog.com/privacy</a></li>
              <li><strong>Resend</strong> — Transactional email delivery.</li>
              <li><strong>Vercel</strong> — Hosting and deployment.</li>
              <li><strong>GitHub</strong> — Repository access delivery for purchased licenses.</li>
            </ul>
            <p className="mt-3">
              These services may collect data as described in their respective privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">5. Data Retention</h2>
            <p>
              We retain personal data as long as your account is active. To request deletion of your personal data, contact us at{" "}
              <a href="mailto:hello@peopleintech.io" className="text-primary hover:underline">hello@peopleintech.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption in transit (TLS) and at rest. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">7. Your Rights</h2>

            <h3 className="text-base font-medium text-foreground mt-4 mb-2">For all users:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-4 mb-2">GDPR (EU/EEA residents):</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-4 mb-2">CCPA (California residents):</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to request deletion of personal information</li>
              <li>Right to opt out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>

            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:hello@peopleintech.io" className="text-primary hover:underline">hello@peopleintech.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              LaunchKit is not intended for users under 13. We do not knowingly collect personal data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">9. Changes to This Policy</h2>
            <p>
              We will notify you of material changes via email. Changes will also be posted on this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">10. Contact</h2>
            <p>
              People In Tech LLC |{" "}
              <a href="mailto:hello@peopleintech.io" className="text-primary hover:underline">hello@peopleintech.io</a>
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

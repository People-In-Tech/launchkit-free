import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-background pt-16 pb-8 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-12">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <Logo size={28} />
              <span className="font-bold text-xl tracking-tight">
                Launch
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Kit
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-2">
              The modern SaaS starter kit built specifically for AI-first
              developers. Stop rebuilding infrastructure and start shipping
              your actual product.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2 mb-6">A product of People In Tech LLC</p>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/plugins" className="hover:text-primary transition-colors">Plugins</Link></li>
              <li><Link href="/#ai-first" className="hover:text-primary transition-colors">For AI coders</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/prompts" className="hover:text-primary transition-colors">Free Prompts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><a href="mailto:hello@peopleintech.io" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} People In Tech LLC. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-80">Built with LaunchKit, obviously.</span>
            <Sparkles className="h-3 w-3 text-indigo-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}

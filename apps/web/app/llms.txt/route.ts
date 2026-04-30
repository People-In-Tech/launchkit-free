const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getlaunchkit.app";

const content = `# LaunchKit

> The modern SaaS starter kit built for AI-first developers.

LaunchKit is a production-ready Next.js boilerplate for building SaaS applications. It includes authentication (Clerk), billing (Stripe/Lemon Squeezy), teams, AI integration, SuperAdmin/Admin, email, background jobs, and more.

## Pricing

- Free: $0 — Open-source template on GitHub
- Solo: $149 one-time — Full private repo access with lifetime updates
- Teams: $299 one-time — Up to 5 developer seats

## Key Features

- Authentication via Clerk (email, social, MFA, SSO)
- Billing with Stripe or Lemon Squeezy (subscriptions, per-seat, usage-based)
- Multi-tenant teams with role-based access
- AI integration with OpenAI, Anthropic, and Google (credit system included)
- SuperAdmin/Admin dashboard with analytics, user management, feature flags, audit logs
- Email templates with Resend + React Email (drip campaigns included)
- Background jobs with Trigger.dev
- Realtime with Pusher
- Storage with S3 or Supabase
- Programmatic SEO with admin tools
- Plugin system (feedback, waitlist, testimonials, help center, changelog)
- MCP Server for AI-assisted development
- CLI scaffolding tool (create-launchkit)
- Full E2E test suite with Playwright
- i18n with next-intl (English, Spanish, French)
- Dark mode with next-themes

## Tech Stack

Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Neon Postgres, Clerk, Stripe, Resend, Trigger.dev, Vercel

## Links

- Homepage: ${BASE_URL}/
- Pricing: ${BASE_URL}/pricing
- Documentation: https://docs.getlaunchkit.app
- Blog: ${BASE_URL}/blog
- Changelog: ${BASE_URL}/changelog
- Feedback: ${BASE_URL}/feedback
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

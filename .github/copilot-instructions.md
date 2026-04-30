# LaunchKit — GitHub Copilot Instructions

## Project Overview

LaunchKit is a production-ready SaaS starter kit built as a Turborepo monorepo. The stack is **Next.js 15** (App Router), **Neon or Supabase** (Postgres), **Clerk** (auth), **Drizzle ORM**, **Stripe** (billing — Apple Pay + Google Pay), and **React Email** + **Resend** (transactional email).

## Architecture

```
apps/
  web/          → Next.js 15 App Router application (main product)
  docs/         → Fumadocs documentation site (31 MDX pages)
packages/
  database/     → Drizzle ORM schemas, migrations, queries (Neon Postgres)
  config/       → Shared plan definitions and app configuration
  email/        → React Email templates + Resend integration
  mcp-server/   → MCP server with 20+ tools for AI agent integration
  create-launchkit/ → CLI scaffolding tool (npx create-launchkit)
  tsconfig/     → Shared TypeScript configurations
```

## Key Conventions

### TypeScript
- Strict mode enabled throughout
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer named exports over default exports
- Use `satisfies` for type narrowing where applicable

### Next.js Patterns
- App Router with file-based routing (`app/` directory)
- Server Components by default; add `'use client'` only when needed
- Server Actions for mutations (no API routes for form submissions)
- Use `force-dynamic` for auth-protected pages
- ClerkProvider wraps the app conditionally (checks for CLERK_PUBLISHABLE_KEY)

### Database (Drizzle + Neon)
- Schema files in `packages/database/src/schema/`
- 8 tables: users, organizations, memberships, subscriptions, invoices, documents, api_keys, audit_logs
- Use the lazy-init pattern: `getDb()` instead of a top-level `db` export
- Drizzle queries use the builder pattern: `db.select().from(table).where(...)`

### Billing
- Abstract billing via `createBilling('stripe' | 'lemon')` factory
- Supports per-seat billing, metered usage, and webhook handlers
- Plan definitions in `packages/config/src/plans.ts`

### Imports
- Use `@launchkit/` prefix for package imports (e.g., `@launchkit/database`, `@launchkit/billing`)
- Use `@/` for app-internal imports within `apps/web/`
- Never use relative imports to cross package boundaries

### Styling
- Tailwind CSS + shadcn/ui components
- CSS variables for theming (dark/light mode)
- Component-level styling with Tailwind utility classes

### Error Handling
- Wrap async operations in try/catch
- Use Next.js error boundaries (`error.tsx`) for page-level errors
- Return typed error responses from Server Actions

## File Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| `app/(auth)/` | Auth pages | Sign-in, sign-up, SSO callbacks |
| `app/(dashboard)/` | Protected pages | Main app dashboard, settings, billing |
| `app/(marketing)/` | Public pages | Landing, pricing, blog |
| `app/api/webhooks/` | Webhook handlers | Stripe, Clerk webhooks |
| `packages/*/src/` | Package source | Each package has `src/index.ts` entry point |

## Testing
- Playwright for E2E tests (162 tests in `tooling/e2e/`)
- Test files follow `*.spec.ts` naming convention
- Tests cover auth flows, billing, dashboard, and API endpoints

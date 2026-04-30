# LaunchKit — Warp AI Context

> This file provides project context for Warp's AI features (Agent Mode, AI Command Search, etc.).

---

## What is LaunchKit?

LaunchKit is a production-ready **Next.js 15 SaaS boilerplate** sold as a one-time purchase ($149 Solo / $299 Teams).
It ships with auth, billing, AI chat, teams, file uploads, email, and 8 drop-in plugins — all pre-wired.

- **Live product**: https://getlaunchkit.app
- **Free starter**: https://github.com/CalebKing3/launchkit
- **Pro repo**: https://github.com/People-In-Tech/launchkit-pro (buyers only)
- **Docs**: https://docs.getlaunchkit.app
- **Business**: People In Tech LLC — hello@peopleintech.io

---

## Stack

```
Next.js 15 (App Router)     — Framework, Server Components, Server Actions
TypeScript (strict)          — No any, no type assertions without justification
Neon or Supabase            — Postgres database (user picks at setup)
Drizzle ORM                  — Type-safe queries, schema-first
Clerk                        — Auth, multi-tenant orgs, webhooks
Stripe                       — Billing (one-time purchase + subscriptions)
                               Apple Pay, Google Pay, Link via Checkout
Vercel AI SDK               — Streaming AI, 11 providers
React Email + Resend         — Transactional emails
Tailwind CSS + shadcn/ui    — UI components
Turborepo + pnpm             — Monorepo
```

---

## Repo Structure

```
launchkit/
├── apps/web/                   ← Main Next.js 15 app
│   ├── app/
│   │   ├── api/                ← API routes (always auth-check)
│   │   ├── dashboard/          ← Protected app pages
│   │   ├── portal/             ← Post-purchase GitHub access delivery
│   │   ├── demo/               ← Public dashboard mockup
│   │   └── prompts/            ← Free AI prompt library
│   ├── components/
│   │   ├── ui/                 ← shadcn/ui primitives
│   │   ├── ai/                 ← Chat, image gen, agents
│   │   └── dashboard/          ← Sidebar, header
│   ├── lib/
│   │   ├── ai.ts               ← AI factory: getModel(modelId)
│   │   ├── github.ts           ← GitHub invite automation
│   │   └── entitlement.ts      ← Purchase verification
│   └── middleware.ts           ← Clerk auth + public routes
│
├── packages/
│   ├── database/               ← Drizzle ORM + Neon schema
│   ├── email/                  ← React Email templates
│   ├── storage/                ← Multi-provider storage
│   ├── create-launchkit/       ← CLI: npx create-launchkit@latest
│   └── mcp-server/             ← MCP server for AI agent tooling
│
├── CLAUDE.md                   ← Claude Code context
├── ANTIGRAVITY.md              ← Antigravity IDE context
├── AGENTS.md                   ← Codex CLI / Amp context
├── .cursorrules                ← Cursor IDE rules
├── .windsurfrules              ← Windsurf IDE rules
├── .clinerules                 ← Cline extension rules
├── WARP.md                     ← You are here
└── launchkit.config.ts         ← Project-level stack config
```

---

## Key Commands

```bash
# Start development
pnpm dev

# Database
pnpm db:push        # Push schema changes (no migration file)
pnpm db:generate    # Generate migration file
pnpm db:migrate     # Run pending migrations
pnpm db:studio      # Open Drizzle Studio UI

# Type checking
pnpm typecheck

# Scaffold a CRUD module
node scripts/scaffold.mjs <module-name>

# Deploy to Vercel
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel deploy --prod --token $VERCEL_TOKEN --yes

# CLI (for buyers configuring their stack)
npx create-launchkit@latest --auth=clerk --payments=stripe --db=neon
```

---

## Critical DOs and DON'Ts

### DO
- Add `// @ts-nocheck` to every file importing `@launchkit/database` (Drizzle dual-instance type issue)
- Use `getModel(modelId)` from `lib/ai.ts` for all AI calls — never instantiate providers directly
- Default to Server Components — add `"use client"` only when strictly needed
- Add new public pages to `publicRoutes[]` in `middleware.ts`

### DON'T
- Import `@launchkit/database` in client components (it will try to bundle the DB driver)
- Add back Lemon Squeezy, Trigger.dev, NextAuth, or Firebase — these were removed
- Create API routes that skip `auth()` from Clerk for protected resources
- Mix ESM and CJS across packages — all packages use ESM

---

## Environment Variables (quick ref)

```bash
DATABASE_URL=                        # Neon connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://getlaunchkit.app
LAUNCHKIT_GITHUB_TOKEN=              # PAT for GitHub repo access delivery
LAUNCHKIT_PRIVATE_REPO_SLUG=People-In-Tech/launchkit-pro
```

# LaunchKit — Warp Terminal Context

> This directory contains Warp Drive workflows and project context for the LaunchKit codebase.
> Use `warp-drive` to sync these with your team.

---

## Project Overview

LaunchKit is a Next.js 15 SaaS boilerplate with Clerk auth, Stripe billing, Neon Postgres, and AI.
**Live**: https://getlaunchkit.app · **Stack**: Next.js 15 · Clerk · Stripe · Neon · Drizzle · Resend

---

## Quick Reference

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev          # → http://localhost:3000

# Database operations
pnpm db:push      # Push schema changes to Neon
pnpm db:studio    # Open Drizzle Studio GUI

# Type checking & lint
pnpm typecheck
pnpm lint

# Build
npx turbo build --filter=@launchkit/web

# Scaffold a new CRUD module
node scripts/scaffold.mjs <module-name>
# Example: node scripts/scaffold.mjs invoices
# Creates: schema, API route, dashboard page, Table, Form, PageClient

# Deploy
git add -A && git commit -m "feat: ..."
git push origin main
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel deploy --prod --token $VERCEL_TOKEN --yes
```

---

## Key Directories

| Path | Purpose |
|---|---|
| `apps/web/app/` | Next.js App Router pages |
| `apps/web/app/api/` | API routes (ai, webhooks, upload) |
| `apps/web/app/dashboard/` | Authenticated dashboard |
| `apps/web/components/` | React components |
| `apps/web/lib/ai.ts` | Multi-provider AI factory |
| `packages/database/src/schema/` | Drizzle table definitions |
| `packages/email/src/templates/` | React Email templates |
| `scripts/scaffold.mjs` | CRUD module generator |

---

## Warp Drive Workflows

See `.warp/workflows/` for shareable team workflows:

- `dev-setup.yaml` — First-time environment setup
- `db-push.yaml` — Push schema changes and verify
- `deploy.yaml` — Build and deploy to Vercel
- `scaffold.yaml` — Generate a new CRUD module

---

## Environment Setup

```bash
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
#          DATABASE_URL, STRIPE_SECRET_KEY, RESEND_API_KEY, OPENAI_API_KEY
pnpm db:push
pnpm dev
```

---

## AI Context for Warp AI

When using Warp AI in this project, key context to know:
- **Primary branch**: `main` (never `master`)
- **Package manager**: `pnpm` (never `npm` or `yarn`)
- **DB migrations**: Drizzle push, not migrate (`pnpm db:push`)
- **All packages**: ESM only — no CommonJS
- **Client components**: Only at leaf level — default to Server Components
- **Auth check**: Every API route must call `const { userId } = await auth()` from Clerk

---

See `CLAUDE.md` at the repo root for full architecture documentation.

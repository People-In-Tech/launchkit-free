# LaunchKit — Antigravity Project Context

> This file is automatically read by Antigravity (Google's AI coding assistant) to understand your project.
> Keep it updated as your codebase evolves.

---

## Project Overview

LaunchKit is a production-ready Next.js 15 + Neon + Clerk SaaS boilerplate sold at $149 (Solo) / $299 (Teams).
It ships with auth, billing, AI chat, teams, file uploads, email, and 8 drop-in plugins out of the box.

**Live URL**: https://getlaunchkit.app
**Docs**: https://docs.getlaunchkit.app
**Stack**: Next.js 15 (App Router) · TypeScript · Neon (Postgres/pgvector) · Drizzle ORM · Clerk · Stripe · Resend · Tailwind CSS · shadcn/ui · Vercel AI SDK

---

## Monorepo Structure

```
launchkit/
├── apps/
│   ├── web/                          # Main Next.js 15 app (App Router)
│   │   ├── app/
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── ai/               # AI: chat, image gen, embed, rag, agent
│   │   │   │   ├── webhooks/         # Stripe webhooks
│   │   │   │   ├── upload/           # File upload (signed URLs)
│   │   │   │   └── leads/            # Lead capture
│   │   │   ├── auth/                 # Clerk sign-in, sign-up, org pages
│   │   │   ├── dashboard/            # Authenticated app
│   │   │   │   ├── page.tsx          # Overview
│   │   │   │   ├── ai/               # AI chat
│   │   │   │   ├── images/           # AI image generation
│   │   │   │   ├── agents/           # Agent builder
│   │   │   │   ├── team/             # Team management
│   │   │   │   ├── billing/          # Subscription management
│   │   │   │   └── settings/         # User settings
│   │   │   ├── pricing/              # Pricing page
│   │   │   ├── demo/                 # Live dashboard demo (public)
│   │   │   ├── prompts/              # Free AI prompt library (public)
│   │   │   └── portal/               # Post-purchase: GitHub access delivery
│   │   ├── components/
│   │   │   ├── ai/                   # Chat, image-generator, agent-chat
│   │   │   ├── dashboard/            # Sidebar, header, nav
│   │   │   ├── plugins/              # Feedback, testimonials, roadmap, waitlist
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── StackConfigurator.tsx # Interactive CLI stack picker
│   │   │   ├── mobile-nav.tsx        # Hamburger mobile nav
│   │   │   └── terminal-demo.tsx     # Animated CLI hero demo
│   │   ├── lib/
│   │   │   ├── ai.ts                 # 11-provider AI factory (OpenAI, Anthropic, Google, etc.)
│   │   │   ├── rag.ts                # RAG pipeline helper
│   │   │   ├── github.ts             # GitHub invite automation
│   │   │   └── entitlement.ts        # Purchase verification
│   │   └── middleware.ts             # Clerk auth + public route config
├── packages/
│   ├── database/                     # Drizzle ORM + Neon
│   │   └── src/schema/               # All table definitions
│   ├── email/                        # Resend email templates (React Email)
│   ├── storage/                      # Multi-provider storage
│   ├── config/                       # Shared types and stack config
│   ├── plugins/                      # Plugin registry + manifests
│   ├── rag/                          # RAG: pgvector embed + search pipeline
│   ├── agents/                       # AI Agent framework (tool-calling + memory)
│   ├── mcp-server/                   # MCP server for Claude Code integration
│   └── create-launchkit/             # CLI tool (npx create-launchkit@latest)
├── docs/                             # Mintlify documentation
├── CLAUDE.md                         # Rules for Claude Code
├── ANTIGRAVITY.md                    # ← You are here (rules for Antigravity)
├── .cursorrules                      # Rules for Cursor IDE
├── launchkit.config.ts               # Project-level config
└── turbo.json
```

---

## Key Patterns

### Database (Drizzle + Neon)

```typescript
// Always add // @ts-nocheck to files that use Drizzle ORM in app code
import { db } from "@launchkit/database";
import { users } from "@launchkit/database/schema/users";

// Query
const rows = await db.select().from(users).where(eq(users.id, id));

// Insert
const [row] = await db.insert(users).values({ ... }).returning();
```

### API Routes (App Router)

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```

### AI Provider Factory

```typescript
// Use the factory — never instantiate providers directly
import { getModel } from "@/lib/ai";

const model = getModel("gpt-5.4-mini");
const model = getModel("claude-sonnet-4-6");
const model = getModel("gemini-2.0-flash");
// 11 providers — see /stack page for full list
```

### Vercel AI SDK (Streaming)

```typescript
import { streamText } from "ai";
import { getModel } from "@/lib/ai";

const result = streamText({
  model: getModel("gpt-5.4-mini"),
  messages,
});
return result.toDataStreamResponse();
```

### Email (React Email + Resend)

```typescript
import { sendEmail } from "@launchkit/email";
import { PurchaseConfirmationEmail } from "@launchkit/email";

await sendEmail({
  to: email,
  subject: "Your purchase is confirmed",
  react: PurchaseConfirmationEmail({ firstName, plan }),
});
```

---

## Environment Variables

```bash
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=                        # Neon Postgres (with pgvector)

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SOLO_PRICE_ID=
STRIPE_TEAMS_PRICE_ID=

# Email
RESEND_API_KEY=
EMAIL_FROM=                          # LaunchKit <hello@getlaunchkit.app>

# AI Providers
OPENAI_API_KEY=                      # Required for default model + embeddings
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
PERPLEXITY_API_KEY=

# Storage
STORAGE_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=

# GitHub access delivery
LAUNCHKIT_GITHUB_TOKEN=              # PAT with repo:invite scope
LAUNCHKIT_PRIVATE_REPO_SLUG=People-In-Tech/launchkit-pro

# App
NEXT_PUBLIC_APP_URL=https://getlaunchkit.app
```

---

## Critical Rules

### DO ✅
- Add `// @ts-nocheck` to files that import from `@launchkit/database` (Drizzle dual-instance type conflict)
- Default to **Server Components** — only add `"use client"` when using hooks or browser APIs
- Use `@launchkit/database` imports, never raw `drizzle-orm` in app code
- Use `getModel(modelId)` from `lib/ai.ts` for every AI call
- Add new public routes to the `publicRoutes` array in `middleware.ts`
- Use `packages/email/src/templates/` for all transactional emails
- Store files via `@launchkit/storage`, never raw `fs` or S3 SDK in the app

### DON'T ❌
- Import `@launchkit/database` in client components (bundles the DB driver to the browser)
- Create API routes without authenticating via `auth()` from Clerk
- Skip error handling in client-side `fetch()` calls
- Add env vars without also adding to `.env.example`
- Mix ESM and CJS in packages (all packages use ESM)

---

## Common Tasks

### Add a database table
1. Create `packages/database/src/schema/<name>.ts`
2. Export from `packages/database/src/schema/index.ts`
3. Run `pnpm db:push`

### Add a dashboard page
1. Create `apps/web/app/dashboard/<name>/page.tsx`
2. Add link to sidebar: `apps/web/components/dashboard/sidebar.tsx`

### Add an email template
1. Create `packages/email/src/templates/<name>.tsx`
2. Export from `packages/email/src/index.ts`
3. Import via `import { MyEmail } from "@launchkit/email"`

### Add an AI provider
1. Add to `apps/web/lib/ai.ts` factory switch
2. Add model IDs to `packages/config/src/stack.ts`
3. Add env var to `.env.example` and Vercel dashboard

### Scaffold a CRUD module
```bash
node scripts/scaffold.mjs <module-name>
# Creates: schema, API route, dashboard page, Table + Form components
```

### Deploy
```bash
git add -A && git commit -m "feat: ..."
git push origin main
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel deploy --prod --token $VERCEL_TOKEN --yes
```

---

## Gemini / Google AI Integration

LaunchKit has built-in support for Google Generative AI and Vertex AI:

```typescript
// In lib/ai.ts — Google Gemini models are pre-wired
const model = getModel("gemini-2.0-flash");
const model = getModel("gemini-2.5-pro");

// Vertex AI (enterprise)
process.env.GOOGLE_VERTEX_PROJECT = "your-gcp-project";
const model = getModel("vertex-gemini-pro");
```

When adding Google AI features:
- Use `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini API direct access
- Use `GOOGLE_VERTEX_PROJECT` for Vertex AI
- Both are supported out-of-the-box in `lib/ai.ts`

---

## Antigravity-Specific Notes

When Antigravity edits this codebase:
1. **Run `pnpm typecheck` after changes** — catches type errors fast
2. **Check middleware.ts** before adding new routes — wrong config causes auth redirect loops
3. **Use the scaffold script** instead of manually creating CRUD files
4. **Server Components first** — only `"use client"` at leaf nodes
5. **One database instance** — always use `db` from `@launchkit/database`, never create a new Drizzle instance

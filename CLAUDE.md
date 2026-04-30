# LaunchKit — Claude Code Project Context

> This file is automatically read by Claude Code to understand your project.
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
│   │   │   ├── (marketing)/          # Public pages (page.tsx, pricing, etc.)
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
│   │   │   │   ├── prompts/          # Team prompt library
│   │   │   │   ├── team/             # Team management + AI usage
│   │   │   │   ├── billing/          # Subscription management
│   │   │   │   └── settings/         # User settings
│   │   │   ├── pricing/              # Pricing page
│   │   │   ├── stack/                # Tech stack page
│   │   │   ├── blog/                 # MDX blog
│   │   │   ├── changelog/            # MDX changelog
│   │   │   └── docs/                 # MDX docs
│   │   ├── components/
│   │   │   ├── ai/                   # Chat, image-generator, agent-chat
│   │   │   ├── dashboard/            # Sidebar, header, nav
│   │   │   ├── plugins/              # Feedback, testimonials, roadmap, waitlist
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── mobile-nav.tsx        # Hamburger mobile nav
│   │   │   ├── dev-toolbar.tsx       # Dev overlay (dev-only)
│   │   │   └── terminal-demo.tsx     # Animated CLI hero demo
│   │   ├── lib/
│   │   │   ├── ai.ts                 # 11-provider AI factory (OpenAI, Anthropic, Google, etc.)
│   │   │   ├── rag.ts                # RAG pipeline helper
│   │   │   └── agents.ts             # Agent framework helpers
│   │   └── middleware.ts             # Clerk auth + public route config
│   └── docs/                         # Fumadocs documentation site
├── packages/
│   ├── database/                     # Drizzle ORM + Neon
│   │   └── src/schema/               # All table definitions
│   ├── email/                        # Resend email templates (React Email)
│   ├── storage/                      # Multi-provider storage (Vercel Blob, S3, GCS, Azure, Supabase)
│   ├── config/                       # Shared types and stack config
│   ├── plugins/                      # Plugin registry + manifests
│   ├── rag/                          # RAG: pgvector embed + search pipeline
│   ├── agents/                       # AI Agent framework (tool-calling + memory)
│   └── mcp-server/                   # MCP server for Claude Code tool integration
├── scripts/
│   └── scaffold.mjs                  # CRUD module generator
├── CLAUDE.md                         # ← You are here
├── launchkit.config.ts               # Project-level config (AI provider, storage, etc.)
└── turbo.json
```

---

## Key Patterns

### Database (Drizzle + Neon)

```typescript
// Always add // @ts-nocheck to files that use dual-instance Drizzle
// Import from the package, never directly from drizzle-orm in app code
import { db } from "@launchkit/database";
import { users } from "@launchkit/database/schema/users";

// Query pattern
const rows = await db.select().from(users).where(eq(users.id, id));

// Insert pattern
const [row] = await db.insert(users).values({ ... }).returning();
```

### API Routes (Next.js App Router)

```typescript
// Always check auth first
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```

### AI Provider Factory

```typescript
// Use the factory from lib/ai.ts — never instantiate providers directly
import { getModel } from "@/lib/ai";

const model = getModel("gpt-5.4-mini");    // default
const model = getModel("claude-sonnet-4-6");
const model = getModel("gemini-3.1-flash");
// 11 providers available — see /stack for full list
```

### RAG Usage

```typescript
import { embedAndStore, searchSimilar } from "@launchkit/rag";

// Store a document
await embedAndStore({ id: "doc-1", content: "...", metadata: { source: "readme" } });

// Retrieve relevant context
const docs = await searchSimilar("How do I add auth?", { k: 5 });
```

### Agent Usage

```typescript
import { createAgent } from "@launchkit/agents";

const agent = createAgent({
  tools: ["search", "db", "code"],
  memory: true,  // uses pgvector for memory
});

const stream = await agent.stream("Scaffold a products module");
```

### Scaffold CLI

```bash
# Generate a full CRUD module (schema + API + page + components)
node scripts/scaffold.mjs <module-name>

# Example
node scripts/scaffold.mjs invoices
# Creates: schema, API route, dashboard page, Table, Form, PageClient
```

---

## Environment Variables

```bash
# Core
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=                        # Neon connection string (with pgvector)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=

# AI Providers
OPENAI_API_KEY=                      # Required for default model + embeddings
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
PERPLEXITY_API_KEY=
XAI_API_KEY=
DEEPSEEK_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=

# Cloud AI
AWS_ACCESS_KEY_ID=                   # Bedrock
GOOGLE_VERTEX_PROJECT=               # Vertex AI
AZURE_OPENAI_API_KEY=                # Azure OpenAI

# Storage
STORAGE_PROVIDER=vercel-blob         # vercel-blob | s3 | gcs | azure-blob | supabase
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://getlaunchkit.app
LAUNCHKIT_GITHUB_TOKEN=
LAUNCHKIT_PRIVATE_REPO_SLUG=People-In-Tech/launchkit-pro
```

---

## Custom Slash Commands

These are available in Claude Code via `/project:command-name`:

| Command | Description |
|---|---|
| `/project:scaffold` | Scaffold a CRUD module |
| `/project:db-push` | Push database schema to Neon |
| `/project:db-studio` | Open Drizzle Studio |
| `/project:new-plugin` | Create a new plugin |
| `/project:new-email` | Create a React Email template |
| `/project:add-provider` | Add a new AI provider |
| `/project:run-ci` | Run type check + lint locally |

---

## Critical DOs and DON'Ts

### DO ✅
- Add `// @ts-nocheck` to files with Drizzle ORM imports in app code (dual-instance type conflict)
- Use `@launchkit/database` package import, never raw `drizzle-orm` in app code
- Put client components at the leaf level — default to Server Components
- Use `getModel(modelId)` from `lib/ai.ts` for all AI calls
- Add new routes to the `publicRoutes` array in `middleware.ts` if they should be unauthenticated
- Use `packages/email/src/templates/` for all transactional emails
- Store files via `@launchkit/storage` — never `fs` or direct S3 SDK in the app

### DON'T ❌
- Import `@launchkit/database` in client components (it will bundle the DB driver)
- Create new API routes without checking auth via `auth()` from Clerk
- Use `fetch()` without error handling in client components
- Add new environment variables without adding them to `.env.example`
- Bypass middleware for protected routes — use `publicRoutes` to allowlist instead
- Mix ESM and CJS in packages (all packages use ESM)

---

## Common Tasks

### Add a new database table
1. Create `packages/database/src/schema/<name>.ts`
2. Export it from `packages/database/src/schema/index.ts`
3. Run `pnpm db:push` to apply migrations

### Add a new dashboard page
1. Create `apps/web/app/dashboard/<name>/page.tsx`
2. Add to sidebar: `apps/web/components/dashboard/sidebar.tsx`
3. Add route to public/private config if needed

### Add a new AI provider
1. Add provider to `apps/web/lib/ai.ts` factory
2. Add model IDs to `packages/config/src/stack.ts`
3. Add env var to `.env.example` and Vercel
4. Update `/stack` page display

### Deploy
```bash
pnpm install --no-frozen-lockfile
npx turbo build --filter=@launchkit/web --force
git add -A && git commit -m "feat: ..."
git push origin main
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel deploy --prod --token $VERCEL_TOKEN --yes
```

---

## Agent Instructions for Claude Code

When helping with this codebase:
1. **Always run `pnpm typecheck` after changes** — type errors surface quickly
2. **Never modify `apps/web/middleware.ts` without reviewing publicRoutes** — wrong config causes 404 loops
3. **Use the scaffold CLI** instead of manually creating CRUD files
4. **Check `apps/web/lib/ai.ts` before adding any AI call** — the factory handles provider routing
5. **Prefer Server Components** — only add `"use client"` when you need hooks or browser APIs

---

## AI IDE Rules — Supported Agents

This repo ships pre-configured context files for every major AI coding agent:

| IDE / Agent | Rules File | Notes |
|---|---|---|
| **Claude Code** | `CLAUDE.md` | You are here |
| **Cursor** | `.cursorrules` | 300-line detailed rules |
| **Windsurf** | `.windsurfrules` | Cascade-compatible rules |
| **Cline / Roo** | `.clinerules` | VSCode extension rules |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Workspace-level instructions |
| **Codex / o3** | `AGENTS.md` | OpenAI Codex + Devin-compatible |
| **Antigravity (Google)** | `.gemini/context.md` | Google Gemini Code Assist rules |
| **Warp** | `.warp/README.md` | Warp Drive workflows & context |

All files share the same core architecture overview, patterns, and DOs/DON'Ts. Update them together when patterns change.

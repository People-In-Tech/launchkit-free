# LaunchKit — Agent Instructions
# For: Codex, Claude Code, Cursor, Windsurf, Gemini/Antigravity, Warp, Cline, Devin, and all AI coding agents
# Version: Milestone 3 (AI-First)

## Rules Files by IDE

| IDE / Agent | File |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |
| Cline / Roo | `.clinerules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex / o3 / Devin | `AGENTS.md` (this file) |
| Antigravity / Gemini Code Assist | `.gemini/context.md` |
| Warp | `.warp/README.md` |

> All files share the same core patterns. See `CLAUDE.md` for the canonical full reference.

## Project Overview

LaunchKit is a production-ready SaaS starter kit built on:
- **Next.js 15** (App Router, RSC, Server Actions)
- **Neon Postgres** (serverless) + **Drizzle ORM**
- **Clerk** (authentication, organizations, webhooks)
- **Stripe** (billing — one-time purchase, Apple Pay + Google Pay via Checkout)
- **Vercel AI SDK** (multi-model AI: OpenAI, Anthropic, Google)
- **React Email + Resend** (transactional email)
- **Turborepo** (monorepo, task caching)

---

## Architecture Decision Records (ADRs)

### ADR-001: Turborepo Monorepo
All packages share a single repo. `apps/web` is the main Next.js app. `packages/` contains shared libraries consumed via `workspace:*` in package.json.

### ADR-002: Clerk for Auth
Clerk is the auth provider. All user and org data is synced from Clerk webhooks. Server-side auth uses `auth()` from `@clerk/nextjs/server`. Client-side uses `useUser()` / `useOrganization()`. Never implement custom auth.

### ADR-003: Drizzle ORM + Neon
Drizzle ORM with the Neon HTTP driver. Schema is defined in `packages/database/src/schema/`. The database client is lazy-initialized with a Proxy to support serverless cold starts without `DATABASE_URL`.

### ADR-004: Billing (Stripe Only)
Stripe is the only billing provider. Checkout supports Apple Pay, Google Pay, and Stripe Link out of the box. Price IDs for Solo ($149) and Teams ($299) one-time purchases are stored in environment variables.

### ADR-005: Credit System
AI usage is gated by a credit balance system (not raw token metering). Users start with 100 free credits. Plans grant 5,000–25,000 credits/month. All AI operations deduct credits via `deductCredits()` from `@/lib/credits`.

### ADR-006: Lazy Initialization
All external service clients (OpenAI, Stripe, Neon) are initialized lazily (on first use) to support serverless cold starts and allow builds to succeed without real credentials.

### ADR-007: pgvector for RAG
Document embeddings are stored in the `documents` table. The `embedding` column is currently `text` (JSON-encoded float array) for compatibility. Once pgvector is enabled on Neon, it can be migrated to the native `vector(1536)` type for hardware-accelerated similarity search.

### ADR-008: Server Components First
Next.js 15 Server Components are the default. `"use client"` is added only when interactivity is strictly required (hooks, browser APIs, event handlers that cannot be replaced by Server Actions).

### ADR-009: MCP Server
An MCP (Model Context Protocol) server lives at `packages/mcp-server/`. This gives AI coding assistants (Claude Code, Cursor) direct access to project schemas, component lists, API patterns, and scaffolding tools.

---

## How to Add a New Feature (Step-by-Step)

### 1. Database schema (if needed)
```bash
# Create schema file
cat > packages/database/src/schema/my-feature.ts << 'EOF'
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const myFeatures = pgTable("my_features", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
EOF

# Export from schema index
echo 'export * from "./my-feature";' >> packages/database/src/schema/index.ts

# Generate + run migration
pnpm db:generate
pnpm db:migrate
```

### 2. API route
Create `apps/web/app/api/[feature]/route.ts` following the API route pattern. Always:
- Check auth first
- Validate input with Zod
- Wrap business logic in try/catch
- Return typed JSON responses

### 3. Page
Create `apps/web/app/dashboard/[feature]/page.tsx`. Always:
- Export `metadata` object
- Check auth and redirect if not logged in
- Use Server Components unless interactivity is needed

### 4. Component (if needed)
Create `apps/web/components/[domain]/[name].tsx`. Always:
- Define a TypeScript props interface
- Accept and merge `className` via `cn()`
- Use named export (not default)

---

## How to Add a New AI Model

1. **Add to the models map** in `apps/web/app/api/ai/chat/route.ts`:
```typescript
"my-new-model": () => openai("my-model-id"), // or anthropic(), google()
```

2. **Add SDK import** at the top of the file if it's a new provider:
```typescript
import { myProvider } from "@ai-sdk/my-provider";
```

3. **Install the SDK** in `apps/web/`:
```bash
pnpm --filter @launchkit/web add @ai-sdk/my-provider
```

4. **Add to the model list** in `apps/web/components/ai/chat.tsx`:
```typescript
{ id: "my-new-model", name: "My Model", provider: "MyProvider" }
```

5. **Update MCP server** in `packages/mcp-server/src/index.ts` in the `ai_show_models` tool.

6. **Add env var** if needed to `.env.example` with a description comment.

---

## How to Add a New Billing Plan

1. **Add to plans array** in `packages/config/src/plans.ts`:
```typescript
{
  id: "enterprise",
  name: "Enterprise",
  description: "...",
  features: [...],
  limits: { seats: 100, aiCreditsPerMonth: 100000, projects: -1 },
  pricing: {
    monthly: 299,
    yearly: 2990,
    yearlyDiscountPercent: 17,
    stripePriceId: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? "",
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID ?? "",
    },

  },
  usageMeters: [...],
  addOns: [],
}
```

2. **Create Stripe products** in the Stripe dashboard and copy the price IDs.

3. **Add env vars** to `.env.example` and `.env.local`.

4. **Update the webhook handler** if the new plan has different seat/meter logic.

---

---

## How to Add a New Email Template

1. **Create template** in `packages/email/src/templates/my-template.tsx` using React Email components.

2. **Export from `packages/email/src/index.ts`**:
```typescript
export * from "./templates/my-template";
```

3. **Send it**:
```typescript
import { sendEmail, MyTemplate } from "@launchkit/email";
await sendEmail({ to: email, subject: "...", react: <MyTemplate {...props} /> });
```

---

## Migration Guides

### Migrate embedding column to pgvector
1. Enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector;` on Neon
2. Update `packages/database/src/schema/documents.ts`:
   - Change `text("embedding")` to `vector("embedding", { dimensions: 1536 })`
   - Add HNSW index: `index().using("hnsw", table.embedding.op("vector_cosine_ops"))`
3. Run `pnpm db:generate && pnpm db:migrate`
4. Update `apps/web/lib/rag.ts` `searchDocuments()` to use native pgvector query:
   ```sql
   ORDER BY embedding <=> queryEmbedding::vector LIMIT 5
   ```

### Add a new Clerk webhook event
1. Open `apps/web/app/api/webhooks/clerk/route.ts` (create if not exists)
2. Verify webhook signature using `svix`
3. Handle the event type and sync to database
4. Register the webhook endpoint in Clerk dashboard

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `STRIPE_SECRET_KEY` | Pro | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Pro | Stripe webhook signing secret |
| `OPENAI_API_KEY` | AI features | OpenAI API key |
| `ANTHROPIC_API_KEY` | AI features | Anthropic API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | AI features | Google AI API key |
| `RESEND_API_KEY` | Email | Resend API key |


See `.env.example` for the full list.

---

## Common Patterns Quick Reference

```typescript
// Auth (server)
import { auth } from "@clerk/nextjs/server";
const { userId, orgId } = await auth();
if (!userId) redirect("/auth/sign-in");

// Database
import { db } from "@launchkit/database";
import { users } from "@launchkit/database";
import { eq } from "drizzle-orm";
await db.query.users.findFirst({ where: eq(users.clerkId, userId) });

// Streaming AI
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
const result = streamText({ model: openai("gpt-4o"), messages });
return result.toDataStreamResponse();

// Document RAG
import { indexDocument, searchDocuments } from "@/lib/rag";
await indexDocument(orgId, title, content);
const results = await searchDocuments(orgId, query, 5);

```

---

## Available Commands

```bash
pnpm dev                          # Start all apps in dev mode
pnpm build                        # Build all apps
pnpm lint                         # Lint all apps
pnpm db:generate                  # Generate Drizzle migrations
pnpm db:migrate                   # Run pending migrations
pnpm db:push                      # Push schema without migrations (dev)
pnpm db:studio                    # Open Drizzle Studio
pnpm db:seed                      # Seed the database
pnpm --filter @launchkit/web dev  # Start web app only
npx launchkit-mcp                 # Start the MCP server
npx create-launchkit@latest my-app --db=neon  # Scaffold new project

# Git — primary branch is main (never master)
git push origin main
```

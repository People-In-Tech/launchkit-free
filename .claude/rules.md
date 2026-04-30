# LaunchKit — Claude Code Rules
# Version: Milestone 3 (AI-First)

## Project Overview

LaunchKit is a production-ready SaaS starter kit (Turborepo monorepo).

**Stack**: Next.js 15 · Neon/Supabase · Drizzle ORM · Clerk · Stripe · Vercel AI SDK · React Email/Resend

## Key File Locations

| What | Where |
|------|-------|
| Database schema | `packages/database/src/schema/` |
| Database client | `packages/database/src/client.ts` |
| AI API routes | `apps/web/app/api/ai/` |
| Billing routes | `apps/web/app/api/billing/` |
| Webhook handlers | `apps/web/app/api/webhooks/` |
| Dashboard pages | `apps/web/app/dashboard/` |
| UI components | `apps/web/components/ui/` |
| Shared utilities | `apps/web/lib/` |
| Plan config | `packages/config/src/plans.ts` |
| Email templates | `packages/email/src/templates/` |
| Background jobs | `packages/jobs/src/tasks/` |
| MCP server | `packages/mcp-server/src/index.ts` |

## Mandatory Rules

### 1. Auth
```typescript
import { auth } from "@clerk/nextjs/server";
const { userId, orgId } = await auth();
if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

### 2. Database
```typescript
import { db } from "@launchkit/database";
import { users, documents } from "@launchkit/database";
import { eq, and } from "drizzle-orm";

// Reads
await db.query.users.findFirst({ where: eq(users.clerkId, userId) });

// Writes
await db.insert(documents).values({ organizationId, title, content });
await db.update(users).set({ name }).where(eq(users.id, userId));
await db.delete(documents).where(eq(documents.id, id));
```

### 3. Credits (for every AI operation)
```typescript
import { getCredits, deductCredits } from "@/lib/credits";
const balance = await getCredits(userId);
if (balance < CREDIT_COST) {
  return Response.json({ error: "Insufficient credits" }, { status: 402 });
}
await deductCredits(userId, CREDIT_COST, "Operation description");
```

### 4. Streaming AI
```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
const result = streamText({ model: openai("gpt-4o"), messages });
return result.toDataStreamResponse();
```

### 5. Components
```typescript
import { cn } from "@/lib/utils";
interface MyProps { className?: string; }
export function MyComponent({ className }: MyProps) {
  return <div className={cn("base-classes", className)} />;
}
```

### 6. Input validation
```typescript
import { z } from "zod";
const Schema = z.object({ name: z.string().min(1) });
const parsed = Schema.safeParse(body);
if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 });
```

### 7. Lazy initialization (external services)
```typescript
// ✅ Correct — lazy
let _client: Client | null = null;
function getClient() {
  if (!_client) _client = new Client({ apiKey: process.env.API_KEY });
  return _client;
}

// ❌ Wrong — module scope
const client = new Client({ apiKey: process.env.API_KEY });
```

## TypeScript Rules

- `strict: true` is enabled — no implicit `any`
- Never use `any` — use `unknown` + type guards
- Use `type` keyword for type-only imports: `import type { Foo } from "bar"`
- Prefer `interface` for object shapes
- Use `satisfies` for type-checking literals with inference

## Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` named exports
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database tables: `snake_case` (in schema)
- Environment variables: `SCREAMING_SNAKE_CASE`

## Adding New Schemas

1. Create `packages/database/src/schema/[name].ts`
2. Add `export * from "./[name]";` to `packages/database/src/schema/index.ts`
3. Run `pnpm db:generate` then `pnpm db:migrate`

## Error Handling Conventions

```typescript
// API route errors
try {
  // ...
} catch (error) {
  console.error("[api/route/METHOD]", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}

// Typed error responses
// 401 — Unauthorized
// 402 — Insufficient credits
// 404 — Not found
// 422 — Validation error (with Zod flatten)
// 500 — Internal server error
```

## RAG Pipeline

```typescript
import { indexDocument, searchDocuments, deleteDocument } from "@/lib/rag";

// Index a document (chunks it and generates embeddings)
await indexDocument(orgId, "Title", content, { metadata: { source: "upload" } });

// Search
const results = await searchDocuments(orgId, "query", 5);
// results[].similarity — 0-1 cosine similarity score

// Delete
await deleteDocument(parentDocumentId);
```

## Background Jobs

```typescript
// Trigger a job (from API route or webhook)
// Use Vercel cron for background jobs: /api/cron/* routes
await tasks.trigger("process-document-embedding", { organizationId, title, content });
await tasks.trigger("reset-monthly-credits", { userId, planId: "pro", billingCycleStart: new Date().toISOString() });
```

## Credit Costs

```typescript
// Chat: 1 credit per request
// Summarize: 2 credits per request
// Generate content: 2 credits per request
// Image (DALL-E 3): 10 credits per image
// Document embedding: 1 credit per chunk
// Semantic search: 1 credit per search
```

## What NOT to Do

- Never use `getServerSession` (use Clerk's `auth()`)
- Never use Prisma (use Drizzle ORM)
- Never use raw SQL strings (use Drizzle query builder)
- Never initialize clients at module scope
- Never skip auth checks in API routes
- Never skip credit checks in AI routes
- Never use `any` type
- Never hardcode secrets (use env vars)
- Never use CSS Modules or styled-components (use Tailwind)
- Never create new UI primitives (use shadcn/ui)
- Never use `default export` for components (use named exports)

# LaunchKit — Cursor AI Rules
# This file is automatically loaded by Cursor when working in this project.

## Quick Reference

**Import database**: `import { db, users, organizations, documents } from "@launchkit/database"`
**Import auth**: `import { auth } from "@clerk/nextjs/server"`
**Import credits**: `import { getCredits, deductCredits } from "@/lib/credits"`
**Import RAG**: `import { indexDocument, searchDocuments } from "@/lib/rag"`
**Import email**: `import { sendEmail, WelcomeEmail } from "@launchkit/email"`
**Import cn**: `import { cn } from "@/lib/utils"`

## Server vs Client Components

**Server Component** (default — no directive needed):
- Data fetching with `db.query.*`
- `auth()` from Clerk
- Reading env vars
- Page-level components

**Client Component** (add `"use client"` at top):
- `useState`, `useEffect`, `useRef`, `useCallback`
- `onClick`, `onChange`, event handlers
- `useChat`, `useCompletion` from `ai/react`
- `useUser()`, `useOrganization()` from Clerk

## Required Pattern: Every API Route

```typescript
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function POST(req: Request) {
  // 1. Auth check — ALWAYS first
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse body
  const body = await req.json();

  // 3. Validate with Zod
  const parsed = MySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 });

  // 4. Business logic
  try {
    return Response.json({ data: result });
  } catch (error) {
    console.error("[api/route/POST]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## Required Pattern: Every AI Route

```typescript
const CREDIT_COST = 1; // Chat=1, Summarize=2, Generate=2, Image=10

const balance = await getCredits(userId);
if (balance < CREDIT_COST) {
  return Response.json({ error: "Insufficient credits" }, { status: 402 });
}
await deductCredits(userId, CREDIT_COST, "Description of operation");
```

## Component Structure

```tsx
"use client"; // only if needed

import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  // add your props
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return <div className={cn("base", className)} />;
}
```

## Avoid These

```typescript
// ❌ Module-scope client initialization
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// ✅ Lazy initialization
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// ❌ any type
const data: any = await fetch(...);

// ✅ Proper typing
const data = await fetch(...) as MyResponseType;

// ❌ Missing auth check
export async function POST(req: Request) {
  const body = await req.json(); // vulnerability!

// ✅ Auth first
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
```

## File Templates

### New page: `app/dashboard/[name]/page.tsx`
```tsx
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Page Name", description: "..." };

export default async function PageName() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");
  return <div className="space-y-6"><h1>Page Name</h1></div>;
}
```

### New schema: `packages/database/src/schema/[name].ts`
```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
export const myTable = pgTable("my_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

# LaunchKit — Conventions (Aider)

> This file is read by Aider to understand project conventions before making changes.
> Run aider with: `aider --read CONVENTIONS.md`

---

## Project

**LaunchKit** — Next.js 15 SaaS boilerplate. One-time purchase, no subscriptions.
https://getlaunchkit.app · People In Tech LLC

---

## Stack

- Next.js 15 App Router + TypeScript strict mode
- Neon OR Supabase (Postgres) + Drizzle ORM
- Clerk (auth) — only auth provider
- Stripe (billing) — only payment provider; one-time $149/$299
- Vercel AI SDK — multi-model via `getModel()` factory
- React Email + Resend
- Tailwind CSS + shadcn/ui
- Turborepo monorepo + pnpm workspaces

---

## File Conventions

### Naming
- `kebab-case` for files and directories
- `PascalCase` for React components
- `camelCase` for functions, variables, hooks
- `SCREAMING_SNAKE` for constants and env var names

### Component structure
```typescript
// 1. "use client" if needed (skip for Server Components)
// 2. Imports: react, next, external libs, internal aliases
// 3. Types / interfaces
// 4. Component function (named export, not default)
// 5. Helper functions below

import { type FC } from "react";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return <div className={cn("...", className)}>{title}</div>;
}
```

### API routes
```typescript
// @ts-nocheck  ← add when importing @launchkit/database
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@launchkit/database";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await db.select()...
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Server Components (preferred default)
```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");
  // fetch data server-side, pass as props to client components
}
```

---

## The `// @ts-nocheck` Rule

**Always add `// @ts-nocheck` as the first line** of any file that imports from `@launchkit/database`.
This is a known Drizzle ORM dual-instance type conflict in monorepos. It is intentional and safe.

```typescript
// @ts-nocheck  ← required
import { db } from "@launchkit/database";
import { users } from "@launchkit/database/schema/users";
```

---

## AI Calls

Use the provider-agnostic factory. Never instantiate providers directly.

```typescript
import { getModel } from "@/lib/ai";
import { streamText, generateText } from "ai";

// Streaming (chat, completions)
const result = streamText({ model: getModel("gpt-5.4-mini"), messages });
return result.toDataStreamResponse();

// Non-streaming (extraction, classification)
const { text } = await generateText({ model: getModel("claude-sonnet-4-6"), prompt });
```

Available model IDs: `gpt-5.4-mini`, `gpt-5.4`, `claude-sonnet-4-6`, `claude-opus-4-7`,
`gemini-2.0-flash`, `gemini-2.5-pro`, and more — see `apps/web/lib/ai.ts`.

---

## Package Imports

Always use workspace package aliases:

| What | Import |
|------|--------|
| DB client + schema | `@launchkit/database` |
| Email sending | `@launchkit/email` |
| File storage | `@launchkit/storage` |
| Shared config | `@launchkit/config` |

Never import Drizzle, Neon driver, or Resend directly in `apps/web`.

---

## Do Not Add Back

These were deliberately removed from the codebase:

- **Lemon Squeezy** — Stripe is the only payment provider
- **Trigger.dev** — use Vercel cron jobs (`/api/cron/*` routes in vercel.json)
- **Firebase** — Neon and Supabase are the only database options
- **NextAuth** — Clerk is the only auth provider
- **Supabase Auth** — use Clerk for auth, Supabase for database only

---

## Commit Message Format

```
type(scope): short description

Examples:
feat(billing): add annual pricing toggle
fix(auth): redirect loop on missing env var
chore(deps): bump next to 15.3.2
docs(readme): update CLI setup steps
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`

# Push Database Schema

Push all Drizzle schema changes to the Neon database.

## Command
```bash
pnpm db:push
```

## What this does
Runs `drizzle-kit push` against `DATABASE_URL` — applies schema changes without generating migration files.

## When to use
- After adding a new table in `packages/database/src/schema/`
- After modifying column types or adding columns
- After running `/project:scaffold <name>` (remember to export the schema first)

## Before running
Make sure `DATABASE_URL` is set in your `.env.local`:
```
DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
```

## If you get pgvector errors
Enable pgvector in Neon:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
Run this in the Neon SQL editor, then re-run `pnpm db:push`.

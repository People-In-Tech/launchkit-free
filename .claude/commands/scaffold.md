# Scaffold a CRUD Module

Generate a full CRUD module for the given entity name.

## Usage
```
/project:scaffold <module-name>
```

## What this does
Runs `node scripts/scaffold.mjs $ARGUMENTS` which creates:
- `packages/database/src/schema/<name>.ts` — Drizzle schema
- `apps/web/app/api/<name>/route.ts` — GET / POST / DELETE API
- `apps/web/app/dashboard/<name>/page.tsx` — Dashboard page
- `apps/web/components/<name>/<Name>Table.tsx` — Data table
- `apps/web/components/<name>/<Name>Form.tsx` — Create form
- `apps/web/components/<name>/<Name>PageClient.tsx` — Client orchestrator

## Steps
1. Run: `node scripts/scaffold.mjs $ARGUMENTS`
2. Export the schema from `packages/database/src/schema/index.ts`
3. Run: `pnpm db:push`
4. Add sidebar nav entry in `apps/web/components/dashboard/sidebar.tsx`
5. Customize the schema fields for your use case

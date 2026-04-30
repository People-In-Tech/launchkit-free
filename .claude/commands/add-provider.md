# Add a New AI Provider

Add a new AI provider to the LaunchKit provider factory.

## Usage
```
/project:add-provider <provider-name>
```

## Files to modify

1. **`apps/web/lib/ai.ts`** — Add the provider to the `getModel()` factory
2. **`packages/config/src/stack.ts`** — Add model IDs to `AIProvider` type
3. **`apps/web/app/stack/page.tsx`** — Add to the provider display table
4. **`packages/create-launchkit/src/stack-prompts.ts`** — Add to CLI provider options
5. **`.env.example`** — Add the API key env var
6. **`CLAUDE.md`** — Update the AI Providers section

## Provider factory pattern
```typescript
// apps/web/lib/ai.ts
case "new-provider-model":
  return createNewProvider({
    apiKey: process.env.NEW_PROVIDER_API_KEY,
  })("model-id");
```

## Install the provider SDK
```bash
pnpm add @ai-sdk/new-provider --filter @launchkit/web
```

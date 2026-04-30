# Create a New Plugin

Create a new drop-in plugin for LaunchKit.

## Usage
```
/project:new-plugin <plugin-name>
```

## What to create

1. **Component** at `apps/web/components/plugins/<plugin-name>/index.tsx`
2. **API route** at `apps/web/app/api/plugins/<plugin-name>/route.ts`
3. **Schema** at `packages/database/src/schema/<plugin-name>.ts`
4. **Register** in `packages/plugins/src/registry.ts`

## Plugin interface
```typescript
// packages/plugins/src/types.ts
interface PluginManifest {
  name: string;
  description: string;
  version: string;
  files: Array<{ src: string; dest: string }>;
  schema?: unknown;
  dependencies: string[];
}
```

## Steps
1. Create the component and API route
2. Create the DB schema (if needed) and export from schema/index.ts
3. Register in the plugin registry
4. Add to the plugins array in `apps/web/app/page.tsx`
5. Run `pnpm db:push` if schema was added

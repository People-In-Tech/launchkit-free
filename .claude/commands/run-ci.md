# Run CI Checks Locally

Run the full CI pipeline locally before pushing.

## Command
```bash
pnpm typecheck && pnpm lint
```

## Individual checks

```bash
# Type checking only
pnpm typecheck

# Linting only
pnpm lint

# Build (slowest, most thorough)
npx turbo build --filter=@launchkit/web --force
```

## Fix common issues

### Type errors on Drizzle imports
Add `// @ts-nocheck` at the top of the file. This is a known dual-instance Drizzle type issue.

### Missing env vars during build
Set `SKIP_ENV_VALIDATION=1` for build-only checks:
```bash
SKIP_ENV_VALIDATION=1 npx turbo build --filter=@launchkit/web
```

### Module not found
Run `pnpm install --no-frozen-lockfile` first.

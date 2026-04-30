# create-launchkit

The official setup wizard for [LaunchKit](https://getlaunchkit.app) — Ship your SaaS this weekend.

## Usage

Run from inside a cloned LaunchKit Pro project:

```bash
npx create-launchkit@latest
```

The wizard will:
1. Detect your LaunchKit project
2. Walk you through stack selection (database, auth, payments, AI, storage)
3. Write `launchkit.config.ts` with your choices
4. Collect your API keys and write `apps/web/.env.local`
5. Apply code scaffolding for NextAuth or Supabase if selected
6. Run `pnpm install` and database migrations

## Pre-select your stack with flags

```bash
npx create-launchkit@latest --db=neon --auth=clerk --payments=stripe
```

| Flag | Options |
|------|---------|
| `--db` | `neon` (default), `supabase` |
| `--auth` | `clerk` (default), `nextauth`, `supabase` |
| `--payments` | `stripe` (default), `lemonsqueezy`, `paddle` |

## Getting started

```bash
# 1. Purchase LaunchKit → https://getlaunchkit.app
# 2. Clone your repo
git clone https://github.com/People-In-Tech/launchkit-pro.git my-app

# 3. Run the setup wizard
cd my-app
npx create-launchkit@latest

# 4. Start your dev server
pnpm dev
```

## Requirements

- Node.js 20+
- pnpm 9+
- An existing LaunchKit Pro clone

## Documentation

[https://getlaunchkit.app/docs](https://getlaunchkit.app/docs)

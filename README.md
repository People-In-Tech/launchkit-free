<div align="center">

# 🚀 LaunchKit

**Ship your SaaS in a weekend — not a quarter.**

[![License](https://img.shields.io/badge/license-Commercial-black)](./LICENSE)
[![Version](https://img.shields.io/badge/version-v1.0.0-black)](./CHANGELOG.md)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-black?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

The production-ready SaaS starter kit for AI-first developers.<br/>
Auth, billing, teams, AI, admin, and growth — all wired up and ready to go.

**[💳 Buy Pro — $149 Solo / $299 Teams](https://getlaunchkit.app/pricing)**&nbsp;&nbsp;·&nbsp;&nbsp;**[🔍 Live Demo](https://getlaunchkit.app)**&nbsp;&nbsp;·&nbsp;&nbsp;**[📖 Docs](https://docs.getlaunchkit.app)**

</div>

---

> **This is the public source preview.** You can read, fork, and evaluate the code. A [commercial license](./LICENSE) is required before using it in any project — [purchase one here](https://getlaunchkit.app/pricing).
>
> **Already a buyer?** You have access to the [private Pro repo](https://github.com/People-In-Tech/launchkit-pro) which includes versioned releases, update notifications, and priority support.

---

## What's included

| Layer | Technology |
|-------|------------|
| ⚡ Framework | Next.js 15 — App Router, Server Components, Server Actions |
| 🔷 Language | TypeScript — strict mode throughout |
| 🗄️ Database | Neon (serverless Postgres + pgvector for AI search) |
| 🔗 ORM | Drizzle ORM — type-safe, zero-overhead |
| 🔐 Auth | Clerk — email, OAuth, MFA, organizations |
| 💳 Payments | Stripe — one-time + subscriptions, Apple Pay, Google Pay, Link |
| 🤖 AI | Vercel AI SDK — 11 providers (GPT, Claude, Gemini, Groq + more) |
| 🎨 UI | Tailwind CSS + shadcn/ui — dark mode, accessible |
| 📧 Email | React Email + Resend — 3,000/month free |
| 📊 Analytics | PostHog or Plausible — auto-detected from env vars |
| 🚀 Deploy | Vercel, Railway, Fly.io, Docker |
| 📦 Monorepo | Turborepo + pnpm workspaces |

---

## Free (this repo) vs Pro

| | 🆓 Free (source preview) | ⭐ Solo — $149 | 👥 Teams — $299 |
|---|---|---|---|
| Full source code | ✅ | ✅ | ✅ |
| All features pre-built | ✅ | ✅ | ✅ |
| **Commercial license** | ❌ | ✅ | ✅ |
| Private GitHub org access | ❌ | ✅ | ✅ |
| Versioned releases + changelogs | ❌ | ✅ | ✅ |
| Pull updates into your project | ❌ | ✅ | ✅ |
| Release notifications | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| Projects | 1 (eval only) | 1 commercial | Unlimited |
| **Price** | Free | **$149 one-time** | **$299 one-time** |

---

## Quickstart

```bash
# 1. Clone
git clone https://github.com/CalebKing3/launchkit.git my-saas
cd my-saas

# 2. Install
pnpm install

# 3. Configure
cp .env.example .env.local
# Fill in Neon, Clerk, Stripe, Resend keys (see .env.example comments)

# 4. Migrate
pnpm db:push

# 5. Run
pnpm dev
# → http://localhost:3000 (web)
# → http://localhost:3001 (docs)
```

Full setup guide: [docs.getlaunchkit.app/docs/quickstart](https://docs.getlaunchkit.app/docs/quickstart)

---

## Built for AI vibe coders

Point your agent at this repo and it immediately understands the codebase — conventions, APIs, schema, boundaries — all configured out of the box.

| Tool | What's included |
|------|-----------------|
| 🟣 **Claude Code** | `CLAUDE.md` project context · `AGENTS.md` rules · slash commands in `.claude/commands/` |
| 🔵 **Cursor** | `.cursor/rules/` — MDC files: components, API routes, database, AI agents |
| 🟡 **Windsurf** | Full `.cursorrules` fallback + `AGENTS.md` task boundaries |
| 🔌 **MCP Server** | 8 built-in tools — scaffold modules, query DB, manage flags, preview emails |
| 🌐 **Any agent** | `.mcp.json` auto-discovery · `API.md` full route reference |

---

## License

This code is made available for **evaluation only** under the [LaunchKit Commercial License](./LICENSE). You must purchase a license before using it in any project. See [LICENSE](./LICENSE) for full terms.

[Purchase a license →](https://getlaunchkit.app/pricing)

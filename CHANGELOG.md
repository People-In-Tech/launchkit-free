# Changelog

All notable changes to LaunchKit are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Buyers get all updates for free.** Pull the latest `main` when a new version ships.

---

## [1.0.0] — 2026-04-26

### Added
- Next.js 15 App Router monorepo with pnpm workspaces + Turborepo
- Clerk authentication — social providers, MFA, multi-tenant orgs with roles
- Stripe one-time purchases (Solo $149 / Teams $299) with Apple Pay, Google Pay, Link
  - Tax-inclusive pricing via Stripe Tax
  - `LAUNCH10` launch discount coupon
- Admin dashboard — user management, billing overview, analytics
- PostHog analytics with Clerk user identity sync
- React Email + Resend transactional emails (3,000/month free tier)
- Drizzle ORM with Neon Postgres (pgvector ready for AI features)
- Fumadocs documentation site at `/docs`
- Full TypeScript, shadcn/ui, Tailwind CSS
- MCP server (`packages/mcp-server`) with 20+ tools for Claude Code / Cursor
- `CLAUDE.md`, `.cursorrules`, `AGENTS.md` included for AI-assisted development
- `packages/analytics` — PostHog + Plausible adapters, auto-detected from env vars

---

## Upcoming

### [1.1.0] — Planned
- Component marketplace — browse and copy 50+ production-ready shadcn components
- Template gallery — starter pages: landing, pricing, blog, docs
- Social proof showcase section

### [1.2.0] — Planned
- Plugin architecture: feedback, waitlist, testimonials, roadmap, file uploads
- Referral system with unique links and attribution
- Programmatic SEO admin panel

### [2.0.0] — Planned
- Configurable stack CLI — choose DB, auth, payments, hosting at setup
- Support for Supabase, PlanetScale, NextAuth, Stripe, Lemon Squeezy adapters

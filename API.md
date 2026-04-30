# LaunchKit — API & Dependencies Reference

> Reference doc for debugging. Lists every HTTP route, its auth requirement,
> the shape of the request/response, and which external service or package it
> depends on.
>
> - **Auth column**: `none` (public), `clerk` (any signed-in user),
>   `admin` (Clerk `metadata.role === "super_admin"`), `bearer`
>   (requires `Authorization: Bearer <METRICS_API_KEY>`), `svix`
>   (webhook signature only — public URL).
> - Routes live under `apps/web/app/api/<path>/route.ts`.
> - All routes use the App Router pattern — HTTP methods are named exports.

---

## Quick Debug Map

| Symptom | First thing to check |
|---|---|
| Route returns 401 | User isn't signed in; check Clerk session cookie |
| Route returns 403 | User lacks `super_admin` role; see `middleware.ts:58` |
| Webhook returns 400 | Signature verification failed — check `*_WEBHOOK_SECRET` |
| AI route hangs | Provider key missing or rate-limited — check provider dashboard |
| `/api/metrics` → 401 | `METRICS_API_KEY` not set or wrong `Authorization` header |
| DB error on any route | `DATABASE_URL` not set, or migrations not applied (`pnpm db:migrate`) |
| Checkout redirects to `/pricing?canceled=1` | Stripe price ID mismatch or user closed checkout |
| Clerk user signs up but nothing in DB | `/api/webhooks/clerk` not receiving events — check Clerk webhook config |

---

## 1. AI Routes

All require `clerk` auth. Most stream `text/event-stream` responses via the Vercel AI SDK.

| Endpoint | Method | Auth | Purpose | Body / Params | Response | Depends on |
|---|---|---|---|---|---|---|
| `/api/ai/chat` | POST | clerk | Streamed multi-provider chat | `{ messages, model? }` | SSE stream | `lib/ai.ts`, `OPENAI_API_KEY` (+ optional provider keys) |
| `/api/ai/agent` | POST | clerk | Tool-calling agent (search, fetch-url, code) | `{ messages, modelId?, tools?, systemPrompt?, agentConfigId? }` | SSE stream | `@launchkit/agents`, `PERPLEXITY_API_KEY` (for search tool) |
| `/api/ai/rag` | POST | clerk | RAG chat (retrieves top-k docs from pgvector) | `{ messages, modelId?, k?, systemPrompt? }` | SSE stream | `@launchkit/rag`, pgvector, `OPENAI_API_KEY` (embeddings) |
| `/api/ai/embed` | POST | clerk | Store text in vector DB | `{ id, content, metadata?, chunk? }` | `{ success, id }` | `@launchkit/rag`, `lk_documents` table |
| `/api/ai/summarize` | POST | clerk | Summarize text (2 credits) | `{ text, model?, style? }` | SSE stream | `lib/ai.ts`, credits system |
| `/api/ai/generate` | POST | clerk | Generate blog/email/social copy | `{ contentType, topic, tone, length, model? }` | SSE stream | `lib/ai.ts` |
| `/api/ai/image` | POST | clerk | Single image generation | `{ prompt, provider?, size?, quality? }` | `{ url, provider, revisedPrompt? }` | `@ai-sdk/openai` (DALL·E 3), Stability, Flux |
| `/api/ai/images` | POST | clerk | Image generation (10 credits) | `{ prompt, style?, size?, quality? }` | `{ url, provider, revisedPrompt? }` | `OPENAI_API_KEY`, credits |
| `/api/ai/search` | POST | clerk | Semantic search across org docs (1 credit) | `{ query, limit? }` | `{ chunks: [] }` | `@launchkit/rag`, pgvector |
| `/api/ai/documents` | GET / POST / DELETE | clerk | CRUD on RAG store documents | `{ title, content, metadata? }` | `{ documents }` or `{ success }` | `@launchkit/rag` |

### AI Factory — `apps/web/lib/ai.ts`

Every AI route calls `getModel(id)` which routes to the right SDK. Supported providers (env vars listed):

| Provider | SDK | Env var |
|---|---|---|
| OpenAI | `@ai-sdk/openai` | `OPENAI_API_KEY` (**required** — used for embeddings even if you default to another provider) |
| Anthropic | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Perplexity | `@ai-sdk/perplexity` | `PERPLEXITY_API_KEY` |
| xAI (Grok) | `@ai-sdk/openai`-compat | `XAI_API_KEY` |
| DeepSeek | `@ai-sdk/openai`-compat | `DEEPSEEK_API_KEY` |
| Groq | `@ai-sdk/openai`-compat | `GROQ_API_KEY` |
| Mistral | `@ai-sdk/openai`-compat | `MISTRAL_API_KEY` |
| AWS Bedrock | `@ai-sdk/amazon-bedrock` | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` |
| Google Vertex | `@ai-sdk/google-vertex` | `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION` |
| Azure OpenAI | `@ai-sdk/azure` | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` |

---

## 2. Billing

| Endpoint | Method | Auth | Purpose | Body | Response | Depends on |
|---|---|---|---|---|---|---|
| `/api/billing/checkout` | POST | clerk | Create Stripe Checkout session for LaunchKit license | `plan: "pro" \| "team"` | 303 redirect to Stripe | Stripe, `STRIPE_PRICE_LAUNCHKIT_PRO/TEAM` |
| `/api/billing/portal` | POST | clerk | Create Stripe Customer Portal link | — | `{ url }` | Stripe Customer Portal must be enabled |
| `/api/billing/sync-seats` | POST | admin | Manually reconcile org seats → Stripe subscription items | — | `{ success }` | Stripe subscriptions |

### Stripe env vars
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_LAUNCHKIT_PRO=
STRIPE_PRICE_LAUNCHKIT_TEAM=
```
Subscription-template (optional): `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_*_SEAT_*`, `STRIPE_*_METER_*`, `STRIPE_ADDON_*`.

---

## 3. Webhooks (public URLs, signature-verified)

| Endpoint | Method | Auth | Purpose | Verifies via | Side-effects |
|---|---|---|---|---|---|
| `/api/webhooks/stripe` | POST | svix (Stripe sig) | License + subscription lifecycle | `STRIPE_WEBHOOK_SECRET` | Writes `purchases`, `subscriptions`; sends email; GitHub invite |
| `/api/webhooks/lemonsqueezy` | POST | LS signature | Alternative billing provider | `LEMONSQUEEZY_WEBHOOK_SECRET` | Same as Stripe flow |
| `/api/webhooks/clerk` | POST | svix | Sync Clerk → DB (users, orgs, memberships) | `CLERK_WEBHOOK_SECRET` | Upserts `users`, `organizations`, `organization_memberships` |

### Webhook Management (internal, for API consumers of YOUR app)
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/webhooks/endpoints` | GET / POST | clerk | List / create webhook endpoints |
| `/api/webhooks/endpoints/[id]` | GET / PATCH / DELETE | clerk | CRUD a single endpoint |
| `/api/webhooks/endpoints/[id]/deliveries` | GET | clerk | Last 50 delivery attempts |
| `/api/webhooks/endpoints/[id]/test` | POST | clerk | Send a test event |

---

## 4. Admin (super_admin only)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/users` | GET | admin | Paginated user list with search |
| `/api/admin/users/[userId]/ban` | POST / DELETE | admin | Ban / unban user (Clerk) |
| `/api/admin/users/[userId]/impersonate` | POST | admin | Issue Clerk actor token |
| `/api/audit-logs` | GET | admin | Query audit log |
| `/api/audit-logs/export` | GET | admin | CSV export |
| `/api/feature-flags` | GET / POST | admin | List / create flags |
| `/api/feature-flags/[key]` | GET / PATCH | admin | Check or update flag |
| `/api/drip/campaigns` | GET | admin | List drip campaigns |
| `/api/drip/campaigns/[id]` | GET / PATCH | admin | Read / update campaign |
| `/api/drip/campaigns/[id]/steps` | GET | admin | Step list with per-step stats |
| `/api/drip/campaigns/[id]/steps/[stepId]` | PATCH / DELETE | admin | Edit / remove step |
| `/api/drip/campaigns/[id]/enrollments` | GET | admin | Paginated enrollment list |
| `/api/drip/enroll` | POST | admin | Manually enroll a user |
| `/api/drip/unsubscribe` | GET | **none** | Unsubscribe by `?id=<enrollmentId>` (emailed link) |
| `/api/referrals/admin` | GET | admin | Aggregate referral stats |
| `/api/seo/generate` | POST | admin | Bulk-generate SEO pages from template |
| `/api/seo/templates` | GET / POST | admin | List / create templates |
| `/api/seo/templates/[id]` | GET / PATCH | admin | Single template CRUD |
| `/api/seo/pages` | GET / POST | admin | List / create pages |
| `/api/seo/pages/[id]` | GET / PATCH / DELETE | admin | Single page CRUD |

---

## 5. Account & Settings

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/credits` | GET | clerk | User's current credit balance |
| `/api/keys` | GET / POST | clerk | List / create org API keys |
| `/api/keys/[keyId]` | PATCH / DELETE | clerk | Update or revoke key |
| `/api/domains` | GET / POST | clerk | Custom domain list / add |
| `/api/domains/[id]` | PATCH / DELETE | clerk | Edit / remove |
| `/api/domains/[id]/verify` | POST | clerk | DNS verify |
| `/api/sso/config` | GET / POST | clerk (org admin) | SAML / OIDC config |
| `/api/team/ai-usage` | GET | clerk | Token usage + cost (`?period=1d\|7d\|30d\|90d`) |
| `/api/metrics` | GET | **bearer** | MRR, churn, active users (requires `METRICS_API_KEY`) |

---

## 6. Content & Marketing

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/changelog` | GET / POST | public / admin | Public list; admin create |
| `/api/changelog/rss` | GET | public | RSS feed |
| `/api/feedback` | POST | public / clerk | Submit feedback (public allowed) |
| `/api/feedback/[id]/upvote` | POST | public | Upvote |
| `/api/testimonials` | GET / POST | public / clerk | Public list; auth create |
| `/api/waitlist` | POST | public | Email capture with referral position |
| `/api/leads` | POST | public | Lead magnet opt-in (discount code issued) |
| `/api/help/search` | GET | public | Search help center |
| `/api/prompts` | GET / POST | clerk | Team prompt library |

---

## 7. Referrals

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/referrals` | GET / POST | clerk | Get or create user's code |
| `/api/referrals/leaderboard` | GET | public | Top-20 referrers |
| `/api/referrals/track` | POST | public | Beacon endpoint for click/signup/conversion |
| `/api/referrals/tiers` | GET / POST | public / admin | Tier definitions |
| `/api/referrals/admin` | GET | admin | Aggregate stats |

---

## 8. Onboarding

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/onboarding` | GET / POST | clerk | Progress tracker |
| `/api/onboarding/chat` | POST | clerk | Guided setup chat |
| `/api/onboarding/recommend` | POST | clerk | Stack recommendations |

---

## 9. Realtime & Uploads

| Endpoint | Method | Auth | Purpose | Depends on |
|---|---|---|---|---|
| `/api/pusher/auth` | POST | clerk | Authenticate private/presence channels | Pusher |
| `/api/upload` | POST | clerk | Multipart upload (10 MB max) | `@launchkit/storage` (Vercel Blob / S3 / GCS / Azure / Supabase) |

---

## 10. Package / Dependency Map

### Workspace packages (`packages/*`)

| Package | Purpose | Key exports | Consumed by |
|---|---|---|---|
| `@launchkit/database` | Drizzle ORM + Neon client, schema tables | `db`, `users`, `organizations`, `subscriptions`, `documents`, `prompts`, `aiUsage`, ... | Most API routes, jobs |
| `@launchkit/billing` | Stripe / Lemon Squeezy adapter | `createBillingAdapter(provider)`, `parseWebhook()` | `/api/billing/*`, `/api/webhooks/stripe` |
| `@launchkit/auth` | Auth adapter types (Clerk/NextAuth) | `AuthAdapter` types | Middleware, server components |
| `@launchkit/email` | Resend wrapper + React Email templates | `sendEmail()`, `PurchaseConfirmationEmail`, `WelcomeEmail`, ... | `/api/webhooks/stripe`, drip jobs |
| `@launchkit/storage` | Multi-provider file storage | `createStorage()` → Vercel Blob / S3 / GCS / Azure / Supabase | `/api/upload` |
| `@launchkit/rag` | pgvector embed + retrieve pipeline | `embedAndStore()`, `searchSimilar()`, `documents` schema | `/api/ai/rag`, `/api/ai/embed`, `/api/ai/search` |
| `@launchkit/agents` | Tool-calling agent runtime | `createAgent()`, tool defs (search, code, fetch-url) | `/api/ai/agent` |
| `@launchkit/analytics` | PostHog server client | `trackEvent()`, `identify()` | Most API routes |
| `@launchkit/realtime` | Pusher server wrapper | `pusher.trigger()` | `/api/pusher/auth` |
| `@launchkit/plugins` | Plugin registry + manifests | `plugins` map | `packages/config` |
| `@launchkit/config` | Shared stack config types | `StackConfig`, `launchkit.config.ts` | Everything |
| `@launchkit/jobs` | Trigger.dev job definitions | `dripJobs`, `seedJobs` | Trigger.dev runtime |
| `@launchkit/mcp-server` | MCP tools for Claude Code | `query_db`, `list_users`, etc. | `.mcp.json` auto-discovery |
| `create-launchkit` | CLI scaffolder (`pnpm create launchkit`) | `main()` | Stand-alone CLI |
| `@launchkit/tsconfig` | Shared TS config | `base.json`, `nextjs.json` | All packages |

### External runtime deps (declared in `apps/web/package.json`)

**Core framework**
- `next@15.5.14`, `react@19`, `react-dom@19`
- `next-intl` — i18n (en / es / fr)
- `next-themes` — dark mode

**Auth**
- `@clerk/nextjs` — sign-in/up, org management, role claims
- `svix` — webhook signature verification (used by `/api/webhooks/clerk`)

**DB / ORM**
- `drizzle-orm` + `@neondatabase/serverless`

**AI**
- `ai@^4` — Vercel AI SDK
- `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/perplexity`, `@ai-sdk/amazon-bedrock`, `@ai-sdk/google-vertex`, `@ai-sdk/azure`
- `openai` — direct SDK (used for DALL·E 3 in `/api/ai/images`)

**Billing & email**
- `stripe`
- `resend` (via `@launchkit/email`)

**UI**
- `@radix-ui/*` (15 packages) — primitives used by shadcn/ui
- `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `framer-motion`, `sonner`

**Observability & analytics**
- `@sentry/nextjs`
- `posthog-node`

**GitHub**
- `@octokit/rest` — used by `lib/github.ts` to auto-invite buyers

**Validation**
- `zod`

### Dev deps
`@playwright/test`, `@trigger.dev/sdk`, `tailwindcss`, `typescript`, `autoprefixer`, `postcss`, `@types/*`.

---

## 11. Database Tables (schema in `packages/database/src/schema/`)

| Table | Purpose |
|---|---|
| `users` | Mirror of Clerk users (populated by `/api/webhooks/clerk`) |
| `organizations` | Mirror of Clerk orgs |
| `organization_memberships` | User ↔ org role |
| `subscriptions` | Stripe / Lemon Squeezy subscription state |
| `purchases` | One-time LaunchKit license purchases |
| `credits` / `user_credits` | AI credit ledger |
| `ai_chats` | Chat history |
| `ai_usage` | Token + cost per call (powers `/api/team/ai-usage`) |
| `agent_configs` | Saved agent presets |
| `prompts` | Team prompt library |
| `documents` | pgvector RAG corpus |
| `feedback` | In-app feedback widget |
| `feature_flags` | Feature gate definitions |
| `waitlist` | Pre-launch signups |
| `leads` | Lead magnet captures |
| `referrals` | Referral codes + events |
| `drip_campaigns` + `drip_steps` + `drip_enrollments` | Email sequences |
| `testimonials` | Marketing testimonials |
| `changelog` | Published changelog entries |
| `seo_templates` + `seo_pages` | Programmatic SEO |
| `api_keys` | Org-scoped API keys |
| `audit_logs` | Admin action log |
| `custom_domains` | Per-org custom domains |
| `sso_config` | SAML / OIDC per org |
| `help_center` | Help articles |
| `onboarding` | Wizard state |
| `webhooks` | Customer-facing webhook endpoints + deliveries |

---

## 12. Environment Variables — Which route needs what

| Variable | Needed by |
|---|---|
| `DATABASE_URL` | Everything that touches DB |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | All protected routes, layout |
| `CLERK_WEBHOOK_SECRET` | `/api/webhooks/clerk` |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | `/api/billing/*`, `/api/webhooks/stripe` |
| `STRIPE_PRICE_LAUNCHKIT_PRO/TEAM` | `/api/billing/checkout` |
| `LAUNCHKIT_GITHUB_TOKEN` + `LAUNCHKIT_PRIVATE_REPO_SLUG` | `/api/webhooks/stripe` (buyer auto-invite), `/portal` action |
| `RESEND_API_KEY` + `EMAIL_FROM` | `@launchkit/email`, drip jobs, purchase emails |
| `OPENAI_API_KEY` | `/api/ai/*` (required — embeddings) |
| `ANTHROPIC_API_KEY` / `GOOGLE_*` / etc | Whichever AI provider you route to |
| `PERPLEXITY_API_KEY` | Agent's web-search tool |
| `STORAGE_PROVIDER` + `BLOB_READ_WRITE_TOKEN` (or S3 equiv) | `/api/upload` |
| `PUSHER_APP_ID` / `PUSHER_SECRET` / `NEXT_PUBLIC_PUSHER_KEY` / `PUSHER_CLUSTER` | `/api/pusher/auth`, realtime components |
| `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_*` | Error capture (see `sentry.*.config.ts`) |
| `NEXT_PUBLIC_POSTHOG_KEY` + `POSTHOG_API_KEY` | Analytics |
| `TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF` | `@launchkit/jobs` (drip campaigns) |
| `METRICS_API_KEY` | Bearer-auth for `/api/metrics` |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs in emails, OG tags, checkout success URL |
| `DEMO_MODE` / `NEXT_PUBLIC_DEMO_MODE` | Demo banner + seed data |
| `NEXT_PUBLIC_TEAMS_ONLY` | B2B redirect in middleware |

---

## 13. Common Debug Flows

### "User signs up but isn't in `users` table"
1. Clerk dashboard → Webhooks → your endpoint — are events showing green?
2. Vercel logs → `/api/webhooks/clerk` — any 4xx/5xx?
3. `CLERK_WEBHOOK_SECRET` matches the one shown in Clerk?
4. Check `users` table: `SELECT * FROM users ORDER BY created_at DESC LIMIT 5;`

### "AI route 500s with no useful error"
1. Tail logs — check if provider key is missing
2. `/api/credits` — is balance > 0? Routes with credits return 402 when empty
3. Provider dashboard — hit rate limit or monthly cap?

### "Checkout succeeds in Stripe but user sees no access"
1. Stripe → Webhooks → your endpoint → Delivery attempts — was the event delivered?
2. Look for `checkout.completed` in Vercel logs for `/api/webhooks/stripe`
3. `purchases` table — was the row inserted?
4. `inviteCollaborator` in `lib/github.ts` — did the GitHub invite fire? (Check GitHub → Invitations for the bot account.)

### "Admin panel returns 403"
Set `public_metadata.role = "super_admin"` on your Clerk user, sign out, sign back in. The session needs to be fresh for the claim to propagate.

### "Middleware redirects everything to sign-in"
`middleware.ts` protects anything not in `isPublicRoute`. If you just added a new public page, add it to that matcher.

### "Upload returns 413 or fails silently"
- `/api/upload` caps at 10 MB.
- Check `STORAGE_PROVIDER` is set and the credentials for that provider exist.
- Vercel Blob: `BLOB_READ_WRITE_TOKEN` must be set.

---

## 14. Reference Files

- Middleware & public routes: `apps/web/middleware.ts`
- AI provider factory: `apps/web/lib/ai.ts`
- Env validation (boot-time warnings): `apps/web/lib/env.ts`
- Credit accounting: `apps/web/lib/credits.ts`
- Audit logging helper: `apps/web/lib/audit.ts`
- Stripe client: `apps/web/lib/stripe.ts`
- GitHub invite: `apps/web/lib/github.ts`
- Webhooks signing: `apps/web/lib/webhooks.ts`
- Drizzle client: `packages/database/src/client.ts`
- Schema exports: `packages/database/src/schema/index.ts`

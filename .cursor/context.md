# LaunchKit — Project Context for Cursor AI

## What is LaunchKit?

LaunchKit is a SaaS boilerplate that lets developers ship their SaaS product in a weekend. It includes everything: auth, billing, database, AI, email, background jobs, and an admin dashboard.

## Current Milestone: Milestone 3 (AI-First)

Milestone 3 adds:
- **MCP Server** — AI coding assistants can query project schema, components, and config
- **RAG Pipeline** — Document indexing + semantic search with pgvector
- **AI Templates** — 4 pre-built AI features: chat, summarize, generate, images
- **Background Jobs** — Vercel cron routes at /api/cron/* (daily drip, GitHub invite reminder)
- **Enhanced Agent Rules** — Comprehensive guides for AI coding assistants

## Active Features

### AI Templates (apps/web/app/dashboard/ai/)
- `/dashboard/ai` — Multi-model chat assistant
- `/dashboard/ai/summarize` — Document summarizer
- `/dashboard/ai/generate` — Content generator (blog, email, social, product)
- `/dashboard/ai/images` — DALL-E 3 image generator

### AI API Routes (apps/web/app/api/ai/)
- `POST /api/ai/chat` — Streaming multi-model chat
- `POST /api/ai/summarize` — Text summarization
- `POST /api/ai/generate` — Content generation
- `POST /api/ai/images` — DALL-E 3 image generation
- `POST /api/ai/documents` — Index a document for RAG
- `GET /api/ai/documents` — List org documents
- `DELETE /api/ai/documents?id=` — Delete a document
- `POST /api/ai/search` — Semantic search across documents

### Database Tables
- `users` — Clerk user sync
- `organizations` — Clerk org sync
- `organization_memberships` — User-org relationships
- `subscriptions` — Billing state
- `user_credits` — AI credit balances
- `credit_transactions` — Credit usage log
- `ai_chats` — Chat history
- `documents` — RAG document chunks + embeddings

### Background Jobs (packages/jobs/)
- `send-welcome-email` — Sends welcome email on signup
- `send-team-invite` — Sends team invite email
- `sync-billing-seats` — Syncs seat count with billing provider
- `reset-monthly-credits` — Resets AI credits on billing renewal
- `process-document-embedding` — Background RAG document indexing
- `cleanup-expired-sessions` — Daily maintenance cleanup

### MCP Server Tools (packages/mcp-server/)
Database: `db_list_tables`, `db_show_schema`, `db_generate_migration`, `db_run_migrations`, `db_seed`
Components: `component_list`, `component_scaffold`, `page_scaffold`, `api_scaffold`
Config: `env_list`, `env_validate`, `config_show_plans`, `config_show_site`
Project: `project_structure`, `project_dependencies`, `project_scripts`
Email: `email_list_templates`, `email_preview`
Billing: `billing_show_config`, `billing_list_webhooks`
AI: `ai_show_models`, `ai_show_credits`

## Environment Variables Needed

Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` — Neon Postgres connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — Clerk keys
- `OPENAI_API_KEY` — Required for chat, summarize, generate, images, RAG
- `ANTHROPIC_API_KEY` — Required for Claude models
- `GOOGLE_GENERATIVE_AI_API_KEY` — Required for Gemini
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — Required for billing
- `RESEND_API_KEY` — Required for email sending
- `CRON_SECRET` — Optional: secures Vercel cron endpoints

## Getting Started

```bash
cp .env.example .env.local
# Fill in env vars
pnpm install
pnpm db:push   # or db:migrate for production
pnpm db:seed   # optional: seed with sample data
pnpm dev
```

## Key Decisions to Know

1. All AI operations check credits before running
2. The database client is lazy-initialized (safe for serverless)
3. Billing is Stripe only — one-time purchase ($149 Solo / $299 Teams)
4. Document embeddings use cosine similarity computed in-app until pgvector is enabled
5. Background work uses Vercel cron jobs defined in vercel.json

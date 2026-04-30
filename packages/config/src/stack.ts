export type DatabaseProvider = 'neon' | 'supabase' | 'firebase';
export type AuthProvider = 'clerk' | 'supabase' | 'nextauth';
export type PaymentProvider = 'stripe' | 'lemonsqueezy' | 'paddle';
export type DeployTarget = 'vercel' | 'cloudflare' | 'docker';
export type EmailProvider = 'resend' | 'postmark' | null;
export type AnalyticsProvider = 'posthog' | 'plausible' | null;
export type RealtimeProvider = 'pusher' | null;

/**
 * Direct AI providers — call the provider's API directly.
 *   openai      → GPT-5.4, GPT-5.4 mini       — best all-rounder
 *   anthropic   → Claude Sonnet 4.6, Opus 4.6  — best for coding & agents
 *   google      → Gemini 3.1 Flash/Pro          — cheapest at scale, 1M ctx
 *   perplexity  → Sonar Pro                     — web-grounded with live citations
 *   xai         → Grok 4.20                     — real-time web, 4-agent deliberation
 *   deepseek    → DeepSeek V3/R1                — cheapest for code
 *   groq        → LLaMA 3.3 70B                 — fastest inference (500+ tok/s)
 *   mistral     → Mistral Small 4               — open-weight Apache 2.0
 *
 * Cloud-managed AI providers — data stays in your cloud, billed through cloud credits.
 *   bedrock     → Claude 3.5 / Nova Pro / Llama on AWS Bedrock   — data residency
 *   vertex      → Gemini 2.0 / Claude on GCP Vertex AI            — data residency
 *   azure-openai → GPT-4o on Azure OpenAI Service                 — enterprise compliance
 */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'perplexity'
  | 'xai'
  | 'deepseek'
  | 'groq'
  | 'mistral'
  | 'bedrock'
  | 'vertex'
  | 'azure-openai';

/** Default models per provider (current as of April 2026) */
export const AI_DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-5.4-mini',
  anthropic: 'claude-sonnet-4-6',
  google: 'gemini-3.1-flash',
  perplexity: 'sonar-pro',
  xai: 'grok-4-20',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-small-latest',
  bedrock: 'bedrock-nova-pro',
  vertex: 'vertex-gemini-flash',
  'azure-openai': 'azure-gpt-4o-mini',
};

/**
 * Storage provider for file uploads.
 *   s3          → AWS S3 (also compatible with Cloudflare R2 via STORAGE_ENDPOINT)
 *   gcs         → Google Cloud Storage
 *   azure-blob  → Azure Blob Storage
 *   vercel-blob → Vercel Blob (simplest — zero config on Vercel)
 *   supabase    → Supabase Storage
 */
export type StorageProvider = 's3' | 'gcs' | 'azure-blob' | 'vercel-blob' | 'supabase';

export interface StackConfig {
  database: DatabaseProvider;
  auth: AuthProvider;
  payments: PaymentProvider;
  deploy: DeployTarget;
  email: EmailProvider;
  analytics: AnalyticsProvider;
  realtime: RealtimeProvider;
  /** Primary AI provider. Controls which SDK is initialized in lib/ai.ts */
  aiProvider: AIProvider;
  /** Storage backend for file uploads */
  storageProvider: StorageProvider;
}

export interface AppConfig {
  /** When true, removes personal accounts for pure B2B (teams-only mode) */
  teamsOnly: boolean;
  /** Stack configuration for provider selection */
  stack: StackConfig;
}

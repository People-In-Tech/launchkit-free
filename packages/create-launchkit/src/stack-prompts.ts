import chalk from "chalk";
import prompts from "prompts";

// ---------------------------------------------------------------------------
// Stack selection types (mirrored from @launchkit/config — standalone CLI)
// ---------------------------------------------------------------------------

export type DatabaseProvider = "neon" | "supabase" | "firebase";
export type AuthProvider = "clerk" | "supabase" | "nextauth";
export type PaymentProvider = "stripe" | "lemonsqueezy" | "paddle";
export type DeployTarget = "vercel" | "cloudflare" | "docker";
export type EmailProvider = "resend" | "postmark" | null;
export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "perplexity"
  | "xai"
  | "deepseek"
  | "groq"
  | "mistral"
  | "bedrock"
  | "vertex"
  | "azure-openai";
export type StorageProvider = "vercel-blob" | "s3" | "gcs" | "azure-blob" | "supabase";

export interface StackSelection {
  database: DatabaseProvider;
  auth: AuthProvider;
  payments: PaymentProvider;
  deploy: DeployTarget;
  email: EmailProvider;
  aiProvider: AIProvider;
  storageProvider: StorageProvider;
}

// ---------------------------------------------------------------------------
// AI provider metadata
// ---------------------------------------------------------------------------

interface AIProviderMeta {
  label: string;
  flagship: string;
  pitch: string;
  envKey: string;
  defaultModel: string;
  docsUrl: string;
  cloudManaged?: boolean;
  cloudProvider?: "aws" | "gcp" | "azure";
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderMeta> = {
  openai: {
    label: "OpenAI",
    flagship: "GPT-5.4 / GPT-5.4 mini",
    pitch: "Best all-rounder. Leads computer-use & knowledge-work benchmarks.",
    envKey: "OPENAI_API_KEY",
    defaultModel: "gpt-5.4-mini",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    flagship: "Claude Sonnet 4.6 / Opus 4.6",
    pitch: "Best for coding, agentic workflows & long-context tasks.",
    envKey: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4-6",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  google: {
    label: "Google Gemini",
    flagship: "Gemini 3.1 Flash / Pro",
    pitch: "Cheapest at scale. 1M token context. Free dev tier.",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    defaultModel: "gemini-3.1-flash",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  perplexity: {
    label: "Perplexity (Sonar)",
    flagship: "sonar-pro / sonar",
    pitch: "Web-grounded responses with live citations. Unique for research apps.",
    envKey: "PERPLEXITY_API_KEY",
    defaultModel: "sonar-pro",
    docsUrl: "https://www.perplexity.ai/settings/api",
  },
  xai: {
    label: "xAI (Grok)",
    flagship: "Grok 4.20",
    pitch: "Real-time web access + 4-agent deliberation. Best for forecasting.",
    envKey: "XAI_API_KEY",
    defaultModel: "grok-4-20",
    docsUrl: "https://console.x.ai",
  },
  deepseek: {
    label: "DeepSeek",
    flagship: "DeepSeek V3 / R1",
    pitch: "Cheapest for code generation. OpenAI-compatible API.",
    envKey: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
  groq: {
    label: "Groq",
    flagship: "LLaMA 3.3 70B",
    pitch: "Fastest inference — 500+ tokens/sec. Great for real-time UX.",
    envKey: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    docsUrl: "https://console.groq.com/keys",
  },
  mistral: {
    label: "Mistral",
    flagship: "Mistral Small 4",
    pitch: "Open-weight Apache 2.0. Strong coder. Self-hostable.",
    envKey: "MISTRAL_API_KEY",
    defaultModel: "mistral-small-latest",
    docsUrl: "https://console.mistral.ai/api-keys",
  },
  // ── Cloud-managed providers ───────────────────────────────────────────────
  bedrock: {
    label: "AWS Bedrock",
    flagship: "Claude 3.5 / Nova Pro / Llama 3.3",
    pitch: "Data never leaves your AWS region. Billed through AWS credits. SOC 2 + HIPAA.",
    envKey: "AWS_ACCESS_KEY_ID",
    defaultModel: "bedrock-nova-pro",
    docsUrl: "https://console.aws.amazon.com/bedrock",
    cloudManaged: true,
    cloudProvider: "aws",
  },
  vertex: {
    label: "Google Vertex AI",
    flagship: "Gemini 2.0 Flash / Pro",
    pitch: "Gemini & Claude on GCP. Data residency + VPC Service Controls.",
    envKey: "GOOGLE_VERTEX_PROJECT",
    defaultModel: "vertex-gemini-flash",
    docsUrl: "https://console.cloud.google.com/vertex-ai",
    cloudManaged: true,
    cloudProvider: "gcp",
  },
  "azure-openai": {
    label: "Azure OpenAI",
    flagship: "GPT-4o on Azure",
    pitch: "Enterprise compliance — EU data boundary, HIPAA, FedRAMP. Billed through Azure.",
    envKey: "AZURE_OPENAI_API_KEY",
    defaultModel: "azure-gpt-4o-mini",
    docsUrl: "https://portal.azure.com/#view/Microsoft_Azure_AI",
    cloudManaged: true,
    cloudProvider: "azure",
  },
};

// ---------------------------------------------------------------------------
// Storage provider metadata
// ---------------------------------------------------------------------------

interface StorageProviderMeta {
  label: string;
  pitch: string;
  envKeys: string[];
  docsUrl: string;
}

const STORAGE_PROVIDERS: Record<StorageProvider, StorageProviderMeta> = {
  "vercel-blob": {
    label: "Vercel Blob",
    pitch: "Zero config on Vercel. One env var. Ideal for getting started fast.",
    envKeys: ["BLOB_READ_WRITE_TOKEN"],
    docsUrl: "https://vercel.com/docs/storage/vercel-blob",
  },
  s3: {
    label: "AWS S3",
    pitch: "Industry standard. Works with R2, MinIO, and any S3-compatible service.",
    envKeys: ["STORAGE_ACCESS_KEY_ID", "STORAGE_SECRET_ACCESS_KEY", "STORAGE_BUCKET"],
    docsUrl: "https://s3.console.aws.amazon.com",
  },
  gcs: {
    label: "Google Cloud Storage",
    pitch: "Best for GCP-native apps. Excellent global performance and pricing.",
    envKeys: ["GCS_BUCKET", "GCS_PROJECT_ID", "GCS_CREDENTIALS_JSON"],
    docsUrl: "https://console.cloud.google.com/storage",
  },
  "azure-blob": {
    label: "Azure Blob Storage",
    pitch: "Native fit for Azure deployments. Integrates with Azure CDN and RBAC.",
    envKeys: ["AZURE_STORAGE_ACCOUNT", "AZURE_STORAGE_ACCOUNT_KEY", "AZURE_STORAGE_CONTAINER"],
    docsUrl: "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts",
  },
  supabase: {
    label: "Supabase Storage",
    pitch: "Bundled with Supabase. Row-level security + image transforms included.",
    envKeys: ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "STORAGE_BUCKET"],
    docsUrl: "https://supabase.com/docs/guides/storage",
  },
};

// ---------------------------------------------------------------------------
// Default (recommended) stack
// ---------------------------------------------------------------------------

const DEFAULTS: StackSelection = {
  database: "neon",
  auth: "clerk",
  payments: "stripe",
  deploy: "vercel",
  email: "resend",
  aiProvider: "openai",
  storageProvider: "vercel-blob",
};

// ---------------------------------------------------------------------------
// Interactive prompts
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Env var definitions (exported so index.ts can use them)
// ---------------------------------------------------------------------------

export interface EnvVar {
  key: string;
  prompt: string;
  hint?: string;
  default?: string;
  secret?: boolean;
}

export function getEnvVarsForStack(stack: StackSelection): EnvVar[] {
  const vars: EnvVar[] = [];

  switch (stack.database) {
    case "neon":
      vars.push({ key: "DATABASE_URL", prompt: "Enter your Neon database URL", hint: "get one free at neon.tech" });
      break;
    case "supabase":
      vars.push(
        { key: "SUPABASE_URL", prompt: "Enter your Supabase project URL", hint: "get one at supabase.com" },
        { key: "SUPABASE_ANON_KEY", prompt: "Enter your Supabase anon key", secret: true },
      );
      break;
  }

  switch (stack.auth) {
    case "clerk":
      vars.push(
        { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", prompt: "Enter your Clerk publishable key", hint: "get one at clerk.com" },
        { key: "CLERK_SECRET_KEY", prompt: "Enter your Clerk secret key", secret: true },
        { key: "CLERK_WEBHOOK_SECRET", prompt: "Enter your Clerk webhook secret", hint: "set up in Clerk Dashboard → Webhooks", secret: true },
      );
      break;
    case "supabase":
      break;
    case "nextauth":
      // AUTH_SECRET and OAuth vars are injected by index.ts for nextauth
      break;
  }

  switch (stack.payments) {
    case "stripe":
      vars.push(
        { key: "STRIPE_SECRET_KEY", prompt: "Enter your Stripe secret key", hint: "dashboard.stripe.com/apikeys", secret: true },
        { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", prompt: "Enter your Stripe publishable key", hint: "dashboard.stripe.com/apikeys" },
        { key: "STRIPE_WEBHOOK_SECRET", prompt: "Enter your Stripe webhook secret", secret: true },
      );
      break;
    case "lemonsqueezy":
      vars.push(
        { key: "LEMONSQUEEZY_API_KEY", prompt: "Enter your Lemon Squeezy API key", secret: true },
        { key: "LEMONSQUEEZY_STORE_ID", prompt: "Enter your Lemon Squeezy store ID" },
        { key: "LEMONSQUEEZY_WEBHOOK_SECRET", prompt: "Enter your Lemon Squeezy webhook secret", secret: true },
      );
      break;
    case "paddle":
      vars.push(
        { key: "PADDLE_API_KEY", prompt: "Enter your Paddle API key", secret: true },
        { key: "PADDLE_WEBHOOK_SECRET", prompt: "Enter your Paddle webhook secret", secret: true },
      );
      break;
  }

  if (stack.email === "resend") {
    vars.push({ key: "RESEND_API_KEY", prompt: "Enter your Resend API key", hint: "resend.com/api-keys", secret: true });
  } else if (stack.email === "postmark") {
    vars.push({ key: "POSTMARK_API_TOKEN", prompt: "Enter your Postmark API token", secret: true });
  }

  vars.push({ key: "NEXT_PUBLIC_POSTHOG_KEY", prompt: "Enter your PostHog project API key", hint: "app.posthog.com" });
  vars.push({ key: "NEXT_PUBLIC_APP_URL", prompt: "Enter your app URL", default: "http://localhost:3000" });

  return vars;
}

// ---------------------------------------------------------------------------
// Flags interface (passed from CLI)
// ---------------------------------------------------------------------------

export interface StackFlags {
  db?: string;
  auth?: string;
  payments?: string;
}

export async function promptStack(flags: StackFlags = {}): Promise<StackSelection> {
  console.log(chalk.bold("  Choose your tech stack\n"));

  // If any flags were passed, skip the approach selector and go straight to custom
  const hasFlags = !!(flags.db || flags.auth || flags.payments);

  let approach = "custom";
  if (!hasFlags) {
    const result = await prompts(
      {
        type: "select",
        name: "approach",
        message: "Choose your setup approach",
        choices: [
          {
            title: "Recommended  " + chalk.gray("Neon · Clerk · Stripe · OpenAI · Vercel · Vercel Blob · Resend"),
            value: "recommended",
          },
          { title: "Custom       " + chalk.gray("choose each provider"), value: "custom" },
        ],
      },
      { onCancel: () => process.exit(0) }
    );
    approach = result.approach as string;
  }

  if (approach === "recommended") {
    console.log(
      chalk.green("\n  ✔ Recommended: Neon · Clerk · Stripe · OpenAI (GPT-5.4) · Vercel · Vercel Blob · Resend\n")
    );
    return { ...DEFAULTS };
  }

  // ── Custom: Database ──────────────────────────────────────────────────────
  const { database } = await prompts(
    {
      type: "select",
      name: "database",
      message: "Database",
      choices: [
        { title: "Neon         " + chalk.gray("serverless Postgres, branching, generous free tier"), value: "neon" },
        { title: "Supabase     " + chalk.gray("Postgres + auto APIs + auth + realtime"), value: "supabase" },
      ],
      initial: flags.db === "supabase" ? 1 : 0,
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: Auth ──────────────────────────────────────────────────────────
  const { auth } = await prompts(
    {
      type: "select",
      name: "auth",
      message: "Authentication",
      choices: [
        { title: "Clerk        " + chalk.gray("best DX, pre-built UI, orgs + RBAC"), value: "clerk" },
        { title: "NextAuth v5  " + chalk.gray("open source, self-hosted, any OAuth provider"), value: "nextauth" },
        { title: "Supabase     " + chalk.gray("bundled with Supabase DB, row-level security"), value: "supabase" },
      ],
      initial: flags.auth === "nextauth" ? 1 : flags.auth === "supabase" ? 2 : 0,
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: Payments ──────────────────────────────────────────────────────
  const { payments } = await prompts(
    {
      type: "select",
      name: "payments",
      message: "Payments",
      choices: [
        { title: "Stripe         " + chalk.gray("most flexible  ·  2.9% + $0.30"), value: "stripe" },
        { title: "Lemon Squeezy  " + chalk.gray("Merchant of Record, handles taxes  ·  5% + $0.50"), value: "lemonsqueezy" },
        { title: "Paddle         " + chalk.gray("Merchant of Record, global compliance  ·  5% + $0.50"), value: "paddle" },
      ],
      initial: flags.payments === "lemonsqueezy" ? 1 : flags.payments === "paddle" ? 2 : 0,
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: AI Provider ───────────────────────────────────────────────────
  const { aiProvider } = await prompts(
    {
      type: "select",
      name: "aiProvider",
      message: "AI provider  " + chalk.gray("(default — you can use any provider at runtime)"),
      choices: [
        // Direct providers
        {
          title: `OpenAI          ${chalk.gray("GPT-5.4 · best all-rounder, leads benchmarks")}`,
          value: "openai",
        },
        {
          title: `Anthropic       ${chalk.gray("Claude Sonnet 4.6 · best for coding & agents")}`,
          value: "anthropic",
        },
        {
          title: `Google Gemini   ${chalk.gray("Gemini 3.1 Flash · cheapest at scale, 1M ctx, free dev tier")}`,
          value: "google",
        },
        {
          title: `Perplexity      ${chalk.gray("Sonar Pro · web-grounded answers with live citations")}`,
          value: "perplexity",
        },
        {
          title: `xAI / Grok      ${chalk.gray("Grok 4.20 · real-time web access, 4-agent deliberation")}`,
          value: "xai",
        },
        {
          title: `DeepSeek        ${chalk.gray("DeepSeek V3 · cheapest for code, OpenAI-compatible")}`,
          value: "deepseek",
        },
        {
          title: `Groq            ${chalk.gray("LLaMA 3.3 70B · 500+ tok/s, fastest inference")}`,
          value: "groq",
        },
        {
          title: `Mistral         ${chalk.gray("Mistral Small 4 · open-weight Apache 2.0, self-hostable")}`,
          value: "mistral",
        },
        // Cloud-managed providers
        {
          title: `AWS Bedrock     ${chalk.gray("Claude / Nova Pro / Llama · data stays in your AWS region")}`,
          value: "bedrock",
        },
        {
          title: `Google Vertex   ${chalk.gray("Gemini 2.0 / Claude · GCP data residency + VPC controls")}`,
          value: "vertex",
        },
        {
          title: `Azure OpenAI    ${chalk.gray("GPT-4o on Azure · enterprise compliance, EU data boundary")}`,
          value: "azure-openai",
        },
      ],
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: Storage ───────────────────────────────────────────────────────
  const { storageProvider } = await prompts(
    {
      type: "select",
      name: "storageProvider",
      message: "File storage",
      choices: [
        { title: "Vercel Blob  " + chalk.gray("zero-config on Vercel, one env var"), value: "vercel-blob" },
        { title: "AWS S3       " + chalk.gray("industry standard · also works with R2 & MinIO"), value: "s3" },
        { title: "Google GCS   " + chalk.gray("best for GCP · excellent global perf"), value: "gcs" },
        { title: "Azure Blob   " + chalk.gray("native for Azure · integrates with Azure CDN"), value: "azure-blob" },
        { title: "Supabase     " + chalk.gray("bundled storage if you're already on Supabase"), value: "supabase" },
      ],
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: Deploy ────────────────────────────────────────────────────────
  const { deploy } = await prompts(
    {
      type: "select",
      name: "deploy",
      message: "Deploy target",
      choices: [
        { title: "Vercel       " + chalk.gray("recommended for Next.js, zero-config"), value: "vercel" },
        { title: "Cloudflare   " + chalk.gray("cheapest at scale, edge runtime"), value: "cloudflare" },
        { title: "Docker       " + chalk.gray("self-hosted: Railway, Fly.io, AWS, GCP, Azure"), value: "docker" },
      ],
    },
    { onCancel: () => process.exit(0) }
  );

  // ── Custom: Email ─────────────────────────────────────────────────────────
  const { email } = await prompts(
    {
      type: "select",
      name: "email",
      message: "Email",
      choices: [
        { title: "Resend       " + chalk.gray("React Email templates, 3k/month free"), value: "resend" },
        { title: "Postmark     " + chalk.gray("best deliverability, $15/month for 10k"), value: "postmark" },
        { title: "Skip         " + chalk.gray("set up later"), value: "null" },
      ],
    },
    { onCancel: () => process.exit(0) }
  );

  const selection: StackSelection = {
    database: database as DatabaseProvider,
    auth: auth as AuthProvider,
    payments: payments as PaymentProvider,
    deploy: deploy as DeployTarget,
    email: email === "null" ? null : (email as EmailProvider),
    aiProvider: aiProvider as AIProvider,
    storageProvider: storageProvider as StorageProvider,
  };

  // Validation
  if (selection.auth === "supabase" && selection.database !== "supabase") {
    console.log(chalk.yellow("\n  ⚠ Supabase Auth requires Supabase DB. Switching database to Supabase.\n"));
    selection.database = "supabase";
  }

  // Auto-suggest matching storage for cloud AI choices
  if (selection.aiProvider === "bedrock" && selection.storageProvider === "vercel-blob") {
    console.log(chalk.gray("\n  💡 Tip: Since you chose AWS Bedrock, AWS S3 is a natural fit for storage.\n"));
  }
  if (selection.aiProvider === "vertex" && selection.storageProvider === "vercel-blob") {
    console.log(chalk.gray("\n  💡 Tip: Since you chose Vertex AI, Google Cloud Storage keeps everything in GCP.\n"));
  }
  if (selection.aiProvider === "azure-openai" && selection.storageProvider === "vercel-blob") {
    console.log(chalk.gray("\n  💡 Tip: Since you chose Azure OpenAI, Azure Blob Storage keeps everything in Azure.\n"));
  }

  // Summary
  const meta = AI_PROVIDERS[selection.aiProvider];
  const storageMeta = STORAGE_PROVIDERS[selection.storageProvider];
  console.log();
  console.log(chalk.bold("  Your stack:"));
  console.log(`    ${chalk.gray("Database:")}   ${chalk.cyan(selection.database)}`);
  console.log(`    ${chalk.gray("Auth:")}       ${chalk.cyan(selection.auth)}`);
  console.log(`    ${chalk.gray("Payments:")}   ${chalk.cyan(selection.payments)}`);
  console.log(`    ${chalk.gray("AI:")}         ${chalk.cyan(meta.label)} ${chalk.gray(`(${meta.flagship})`)}${meta.cloudManaged ? chalk.yellow(" ☁ cloud-managed") : ""}`);
  console.log(`    ${chalk.gray("Storage:")}    ${chalk.cyan(storageMeta.label)}`);
  console.log(`    ${chalk.gray("Deploy:")}     ${chalk.cyan(selection.deploy)}`);
  console.log(`    ${chalk.gray("Email:")}      ${chalk.cyan(selection.email ?? "none")}`);
  console.log();

  return selection;
}

// ---------------------------------------------------------------------------
// Generate launchkit.config.ts
// ---------------------------------------------------------------------------

export function generateConfigFile(stack: StackSelection): string {
  return `import type { StackConfig } from '@launchkit/config';

const config: StackConfig = {
  database: '${stack.database}',
  auth: '${stack.auth}',
  payments: '${stack.payments}',
  deploy: '${stack.deploy}',
  email: ${stack.email === null ? "null" : `'${stack.email}'`},
  analytics: 'posthog',
  realtime: null,
  aiProvider: '${stack.aiProvider}',
  storageProvider: '${stack.storageProvider}',
};

export default config;
`;
}

// ---------------------------------------------------------------------------
// Generate .env.example
// ---------------------------------------------------------------------------

export function generateEnvExample(stack: StackSelection): string {
  const lines: string[] = [
    "# Generated by create-launchkit  https://getlaunchkit.app",
    "",
  ];

  // Database
  switch (stack.database) {
    case "neon":
      lines.push("# ── Database (Neon) ───────────────────────────────────────────────────────", "DATABASE_URL=", "");
      break;
    case "supabase":
      lines.push("# ── Database (Supabase) ───────────────────────────────────────────────────", "SUPABASE_URL=", "SUPABASE_ANON_KEY=", "SUPABASE_SERVICE_ROLE_KEY=", "");
      break;
    case "firebase":
      lines.push("# ── Database (Firebase) ───────────────────────────────────────────────────", "FIREBASE_PROJECT_ID=", "FIREBASE_CLIENT_EMAIL=", "FIREBASE_PRIVATE_KEY=", "");
      break;
  }

  // Auth
  switch (stack.auth) {
    case "clerk":
      lines.push(
        "# ── Auth (Clerk) ─────────────────────────────────────────────────────────",
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
        "CLERK_SECRET_KEY=",
        "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in",
        "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up",
        "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard",
        "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard",
        ""
      );
      break;
    case "supabase":
      lines.push("# ── Auth (Supabase — uses SUPABASE_URL and SUPABASE_ANON_KEY above)", "");
      break;
    case "nextauth":
      lines.push(
        "# ── Auth (NextAuth) ──────────────────────────────────────────────────────",
        "NEXTAUTH_URL=http://localhost:3000",
        "NEXTAUTH_SECRET=  # openssl rand -base64 32",
        ""
      );
      break;
  }

  // Payments
  switch (stack.payments) {
    case "stripe":
      lines.push(
        "# ── Payments (Stripe) ────────────────────────────────────────────────────",
        "STRIPE_SECRET_KEY=",
        "STRIPE_WEBHOOK_SECRET=",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=",
        "STRIPE_PRO_MONTHLY_PRICE_ID=",
        "STRIPE_PRO_YEARLY_PRICE_ID=",
        "STRIPE_TEAM_MONTHLY_PRICE_ID=",
        "STRIPE_TEAM_YEARLY_PRICE_ID=",
        ""
      );
      break;
    case "lemonsqueezy":
      lines.push(
        "# ── Payments (Lemon Squeezy) ─────────────────────────────────────────────",
        "LEMONSQUEEZY_API_KEY=",
        "LEMONSQUEEZY_STORE_ID=",
        "LEMONSQUEEZY_WEBHOOK_SECRET=",
        ""
      );
      break;
    case "paddle":
      lines.push(
        "# ── Payments (Paddle) ────────────────────────────────────────────────────",
        "PADDLE_API_KEY=",
        "PADDLE_WEBHOOK_SECRET=",
        "PADDLE_ENVIRONMENT=sandbox",
        ""
      );
      break;
  }

  // AI provider
  const meta = AI_PROVIDERS[stack.aiProvider];
  lines.push(`# ── AI (${meta.label}) ${"─".repeat(Math.max(0, 71 - meta.label.length - 8))}`);

  if (stack.aiProvider === "bedrock") {
    lines.push(
      "AWS_ACCESS_KEY_ID=",
      "AWS_SECRET_ACCESS_KEY=",
      `AWS_REGION=us-east-1  # ${meta.docsUrl}`,
      `AI_DEFAULT_PROVIDER=bedrock`,
      `AI_DEFAULT_MODEL=bedrock-nova-pro`,
      ""
    );
  } else if (stack.aiProvider === "vertex") {
    lines.push(
      `GOOGLE_VERTEX_PROJECT=   # ${meta.docsUrl}`,
      "GOOGLE_VERTEX_LOCATION=us-central1",
      "GCS_CREDENTIALS_JSON=  # base64-encoded service account JSON",
      `AI_DEFAULT_PROVIDER=vertex`,
      `AI_DEFAULT_MODEL=vertex-gemini-flash`,
      ""
    );
  } else if (stack.aiProvider === "azure-openai") {
    lines.push(
      `AZURE_OPENAI_API_KEY=   # ${meta.docsUrl}`,
      "AZURE_OPENAI_RESOURCE_NAME=  # e.g. my-azure-openai",
      "AZURE_OPENAI_DEPLOYMENT_GPT4O=gpt-4o",
      "AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI=gpt-4o-mini",
      `AI_DEFAULT_PROVIDER=azure-openai`,
      `AI_DEFAULT_MODEL=azure-gpt-4o-mini`,
      ""
    );
  } else {
    lines.push(
      `${meta.envKey}=  # ${meta.docsUrl}`,
      `AI_DEFAULT_PROVIDER=${stack.aiProvider}`,
      `AI_DEFAULT_MODEL=${meta.defaultModel}`,
      ""
    );
  }

  // Other AI providers (commented out)
  const directProviders: AIProvider[] = ["openai", "anthropic", "google", "perplexity", "xai", "deepseek", "groq", "mistral"];
  const others = directProviders.filter((p) => p !== stack.aiProvider);
  lines.push("# ── Additional AI Providers (uncomment to enable) ────────────────────────");
  for (const p of others) {
    const m = AI_PROVIDERS[p];
    lines.push(`# ${m.envKey}=  # ${m.docsUrl}`);
  }
  lines.push("# --- Cloud-managed (data stays in your cloud) ---");
  const cloudProviders: AIProvider[] = ["bedrock", "vertex", "azure-openai"];
  for (const p of cloudProviders) {
    if (p !== stack.aiProvider) {
      const m = AI_PROVIDERS[p];
      lines.push(`# ${m.envKey}=  # ${m.docsUrl}`);
    }
  }
  lines.push("");

  // Storage provider
  const storageMeta = STORAGE_PROVIDERS[stack.storageProvider];
  lines.push(`# ── Storage (${storageMeta.label}) ${"─".repeat(Math.max(0, 63 - storageMeta.label.length - 12))}`);
  lines.push(`STORAGE_PROVIDER=${stack.storageProvider}`);
  for (const key of storageMeta.envKeys) {
    lines.push(`${key}=`);
  }
  lines.push(`# Docs: ${storageMeta.docsUrl}`, "");

  // Email
  switch (stack.email) {
    case "resend":
      lines.push("# ── Email (Resend) ───────────────────────────────────────────────────────", "RESEND_API_KEY=", "EMAIL_FROM=LaunchKit <hello@yourdomain.com>", "");
      break;
    case "postmark":
      lines.push("# ── Email (Postmark) ─────────────────────────────────────────────────────", "POSTMARK_API_TOKEN=", "EMAIL_FROM=LaunchKit <hello@yourdomain.com>", "");
      break;
  }

  // Common
  lines.push(
    "# ── App ──────────────────────────────────────────────────────────────────",
    "NEXT_PUBLIC_APP_URL=http://localhost:3000",
    "NEXT_PUBLIC_APP_NAME=My SaaS App",
    "",
    "# ── Analytics (PostHog) ──────────────────────────────────────────────────",
    "NEXT_PUBLIC_POSTHOG_KEY=",
    "NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com",
    ""
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Setup instructions
// ---------------------------------------------------------------------------

export function printSetupInstructions(stack: StackSelection): void {
  console.log(chalk.bold("  Setup links for your stack:\n"));

  const dbLinks: Record<string, string> = {
    neon: "https://neon.tech",
    supabase: "https://supabase.com",
    firebase: "https://console.firebase.google.com",
  };

  const authLinks: Record<string, string> = {
    clerk: "https://clerk.com",
    supabase: "(use same Supabase project)",
    nextauth: "generate secret: openssl rand -base64 32",
  };

  const payLinks: Record<string, string> = {
    stripe: "https://dashboard.stripe.com/apikeys",
    lemonsqueezy: "https://app.lemonsqueezy.com/settings/api",
    paddle: "https://vendors.paddle.com/authentication",
  };

  const meta = AI_PROVIDERS[stack.aiProvider];
  const storageMeta = STORAGE_PROVIDERS[stack.storageProvider];

  console.log(`  ${chalk.cyan("Database:")}  ${chalk.underline(dbLinks[stack.database])}`);
  console.log(`  ${chalk.cyan("Auth:")}      ${chalk.underline(authLinks[stack.auth])}`);
  console.log(`  ${chalk.cyan("Payments:")}  ${chalk.underline(payLinks[stack.payments])}`);
  console.log(`  ${chalk.cyan("AI:")}        ${chalk.underline(meta.docsUrl)}  ${chalk.gray(`(${meta.flagship})`)}${meta.cloudManaged ? chalk.yellow(" ☁") : ""}`);
  console.log(`  ${chalk.cyan("Storage:")}   ${chalk.underline(storageMeta.docsUrl)}`);

  if (stack.email === "resend") {
    console.log(`  ${chalk.cyan("Email:")}     ${chalk.underline("https://resend.com")}  ${chalk.gray("3k/month free")}`);
  } else if (stack.email === "postmark") {
    console.log(`  ${chalk.cyan("Email:")}     ${chalk.underline("https://postmarkapp.com")}`);
  }

  console.log();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export interface AIEnvVar {
  key: string;
  provider: AIProvider;
  prompt: string;
  hint: string;
}

export function getAIEnvVar(provider: AIProvider): AIEnvVar {
  const meta = AI_PROVIDERS[provider];
  return {
    key: meta.envKey,
    provider,
    prompt: `Enter your ${meta.label} API key`,
    hint: meta.docsUrl,
  };
}

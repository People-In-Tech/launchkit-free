/**
 * lib/ai.ts — Multi-provider AI factory for LaunchKit
 *
 * Supports 11 providers (8 direct + 3 cloud-managed) via the Vercel AI SDK.
 * The default provider is set via AI_DEFAULT_PROVIDER env var (launchkit.config.ts).
 *
 * Direct providers (call their API directly):
 *   openai      → GPT-5.4 / GPT-5.4 mini       (best all-rounder)
 *   anthropic   → Claude Sonnet 4.6 / Opus 4.6 (best for coding & agents)
 *   google      → Gemini 3.1 Flash / Pro        (cheapest at scale, 1M ctx)
 *   perplexity  → Sonar Pro / Sonar             (web-grounded with citations)
 *   xai         → Grok 4.20                     (real-time web, 4-agent)
 *   deepseek    → DeepSeek V3 / R1              (cheapest for code)
 *   groq        → LLaMA 3.3 70B                 (fastest inference)
 *   mistral     → Mistral Small 4               (open-weight Apache 2.0)
 *
 * Cloud-managed providers (data stays in your cloud, billed through cloud credits):
 *   bedrock     → Claude 3.5 / Nova Pro / Llama 3.3 on AWS   (data residency)
 *   vertex      → Gemini 2.0 / Claude on GCP Vertex AI        (data residency)
 *   azure-openai → GPT-4o on Azure OpenAI Service             (enterprise compliance)
 *
 * Usage:
 *   import { getModel, MODELS } from '@/lib/ai';
 *   const model = getModel('claude-sonnet-4-6');
 *   const result = await streamText({ model, messages });
 */

import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createVertex } from "@ai-sdk/google-vertex";
import { createAzure } from "@ai-sdk/azure";
import type { LanguageModel } from "ai";

// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

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

export interface ModelConfig {
  id: string;
  provider: AIProvider;
  label: string;
  contextWindow: number;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsWebSearch: boolean;
  /** Rough cost tier: 1=cheapest, 5=most expensive */
  costTier: 1 | 2 | 3 | 4 | 5;
  /** True for cloud-managed providers (Bedrock, Vertex, Azure) */
  cloudManaged?: boolean;
}

// ---------------------------------------------------------------------------
// Model registry — current as of April 2026
// ---------------------------------------------------------------------------

export const MODELS: Record<string, ModelConfig> = {
  // ── OpenAI ────────────────────────────────────────────────────────────────
  "gpt-5.4": {
    id: "gpt-5.4",
    provider: "openai",
    label: "GPT-5.4",
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 5,
  },
  "gpt-5.4-mini": {
    id: "gpt-5.4-mini",
    provider: "openai",
    label: "GPT-5.4 mini",
    contextWindow: 128_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 2,
  },

  // ── Anthropic ─────────────────────────────────────────────────────────────
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 3,
  },
  "claude-opus-4-6": {
    id: "claude-opus-4-6",
    provider: "anthropic",
    label: "Claude Opus 4.6",
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 5,
  },

  // ── Google ────────────────────────────────────────────────────────────────
  "gemini-3.1-flash": {
    id: "gemini-3.1-flash",
    provider: "google",
    label: "Gemini 3.1 Flash",
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
  },
  "gemini-3.1-pro": {
    id: "gemini-3.1-pro",
    provider: "google",
    label: "Gemini 3.1 Pro",
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 4,
  },

  // ── Perplexity (Sonar — web-grounded, returns citations) ──────────────────
  "sonar-pro": {
    id: "sonar-pro",
    provider: "perplexity",
    label: "Sonar Pro",
    contextWindow: 200_000,
    supportsVision: false,
    supportsTools: false,
    supportsWebSearch: true,
    costTier: 3,
  },
  "sonar": {
    id: "sonar",
    provider: "perplexity",
    label: "Sonar",
    contextWindow: 128_000,
    supportsVision: false,
    supportsTools: false,
    supportsWebSearch: true,
    costTier: 2,
  },

  // ── xAI Grok ──────────────────────────────────────────────────────────────
  "grok-4-20": {
    id: "grok-4-20",
    provider: "xai",
    label: "Grok 4.20",
    contextWindow: 131_072,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: true,
    costTier: 3,
  },

  // ── DeepSeek ──────────────────────────────────────────────────────────────
  "deepseek-chat": {
    id: "deepseek-chat",
    provider: "deepseek",
    label: "DeepSeek V3",
    contextWindow: 128_000,
    supportsVision: false,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    provider: "deepseek",
    label: "DeepSeek R1",
    contextWindow: 64_000,
    supportsVision: false,
    supportsTools: false,
    supportsWebSearch: false,
    costTier: 2,
  },

  // ── Groq ──────────────────────────────────────────────────────────────────
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    provider: "groq",
    label: "LLaMA 3.3 70B (Groq)",
    contextWindow: 128_000,
    supportsVision: false,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
  },

  // ── Mistral ───────────────────────────────────────────────────────────────
  "mistral-small-latest": {
    id: "mistral-small-latest",
    provider: "mistral",
    label: "Mistral Small 4",
    contextWindow: 128_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
  },

  // ── AWS Bedrock ───────────────────────────────────────────────────────────
  // Data never leaves your AWS region. Billed through AWS credits.
  // Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  "bedrock-claude-sonnet": {
    id: "bedrock-claude-sonnet",
    provider: "bedrock",
    label: "Claude 3.5 Sonnet (Bedrock)",
    contextWindow: 200_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 3,
    cloudManaged: true,
  },
  "bedrock-nova-pro": {
    id: "bedrock-nova-pro",
    provider: "bedrock",
    label: "Amazon Nova Pro (Bedrock)",
    contextWindow: 300_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 2,
    cloudManaged: true,
  },
  "bedrock-llama3": {
    id: "bedrock-llama3",
    provider: "bedrock",
    label: "Llama 3.3 70B (Bedrock)",
    contextWindow: 128_000,
    supportsVision: false,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
    cloudManaged: true,
  },

  // ── Google Vertex AI ──────────────────────────────────────────────────────
  // Data stays in your GCP region. Billed through GCP credits.
  // Requires: GOOGLE_VERTEX_PROJECT, GOOGLE_VERTEX_LOCATION, GCS_CREDENTIALS_JSON
  "vertex-gemini-flash": {
    id: "vertex-gemini-flash",
    provider: "vertex",
    label: "Gemini 2.0 Flash (Vertex)",
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
    cloudManaged: true,
  },
  "vertex-gemini-pro": {
    id: "vertex-gemini-pro",
    provider: "vertex",
    label: "Gemini 2.0 Pro (Vertex)",
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 4,
    cloudManaged: true,
  },
  "vertex-claude": {
    id: "vertex-claude",
    provider: "vertex",
    label: "Claude Sonnet (Vertex)",
    contextWindow: 200_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 3,
    cloudManaged: true,
  },

  // ── Azure OpenAI ──────────────────────────────────────────────────────────
  // Enterprise compliance (SOC 2, HIPAA, EU data boundary).
  // Requires: AZURE_OPENAI_API_KEY, AZURE_OPENAI_RESOURCE_NAME
  // Deployment names (AZURE_OPENAI_DEPLOYMENT_*) must match your Azure Portal config.
  "azure-gpt-4o": {
    id: "azure-gpt-4o",
    provider: "azure-openai",
    label: "GPT-4o (Azure)",
    contextWindow: 128_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 3,
    cloudManaged: true,
  },
  "azure-gpt-4o-mini": {
    id: "azure-gpt-4o-mini",
    provider: "azure-openai",
    label: "GPT-4o mini (Azure)",
    contextWindow: 128_000,
    supportsVision: true,
    supportsTools: true,
    supportsWebSearch: false,
    costTier: 1,
    cloudManaged: true,
  },
};

// ---------------------------------------------------------------------------
// Bedrock model ID mapping (our internal ID → AWS Bedrock model ID)
// ---------------------------------------------------------------------------

const BEDROCK_MODEL_IDS: Record<string, string> = {
  "bedrock-claude-sonnet": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "bedrock-nova-pro": "amazon.nova-pro-v1:0",
  "bedrock-llama3": "meta.llama3-3-70b-instruct-v1:0",
};

// Vertex AI model ID mapping
const VERTEX_MODEL_IDS: Record<string, string> = {
  "vertex-gemini-flash": "gemini-2.0-flash-001",
  "vertex-gemini-pro": "gemini-2.0-pro",
  "vertex-claude": "claude-sonnet-4-5@20250514",
};

// Azure deployment name mapping (env vars override these defaults)
const AZURE_DEPLOYMENT_IDS: Record<string, string> = {
  "azure-gpt-4o": process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O ?? "gpt-4o",
  "azure-gpt-4o-mini": process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI ?? "gpt-4o-mini",
};

// ---------------------------------------------------------------------------
// Lazy-initialized provider clients
// ---------------------------------------------------------------------------

let _perplexity: ReturnType<typeof createOpenAI> | null = null;
let _xai: ReturnType<typeof createOpenAI> | null = null;
let _deepseek: ReturnType<typeof createOpenAI> | null = null;
let _groq: ReturnType<typeof createOpenAI> | null = null;
let _mistral: ReturnType<typeof createOpenAI> | null = null;
let _bedrock: ReturnType<typeof createAmazonBedrock> | null = null;
let _vertex: ReturnType<typeof createVertex> | null = null;
let _azure: ReturnType<typeof createAzure> | null = null;

function getPerplexity() {
  if (!_perplexity) {
    _perplexity = createOpenAI({
      name: "perplexity",
      apiKey: process.env.PERPLEXITY_API_KEY ?? "",
      baseURL: "https://api.perplexity.ai",
    });
  }
  return _perplexity;
}

function getXAI() {
  if (!_xai) {
    _xai = createOpenAI({
      name: "xai",
      apiKey: process.env.XAI_API_KEY ?? "",
      baseURL: "https://api.x.ai/v1",
    });
  }
  return _xai;
}

function getDeepSeek() {
  if (!_deepseek) {
    _deepseek = createOpenAI({
      name: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY ?? "",
      baseURL: "https://api.deepseek.com/v1",
    });
  }
  return _deepseek;
}

function getGroq() {
  if (!_groq) {
    _groq = createOpenAI({
      name: "groq",
      apiKey: process.env.GROQ_API_KEY ?? "",
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _groq;
}

function getMistral() {
  if (!_mistral) {
    _mistral = createOpenAI({
      name: "mistral",
      apiKey: process.env.MISTRAL_API_KEY ?? "",
      baseURL: "https://api.mistral.ai/v1",
    });
  }
  return _mistral;
}

function getBedrock() {
  if (!_bedrock) {
    _bedrock = createAmazonBedrock({
      region: process.env.AWS_REGION ?? "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    });
  }
  return _bedrock;
}

function getVertex() {
  if (!_vertex) {
    const credentialsJson = process.env.GCS_CREDENTIALS_JSON;
    const googleAuthOptions = credentialsJson
      ? { credentials: JSON.parse(Buffer.from(credentialsJson, "base64").toString("utf-8")) }
      : undefined;

    _vertex = createVertex({
      project: process.env.GOOGLE_VERTEX_PROJECT ?? "",
      location: process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1",
      googleAuthOptions,
    });
  }
  return _vertex;
}

function getAzure() {
  if (!_azure) {
    _azure = createAzure({
      resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME ?? "",
      apiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
    });
  }
  return _azure;
}

// ---------------------------------------------------------------------------
// Main factory — call this with any model ID
// ---------------------------------------------------------------------------

export function getModel(modelId: string): LanguageModel {
  const config = MODELS[modelId];

  if (!config) {
    console.warn(`[ai] Unknown model "${modelId}" — falling back to gpt-5.4-mini`);
    return openai("gpt-5.4-mini") as unknown as LanguageModel;
  }

  switch (config.provider) {
    case "openai":
      return openai(modelId) as unknown as LanguageModel;

    case "anthropic":
      return anthropic(modelId) as unknown as LanguageModel;

    case "google":
      return google(modelId) as unknown as LanguageModel;

    case "perplexity":
      return getPerplexity()(modelId) as unknown as LanguageModel;

    case "xai":
      return getXAI()(modelId) as unknown as LanguageModel;

    case "deepseek":
      return getDeepSeek()(modelId) as unknown as LanguageModel;

    case "groq":
      return getGroq()(modelId) as unknown as LanguageModel;

    case "mistral":
      return getMistral()(modelId) as unknown as LanguageModel;

    case "bedrock": {
      const bedrockModelId = BEDROCK_MODEL_IDS[modelId];
      if (!bedrockModelId) throw new Error(`No Bedrock model ID mapped for "${modelId}"`);
      return getBedrock()(bedrockModelId) as unknown as LanguageModel;
    }

    case "vertex": {
      const vertexModelId = VERTEX_MODEL_IDS[modelId];
      if (!vertexModelId) throw new Error(`No Vertex model ID mapped for "${modelId}"`);
      return getVertex()(vertexModelId) as unknown as LanguageModel;
    }

    case "azure-openai": {
      const deploymentId = AZURE_DEPLOYMENT_IDS[modelId];
      if (!deploymentId) throw new Error(`No Azure deployment ID mapped for "${modelId}"`);
      return getAzure()(deploymentId) as unknown as LanguageModel;
    }

    default:
      return openai("gpt-5.4-mini") as unknown as LanguageModel;
  }
}

// ---------------------------------------------------------------------------
// Default model (from env or config)
// ---------------------------------------------------------------------------

export function getDefaultModel(): LanguageModel {
  const modelId = process.env.AI_DEFAULT_MODEL ?? "gpt-5.4-mini";
  return getModel(modelId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getModelsForProvider(provider: AIProvider): ModelConfig[] {
  return Object.values(MODELS).filter((m) => m.provider === provider);
}

export function getChatModels(): { id: string; label: string; provider: AIProvider }[] {
  return Object.values(MODELS).map(({ id, label, provider }) => ({ id, label, provider }));
}

/** Returns only cloud-managed models (Bedrock, Vertex, Azure) */
export function getCloudManagedModels(): ModelConfig[] {
  return Object.values(MODELS).filter((m) => m.cloudManaged);
}

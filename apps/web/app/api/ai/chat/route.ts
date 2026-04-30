// @ts-nocheck
export const dynamic = "force-dynamic";

import { streamText, type CoreMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { deductCredits, getCredits } from "@/lib/credits";
import { reportAIUsage } from "@/lib/usage-reporting";
import { getModel, getDefaultModel, MODELS } from "@/lib/ai";
import { checkRateLimit, AI_RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/ai/chat
 *
 * Supports all 8 AI providers. Pass `model` in the request body to select:
 *
 *   OpenAI:      gpt-5.4 | gpt-5.4-mini
 *   Anthropic:   claude-sonnet-4-6 | claude-opus-4-6
 *   Google:      gemini-3.1-flash | gemini-3.1-pro
 *   Perplexity:  sonar-pro | sonar           (web-grounded with citations)
 *   xAI:         grok-4-20                   (real-time web access)
 *   DeepSeek:    deepseek-chat | deepseek-reasoner
 *   Groq:        llama-3.3-70b-versatile     (fastest inference)
 *   Mistral:     mistral-small-latest
 *
 * Omit `model` to use AI_DEFAULT_MODEL env var (set from launchkit.config.ts).
 */

// Credit cost per provider (higher = smarter / more expensive models cost more)
const CREDIT_COSTS: Record<string, number> = {
  "gpt-5.4": 5,
  "gpt-5.4-mini": 1,
  "claude-sonnet-4-6": 3,
  "claude-opus-4-6": 5,
  "gemini-3.1-flash": 1,
  "gemini-3.1-pro": 4,
  "sonar-pro": 3,
  "sonar": 2,
  "grok-4-20": 3,
  "deepseek-chat": 1,
  "deepseek-reasoner": 2,
  "llama-3.3-70b-versatile": 1,
  "mistral-small-latest": 1,
};

const DEFAULT_SYSTEM =
  "You are a helpful AI assistant built into this SaaS application. Be concise, clear, and helpful.";

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.chat.limit, AI_RATE_LIMITS.chat.windowMs);
  if (!rateLimit.success) {
    return new Response("Too many requests", { status: 429 });
  }

  const {
    messages,
    model: modelId,
    system = DEFAULT_SYSTEM,
  } = (await req.json()) as {
    messages: CoreMessage[];
    model?: string;
    system?: string;
  };

  // Validate model (fall back to default if unknown)
  const resolvedModelId = modelId && MODELS[modelId] ? modelId : (process.env.AI_DEFAULT_MODEL ?? "gpt-5.4-mini");
  const creditCost = CREDIT_COSTS[resolvedModelId] ?? 1;

  // Check credits
  const balance = await getCredits(userId);
  if (balance < creditCost) {
    return new Response(
      JSON.stringify({
        error: `Insufficient credits. This model costs ${creditCost} credits per message. You have ${balance}.`,
        creditsRequired: creditCost,
        creditsAvailable: balance,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  // Deduct credits
  await deductCredits(userId, creditCost, `AI chat: ${resolvedModelId}`);

  const model = getModel(resolvedModelId);

  const result = streamText({
    model,
    messages,
    system,
    onFinish: async ({ usage }) => {
      if (orgId) {
        const tokens = usage?.totalTokens ?? 1;
        await reportAIUsage(orgId, tokens);
      }
    },
  });

  return result.toDataStreamResponse();
}

/**
 * GET /api/ai/chat — returns the available models for the frontend model picker
 */
export async function GET() {
  const models = Object.values(MODELS).map(({ id, label, provider, supportsVision, supportsWebSearch, costTier }) => ({
    id,
    label,
    provider,
    supportsVision,
    supportsWebSearch,
    costTier,
    credits: CREDIT_COSTS[id] ?? 1,
  }));

  return Response.json({ models });
}

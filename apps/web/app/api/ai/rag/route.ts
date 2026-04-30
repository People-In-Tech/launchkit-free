// @ts-nocheck
/**
 * POST /api/ai/rag — RAG-powered streaming chat
 *
 * Body: { messages: Message[], modelId?: string, k?: number }
 *
 * Retrieves relevant documents from pgvector, injects them into the
 * system prompt, and streams a response.
 */
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { searchSimilar } from "@launchkit/rag";
import { db } from "@launchkit/database";
import { aiUsage } from "@launchkit/database/schema";
import { calculateCostUsd } from "@launchkit/database/schema/ai-usage";

import { checkRateLimit, AI_RATE_LIMITS } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.rag.limit, AI_RATE_LIMITS.rag.windowMs);
  if (!rateLimit.success) {
    return new Response("Too many requests", { status: 429 });
  }

  const { messages, modelId = "gpt-5.4-mini", k = 5, systemPrompt } = await req.json();
  const start = Date.now();

  // Get the last user message for retrieval
  const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  const query = lastUser?.content ?? "";

  // Retrieve context from vector DB
  const docs = await searchSimilar(query, {
    k,
    userId,
    orgId: orgId ?? undefined,
    threshold: 0.4,
  });

  const context = docs.length
    ? `## Retrieved Context\n\n${docs.map((d, i) => `[${i + 1}] (similarity: ${d.similarity.toFixed(2)})\n${d.content}`).join("\n\n")}`
    : "";

  const baseSystem =
    systemPrompt ??
    "You are a helpful assistant. Answer based on the retrieved context when available. If the context doesn't address the question, use your general knowledge and say so.";

  const system = context ? `${baseSystem}\n\n${context}` : baseSystem;

  const result = streamText({
    model: getModel(modelId),
    system,
    messages,
    maxTokens: 2048,
    onFinish: async ({ usage }) => {
      if (!usage) return;
      const costUsd = calculateCostUsd(modelId, usage.promptTokens, usage.completionTokens);
      await db.insert(aiUsage).values({
        userId,
        orgId: orgId ?? null,
        model: modelId,
        provider: modelId.split("-")[0],
        feature: "rag",
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costUsd,
        durationMs: Date.now() - start,
      }).catch(console.error);
    },
  });

  return result.toDataStreamResponse();
}

// @ts-nocheck
/**
 * POST /api/ai/agent — Streaming agent with tool-calling
 *
 * Body: {
 *   messages: Message[],
 *   modelId?: string,
 *   tools?: string[],       // ["search", "code", "fetch-url", "scaffold"]
 *   systemPrompt?: string,
 *   agentConfigId?: string  // use a saved agent config
 * }
 */
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { db } from "@launchkit/database";
import { aiUsage, agentConfigs } from "@launchkit/database/schema";
import { calculateCostUsd } from "@launchkit/database/schema/ai-usage";
import { eq } from "drizzle-orm";
import { searchTool } from "@launchkit/agents";
import { fetchUrlTool } from "@launchkit/agents";
import { codeTool, scaffoldTool } from "@launchkit/agents";

import { checkRateLimit, AI_RATE_LIMITS } from "@/lib/rate-limit";

export const maxDuration = 120; // agents can run longer

const ALL_TOOLS = {
  search: searchTool,
  "fetch-url": fetchUrlTool,
  code: codeTool,
  scaffold: scaffoldTool,
};

const DEFAULT_SYSTEM = `You are a LaunchKit AI Agent — an expert full-stack engineer assistant.

You have access to tools to search the web, read URLs, analyze code, and scaffold modules.
Think step by step. Use tools to find accurate information before answering.
Always explain what you're doing and why when using tools.

LaunchKit stack: Next.js 15 · TypeScript · Neon · Drizzle · Clerk · Stripe · Tailwind · Vercel AI SDK`;

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.agent.limit, AI_RATE_LIMITS.agent.windowMs);
  if (!rateLimit.success) {
    return new Response("Too many requests", { status: 429 });
  }

  const {
    messages,
    modelId: bodyModelId,
    tools: toolNames,
    systemPrompt: bodySystem,
    agentConfigId,
  } = await req.json();

  const start = Date.now();

  // Load saved agent config if provided
  let modelId = bodyModelId ?? "gpt-5.4-mini";
  let enabledToolNames: string[] = toolNames ?? ["search", "code", "fetch-url"];
  let system = bodySystem ?? DEFAULT_SYSTEM;

  if (agentConfigId) {
    const [config] = await db
      .select()
      .from(agentConfigs)
      .where(eq(agentConfigs.id, agentConfigId));
    if (config) {
      modelId = config.modelId ?? modelId;
      enabledToolNames = (config.tools as string[]) ?? enabledToolNames;
      system = config.systemPrompt ?? system;
    }
  }

  // Resolve tools
  const enabledTools = Object.fromEntries(
    enabledToolNames
      .filter((n) => n in ALL_TOOLS)
      .map((n) => [n, ALL_TOOLS[n as keyof typeof ALL_TOOLS]])
  );

  const result = streamText({
    model: getModel(modelId),
    system,
    messages,
    tools: enabledTools,
    maxSteps: 10,
    onFinish: async ({ usage }) => {
      if (!usage) return;
      const costUsd = calculateCostUsd(modelId, usage.promptTokens, usage.completionTokens);
      await db.insert(aiUsage).values({
        userId,
        orgId: orgId ?? null,
        model: modelId,
        provider: modelId.split("-")[0],
        feature: "agent",
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

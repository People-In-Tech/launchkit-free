/**
 * API route: /api/ai/summarize
 *
 * Summarize a piece of text using the selected AI model.
 * Streams the result back using Vercel AI SDK data stream protocol.
 *
 * POST — Summarize text (deducts 2 credits)
 */

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { deductCredits, getCredits } from "@/lib/credits";
import { reportAIUsage } from "@/lib/usage-reporting";

const CREDIT_COST = 2;

const models: Record<string, () => ReturnType<typeof openai>> = {
  "gpt-4o": () => openai("gpt-4o"),
  "gpt-4o-mini": () => openai("gpt-4o-mini"),
  "claude-3-5-sonnet": () => anthropic("claude-3-5-sonnet-20241022") as ReturnType<typeof openai>,
  "gemini-pro": () => google("gemini-1.5-pro") as ReturnType<typeof openai>,
};

const SummarizeSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(100_000),
  model: z.string().optional().default("gpt-4o-mini"),
  style: z
    .enum(["concise", "detailed", "bullet-points", "executive"])
    .optional()
    .default("concise"),
});

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = SummarizeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { text, model: modelId, style } = parsed.data;

  // Check credits
  const balance = await getCredits(userId);
  if (balance < CREDIT_COST) {
    return Response.json(
      { error: "Insufficient credits. Please upgrade your plan." },
      { status: 402 }
    );
  }

  const modelFactory = models[modelId];
  if (!modelFactory) {
    return Response.json(
      { error: `Model "${modelId}" is not supported` },
      { status: 400 }
    );
  }

  // Deduct credits upfront
  await deductCredits(userId, CREDIT_COST, `AI summarize: ${modelId}`);

  const styleInstructions: Record<string, string> = {
    concise: "Provide a concise summary in 2-3 sentences.",
    detailed: "Provide a detailed summary covering all main points.",
    "bullet-points": "Summarize as a structured bullet-point list.",
    executive: "Write an executive summary suitable for senior leadership — focus on key decisions, outcomes, and action items.",
  };

  const result = streamText({
    model: modelFactory(),
    system: `You are an expert document summarizer. ${styleInstructions[style]} Be accurate and faithful to the source material.`,
    prompt: `Please summarize the following text:\n\n${text}`,
    onFinish: async ({ usage }) => {
      if (orgId) {
        const tokens = usage?.totalTokens ?? 1;
        await reportAIUsage(orgId, tokens);
      }
    },
  });

  return result.toDataStreamResponse();
}

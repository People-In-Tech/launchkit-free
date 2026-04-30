/**
 * API route: /api/ai/generate
 *
 * Generate content (blog posts, emails, social posts, product descriptions)
 * using the selected AI model. Streams the result back.
 *
 * POST — Generate content (deducts 2 credits)
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

const contentTypePrompts: Record<string, string> = {
  "blog-post": "You are an expert blog writer. Write engaging, SEO-optimized blog content with a compelling introduction, structured body, and strong conclusion.",
  email: "You are an expert email copywriter. Write persuasive, professional emails with clear subject suggestions, compelling body, and strong call-to-action.",
  "social-post": "You are a social media expert. Write engaging posts optimized for virality with appropriate tone and hashtag suggestions.",
  "product-description": "You are a conversion-focused copywriter. Write compelling product descriptions that highlight benefits, address objections, and drive purchases.",
};

const GenerateSchema = z.object({
  contentType: z.enum(["blog-post", "email", "social-post", "product-description"]),
  topic: z.string().min(3, "Topic is required").max(500),
  tone: z.enum(["professional", "casual", "humorous", "authoritative", "friendly"]),
  length: z.enum(["short", "medium", "long"]),
  model: z.string().optional().default("gpt-4o"),
  additionalContext: z.string().max(1000).optional(),
});

const lengthInstructions: Record<string, string> = {
  short: "Keep it brief — around 150-250 words.",
  medium: "Write a medium-length piece — around 400-600 words.",
  long: "Write a comprehensive piece — around 800-1200 words.",
};

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { contentType, topic, tone, length, model: modelId, additionalContext } = parsed.data;

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

  await deductCredits(userId, CREDIT_COST, `AI content generation: ${contentType}`);

  const systemPrompt = contentTypePrompts[contentType];
  const prompt = [
    `Write a ${contentType.replace("-", " ")} about: ${topic}`,
    `Tone: ${tone}`,
    lengthInstructions[length],
    additionalContext ? `Additional context: ${additionalContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: modelFactory(),
    system: systemPrompt,
    prompt,
    onFinish: async ({ usage }) => {
      if (orgId) {
        const tokens = usage?.totalTokens ?? 1;
        await reportAIUsage(orgId, tokens);
      }
    },
  });

  return result.toDataStreamResponse();
}

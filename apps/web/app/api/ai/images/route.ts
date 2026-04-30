/**
 * API route: /api/ai/images
 *
 * Generate images using OpenAI DALL-E 3.
 * Image generation costs more credits than text (10 per image).
 *
 * POST — Generate an image (deducts 10 credits)
 */

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { deductCredits, getCredits } from "@/lib/credits";
import OpenAI from "openai";

const CREDIT_COST = 10;

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const ImageGenerateSchema = z.object({
  prompt: z.string().min(3, "Prompt is required").max(4000),
  style: z
    .enum(["realistic", "illustration", "3d-render", "digital-art", "watercolor", "minimalist"])
    .optional()
    .default("realistic"),
  size: z
    .enum(["1024x1024", "1024x1792", "1792x1024"])
    .optional()
    .default("1024x1024"),
  quality: z.enum(["standard", "hd"]).optional().default("standard"),
});

const styleModifiers: Record<string, string> = {
  realistic: "photorealistic, highly detailed, natural lighting",
  illustration: "digital illustration, vibrant colors, clean lines, artistic",
  "3d-render": "3D rendered, professional CGI, studio lighting, high quality render",
  "digital-art": "digital art, creative, stylized, modern aesthetic",
  watercolor: "watercolor painting style, soft edges, artistic, traditional medium",
  minimalist: "minimalist design, simple, clean, geometric, flat design aesthetic",
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ImageGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { prompt, style, size, quality } = parsed.data;

  // Check credits
  const balance = await getCredits(userId);
  if (balance < CREDIT_COST) {
    return Response.json(
      {
        error: `Image generation costs ${CREDIT_COST} credits. You have ${balance}. Please upgrade your plan.`,
      },
      { status: 402 }
    );
  }

  // Deduct credits upfront
  await deductCredits(userId, CREDIT_COST, `DALL-E 3 image: ${prompt.slice(0, 50)}`);

  try {
    const openai = getOpenAI();

    const enhancedPrompt = `${prompt}. Style: ${styleModifiers[style]}`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: size as "1024x1024" | "1024x1792" | "1792x1024",
      quality: quality as "standard" | "hd",
      response_format: "url",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return Response.json({ error: "Image generation failed — no URL returned" }, { status: 500 });
    }

    return Response.json({
      url: imageUrl,
      revisedPrompt,
      prompt,
      style,
      size,
      quality,
      creditsUsed: CREDIT_COST,
    });
  } catch (error) {
    console.error("[api/ai/images/POST]", error);

    // Attempt to refund credits on generation failure
    try {
      const { addCredits } = await import("@/lib/credits");
      await addCredits(userId, CREDIT_COST, "refund", "Image generation failed — credits refunded");
    } catch {
      // Swallow refund errors — don't double-fail
    }

    return Response.json({ error: "Image generation failed" }, { status: 500 });
  }
}

// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

/**
 * POST /api/ai/image — Generate an image from a text prompt.
 *
 * Supported providers:
 *   dall-e-3     → OpenAI DALL-E 3                (OPENAI_API_KEY)
 *   stable-diff  → Stability AI SD 3.5            (STABILITY_API_KEY)
 *   flux         → Black Forest Labs Flux 1.1 Pro  (REPLICATE_API_TOKEN)
 *
 * Body: { prompt: string; provider?: string; size?: string; quality?: string }
 * Returns: { url: string; provider: string; revisedPrompt?: string }
 */

const PROVIDERS = {
  "dall-e-3": "dall-e-3",
  "stable-diff": "stable-diff",
  flux: "flux",
} as const;

type Provider = keyof typeof PROVIDERS;

function getDefaultProvider(): Provider {
  if (process.env.OPENAI_API_KEY) return "dall-e-3";
  if (process.env.STABILITY_API_KEY) return "stable-diff";
  if (process.env.REPLICATE_API_TOKEN) return "flux";
  return "dall-e-3";
}

import { checkRateLimit, AI_RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = checkRateLimit(userId, AI_RATE_LIMITS.image.limit, AI_RATE_LIMITS.image.windowMs);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const prompt = body.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

  const provider: Provider = (body.provider as Provider) ?? getDefaultProvider();
  const size: string = body.size ?? "1024x1024";
  const quality: string = body.quality ?? "standard";

  try {
    if (provider === "dall-e-3") {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });
      }
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const result = await client.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        quality: quality as "standard" | "hd",
        response_format: "url",
      });
      const image = result.data[0];
      return NextResponse.json({
        url: image.url,
        provider: "dall-e-3",
        revisedPrompt: image.revised_prompt,
      });
    }

    if (provider === "stable-diff") {
      if (!process.env.STABILITY_API_KEY) {
        return NextResponse.json({ error: "STABILITY_API_KEY not set" }, { status: 503 });
      }
      const [width, height] = size.split("x").map(Number);
      const sdRes = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        body: (() => {
          const fd = new FormData();
          fd.append("prompt", prompt);
          fd.append("output_format", "png");
          fd.append("width", String(width));
          fd.append("height", String(height));
          return fd;
        })(),
      });
      if (!sdRes.ok) {
        const err = await sdRes.text();
        return NextResponse.json({ error: `Stability AI error: ${err}` }, { status: 502 });
      }
      const sdData = await sdRes.json();
      // Stability returns base64 — convert to data URL
      const dataUrl = `data:image/png;base64,${sdData.image}`;
      return NextResponse.json({ url: dataUrl, provider: "stable-diff" });
    }

    if (provider === "flux") {
      if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json({ error: "REPLICATE_API_TOKEN not set" }, { status: 503 });
      }
      // Flux 1.1 Pro via Replicate
      const startRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { prompt, aspect_ratio: "1:1", output_format: "webp", output_quality: 80 },
        }),
      });
      const pred = await startRes.json();
      // Poll for completion
      let finalUrl: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
          headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
        });
        const pollData = await pollRes.json();
        if (pollData.status === "succeeded") {
          finalUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
          break;
        }
        if (pollData.status === "failed") {
          return NextResponse.json({ error: "Flux generation failed" }, { status: 502 });
        }
      }
      if (!finalUrl) return NextResponse.json({ error: "Flux timeout" }, { status: 504 });
      return NextResponse.json({ url: finalUrl, provider: "flux" });
    }

    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  } catch (err: unknown) {
    console.error("[/api/ai/image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai/image — List available image generation providers.
 */
export async function GET() {
  const providers = [
    {
      id: "dall-e-3",
      label: "DALL-E 3",
      vendor: "OpenAI",
      configured: !!process.env.OPENAI_API_KEY,
      sizes: ["1024x1024", "1792x1024", "1024x1792"],
      qualities: ["standard", "hd"],
      envKey: "OPENAI_API_KEY",
    },
    {
      id: "stable-diff",
      label: "Stable Diffusion 3.5",
      vendor: "Stability AI",
      configured: !!process.env.STABILITY_API_KEY,
      sizes: ["1024x1024", "1152x896", "896x1152"],
      qualities: ["standard"],
      envKey: "STABILITY_API_KEY",
    },
    {
      id: "flux",
      label: "Flux 1.1 Pro",
      vendor: "Black Forest Labs",
      configured: !!process.env.REPLICATE_API_TOKEN,
      sizes: ["1:1", "16:9", "9:16"],
      qualities: ["standard"],
      envKey: "REPLICATE_API_TOKEN",
    },
  ];

  return NextResponse.json({ providers });
}

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectDescription } = await request.json();
  if (!projectDescription) {
    return NextResponse.json(
      { error: "Project description is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Return sensible defaults when no API key
    return NextResponse.json({
      database: "Neon",
      auth: "Clerk",
      payments: "Stripe",
      hosting: "Vercel",
      reasoning: "These are the recommended defaults for LaunchKit. Add OPENAI_API_KEY for AI-powered personalized recommendations.",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a technical advisor for LaunchKit, a Next.js SaaS boilerplate. Based on the user's project description, recommend the best stack choices. Respond with valid JSON only, no markdown:
{
  "database": "Neon" | "Supabase" | "PlanetScale",
  "auth": "Clerk" | "Supabase Auth" | "NextAuth",
  "payments": "Stripe" | "Lemon Squeezy",
  "hosting": "Vercel" | "Railway" | "Docker self-hosted",
  "reasoning": "Brief explanation of why these choices fit the project"
}`,
          },
          {
            role: "user",
            content: `Project description: ${projectDescription}`,
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    try {
      const recommendations = JSON.parse(content);
      return NextResponse.json(recommendations);
    } catch {
      return NextResponse.json({
        database: "Neon",
        auth: "Clerk",
        payments: "Stripe",
        hosting: "Vercel",
        reasoning: content,
      });
    }
  } catch {
    return NextResponse.json({
      database: "Neon",
      auth: "Clerk",
      payments: "Stripe",
      hosting: "Vercel",
      reasoning: "Default recommendations (AI service unavailable).",
    });
  }
}

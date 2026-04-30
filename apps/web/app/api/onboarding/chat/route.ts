// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@launchkit/database";
import { onboardingMessages } from "@launchkit/database";
import { getOnboardingStatus, getSystemPrompt } from "@/lib/onboarding";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, step } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Save user message
  await db.insert(onboardingMessages).values({
    userId,
    role: "user",
    content: message,
    step: step ?? null,
  });

  const progress = await getOnboardingStatus(userId);
  const systemPrompt = getSystemPrompt(progress);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback response when no API key configured
    const fallback =
      "I'm the LaunchKit onboarding assistant. To enable AI-powered help, add your OPENAI_API_KEY to your environment variables. In the meantime, follow the step-by-step instructions to set up your project!";

    await db.insert(onboardingMessages).values({
      userId,
      role: "assistant",
      content: fallback,
      step: step ?? null,
    });

    return NextResponse.json({ role: "assistant", content: fallback });
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
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantContent =
      data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    await db.insert(onboardingMessages).values({
      userId,
      role: "assistant",
      content: assistantContent,
      step: step ?? null,
    });

    return NextResponse.json({ role: "assistant", content: assistantContent });
  } catch {
    const errorMsg = "Sorry, I'm having trouble connecting to the AI service. Please try again later.";

    await db.insert(onboardingMessages).values({
      userId,
      role: "assistant",
      content: errorMsg,
      step: step ?? null,
    });

    return NextResponse.json({ role: "assistant", content: errorMsg });
  }
}

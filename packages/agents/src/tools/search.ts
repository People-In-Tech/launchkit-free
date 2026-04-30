// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";

/**
 * Web search tool — uses Perplexity sonar if PERPLEXITY_API_KEY is set,
 * otherwise falls back to a Brave/Serper/Tavily search.
 */
export const searchTool = tool({
  description:
    "Search the web for current information. Use this for recent news, documentation, or any factual lookup.",
  parameters: z.object({
    query: z.string().describe("The search query"),
    recency: z
      .enum(["day", "week", "month", "year", "any"])
      .optional()
      .default("any")
      .describe("Filter results by recency"),
  }),
  execute: async ({ query, recency }) => {
    // Prefer Perplexity (already in the provider stack)
    if (process.env.PERPLEXITY_API_KEY) {
      const { createPerplexity } = await import("@ai-sdk/perplexity");
      const { generateText } = await import("ai");
      const perplexity = createPerplexity({
        apiKey: process.env.PERPLEXITY_API_KEY,
      });
      const { text } = await generateText({
        model: perplexity("sonar"),
        prompt: `Search query: ${query}. Provide a concise factual answer with sources.`,
        maxTokens: 512,
      });
      return { results: text, source: "perplexity" };
    }

    // Fallback: Tavily
    if (process.env.TAVILY_API_KEY) {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: 5,
          time_range: recency !== "any" ? recency : undefined,
        }),
      });
      const data = await res.json();
      const snippets = (data.results ?? [])
        .map((r: { url: string; content: string }) => `[${r.url}]\n${r.content}`)
        .join("\n\n");
      return { results: snippets, source: "tavily" };
    }

    return {
      results: `No search provider configured. Set PERPLEXITY_API_KEY or TAVILY_API_KEY.`,
      source: "none",
    };
  },
});

"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles, Globe, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelInfo {
  id: string;
  label: string;
  provider: string;
  supportsVision: boolean;
  supportsWebSearch: boolean;
  costTier: string;
  credits: number;
}

function getErrorMessage(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("429")) {
    return "Rate limit reached. Please wait a moment before sending another message.";
  }
  if (msg.includes("credits") || msg.includes("quota")) {
    return "You've run out of AI credits. Upgrade your plan to continue.";
  }
  if (msg.includes("api") || msg.includes("500") || msg.includes("503")) {
    return "The AI service is temporarily unavailable. Please try again shortly.";
  }
  return "Something went wrong. Please try again.";
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "text-emerald-500",
  Anthropic: "text-orange-500",
  Google: "text-blue-500",
  Perplexity: "text-sky-500",
  xAI: "text-purple-500",
  DeepSeek: "text-indigo-500",
  Groq: "text-yellow-500",
  Mistral: "text-rose-500",
};

export function AiChat() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("gpt-5.4-mini");
  const [loadingModels, setLoadingModels] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch available models from the API
  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((data: { models: ModelInfo[] }) => {
        setModels(data.models);
        // Default to first model if current selection isn't in list
        if (data.models.length > 0 && !data.models.find((m) => m.id === selectedModel)) {
          setSelectedModel(data.models[0].id);
        }
      })
      .catch(() => {
        // Fallback static list if API unavailable
        setModels([
          { id: "gpt-5.4-mini", label: "GPT-5.4 Mini", provider: "OpenAI", supportsVision: true, supportsWebSearch: false, costTier: "low", credits: 1 },
          { id: "gpt-5.4", label: "GPT-5.4", provider: "OpenAI", supportsVision: true, supportsWebSearch: false, costTier: "high", credits: 5 },
          { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic", supportsVision: true, supportsWebSearch: false, costTier: "medium", credits: 3 },
          { id: "claude-opus-4-6", label: "Claude Opus 4.6", provider: "Anthropic", supportsVision: true, supportsWebSearch: false, costTier: "high", credits: 5 },
          { id: "gemini-3.1-flash", label: "Gemini 3.1 Flash", provider: "Google", supportsVision: true, supportsWebSearch: false, costTier: "low", credits: 1 },
          { id: "sonar-pro", label: "Sonar Pro", provider: "Perplexity", supportsVision: false, supportsWebSearch: true, costTier: "medium", credits: 3 },
          { id: "grok-4-20", label: "Grok 4", provider: "xAI", supportsVision: false, supportsWebSearch: true, costTier: "medium", credits: 3 },
          { id: "deepseek-chat", label: "DeepSeek V3", provider: "DeepSeek", supportsVision: false, supportsWebSearch: false, costTier: "low", credits: 1 },
          { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "Groq", supportsVision: false, supportsWebSearch: false, costTier: "low", credits: 1 },
        ]);
      })
      .finally(() => setLoadingModels(false));
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai/chat",
    body: { model: selectedModel },
    onError: (err) => {
      console.error("[AiChat]", err);
      toast.error(getErrorMessage(err));
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeModel = models.find((m) => m.id === selectedModel);
  const hasError = !!error;

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader className="flex flex-row items-center justify-between border-b py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          AI Chat
        </CardTitle>
        <div className="flex items-center gap-2">
          {activeModel && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {activeModel.supportsWebSearch && (
                <span className="flex items-center gap-0.5 text-sky-500">
                  <Globe className="h-3 w-3" /> Web
                </span>
              )}
              {activeModel.supportsVision && (
                <span className="flex items-center gap-0.5 text-violet-500">
                  <Eye className="h-3 w-3" /> Vision
                </span>
              )}
              <span className="text-muted-foreground/60">·</span>
              <span>{activeModel.credits} cr/msg</span>
            </div>
          )}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loadingModels}
            className="rounded-md border bg-background px-3 py-1.5 text-sm min-w-[200px]"
          >
            {loadingModels ? (
              <option>Loading models…</option>
            ) : (
              // Group by provider
              Object.entries(
                models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
                  (acc[m.provider] = acc[m.provider] ?? []).push(m);
                  return acc;
                }, {})
              ).map(([provider, providerModels]) => (
                <optgroup key={provider} label={provider}>
                  {providerModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.credits} cr)
                    </option>
                  ))}
                </optgroup>
              ))
            )}
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !hasError && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <Bot className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm text-muted-foreground">
                  {activeModel
                    ? `Powered by ${activeModel.label} (${activeModel.provider})`
                    : "Select a model to begin"}
                </p>
              </div>
              {activeModel && (
                <div className={cn("text-xs font-medium", PROVIDER_COLORS[activeModel.provider] ?? "text-primary")}>
                  {activeModel.provider}
                  {activeModel.supportsWebSearch && " · Live web search"}
                  {activeModel.supportsVision && " · Vision"}
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 text-sm",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-xl px-4 py-2.5 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.parts
                  ? message.parts.map((part, i) =>
                      part.type === "text" ? <span key={i}>{part.text}</span> : null
                    )
                  : (message as { content: string }).content}
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-2.5 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <div className="p-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={`Message ${activeModel?.label ?? "AI"}…`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Copy, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { id: "blog-post", label: "Blog Post", emoji: "✍️" },
  { id: "email", label: "Email", emoji: "📧" },
  { id: "social-post", label: "Social Post", emoji: "📱" },
  { id: "product-description", label: "Product Description", emoji: "🛍️" },
] as const;

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "humorous", label: "Humorous" },
  { id: "authoritative", label: "Authoritative" },
  { id: "friendly", label: "Friendly" },
] as const;

const LENGTHS = [
  { id: "short", label: "Short", desc: "~200 words" },
  { id: "medium", label: "Medium", desc: "~500 words" },
  { id: "long", label: "Long", desc: "~1000 words" },
] as const;

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
];

function getErrorMessage(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("credits") || msg.includes("402")) {
    return "Insufficient credits. Please upgrade your plan.";
  }
  return "Something went wrong. Please try again.";
}

export default function ContentGeneratorPage() {
  const [contentType, setContentType] = useState<typeof CONTENT_TYPES[number]["id"]>("blog-post");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<typeof TONES[number]["id"]>("professional");
  const [length, setLength] = useState<typeof LENGTHS[number]["id"]>("medium");
  const [model, setModel] = useState("gpt-4o");
  const [additionalContext, setAdditionalContext] = useState("");
  const [copied, setCopied] = useState(false);

  const { completion, isLoading, complete, error, setCompletion } = useCompletion({
    api: "/api/ai/generate",
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await complete("", {
      body: { contentType, topic, tone, length, model, additionalContext },
    });
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleReset = () => {
    setCompletion("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Generator</h1>
        <p className="text-muted-foreground">
          Generate high-quality content in seconds. Costs 2 credits per generation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Controls panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Configure</CardTitle>
            <CardDescription>Choose what you want to create</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Content type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setContentType(ct.id)}
                      className={cn(
                        "rounded-md border p-2.5 text-left text-sm transition-colors",
                        contentType === ct.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="mr-1.5">{ct.emoji}</span>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 'The future of remote work' or 'Our new product launch'"
                />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        tone === t.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id)}
                      className={cn(
                        "rounded-md border p-2 text-center text-xs transition-colors",
                        length === l.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{l.label}</div>
                      <div className="text-muted-foreground">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional context */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Additional context <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Target audience, key points to include, brand voice guidelines…"
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button type="submit" disabled={isLoading || !topic.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate (2 credits)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Generated Content</CardTitle>
              <CardDescription>Your content will stream in here</CardDescription>
            </div>
            {completion && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {getErrorMessage(error)}
              </div>
            )}

            {!completion && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Wand2 className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm">Your generated content will appear here</p>
                <p className="mt-1 text-xs">Configure the options and click Generate</p>
              </div>
            )}

            {(completion || isLoading) && (
              <div className="min-h-[400px] whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
                {completion || (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating your content…</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

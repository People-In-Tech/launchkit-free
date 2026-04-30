"use client";

import type { Metadata } from "next";
import { useState, useRef } from "react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Note: metadata must be in a server component — page.tsx with "use client" can't export metadata.
// Create a separate layout.tsx or server wrapper if SEO is needed for this page.

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", note: "Fast & affordable" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", note: "Most capable" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", note: "Excellent for text" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", note: "Great comprehension" },
];

const STYLES = [
  { id: "concise", label: "Concise", description: "2-3 sentences" },
  { id: "detailed", label: "Detailed", description: "Full coverage" },
  { id: "bullet-points", label: "Bullet Points", description: "Structured list" },
  { id: "executive", label: "Executive", description: "Decision-focused" },
];

function getErrorMessage(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("credits") || msg.includes("402")) {
    return "Insufficient credits. Please upgrade your plan.";
  }
  return "Something went wrong. Please try again.";
}

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [style, setStyle] = useState("concise");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { completion, isLoading, complete, error } = useCompletion({
    api: "/api/ai/summarize",
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await complete("", {
      body: { text, model, style },
    });
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Summarizer</h1>
        <p className="text-muted-foreground">
          Paste any text and get an AI-powered summary. Costs 2 credits per request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Input
            </CardTitle>
            <CardDescription>Paste the text you want to summarize</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here… articles, documents, reports, meeting notes, anything."
                rows={10}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">{wordCount.toLocaleString()} words</p>

              {/* Style selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-md border p-2.5 text-left text-sm transition-colors",
                        style === s.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider}) — {m.note}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Summarize (2 credits)
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
              <CardTitle className="text-base">Summary</CardTitle>
              <CardDescription>AI-generated summary will appear here</CardDescription>
            </div>
            {completion && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {getErrorMessage(error)}
              </div>
            )}

            {!completion && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Sparkles className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">Your summary will appear here</p>
              </div>
            )}

            {(completion || isLoading) && (
              <div className="min-h-[200px] rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
                {completion || (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating summary…</span>
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

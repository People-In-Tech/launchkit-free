"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon, Download, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLES = [
  { id: "realistic", label: "Realistic", emoji: "📷" },
  { id: "illustration", label: "Illustration", emoji: "🎨" },
  { id: "3d-render", label: "3D Render", emoji: "🎭" },
  { id: "digital-art", label: "Digital Art", emoji: "💻" },
  { id: "watercolor", label: "Watercolor", emoji: "🖼️" },
  { id: "minimalist", label: "Minimalist", emoji: "◻️" },
] as const;

const SIZES = [
  { id: "1024x1024", label: "Square", desc: "1024×1024" },
  { id: "1024x1792", label: "Portrait", desc: "1024×1792" },
  { id: "1792x1024", label: "Landscape", desc: "1792×1024" },
] as const;

const QUALITIES = [
  { id: "standard", label: "Standard", desc: "Faster" },
  { id: "hd", label: "HD", desc: "Higher detail" },
] as const;

interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  prompt: string;
  style: string;
  size: string;
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<typeof STYLES[number]["id"]>("realistic");
  const [size, setSize] = useState<typeof SIZES[number]["id"]>("1024x1024");
  const [quality, setQuality] = useState<typeof QUALITIES[number]["id"]>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImage(null);

    try {
      const res = await fetch("/api/ai/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, size, quality }),
      });

      const data = await res.json() as {
        url?: string;
        revisedPrompt?: string;
        prompt?: string;
        style?: string;
        size?: string;
        error?: string;
      };

      if (!res.ok) {
        const msg = data.error ?? "Image generation failed";
        setError(msg);
        toast.error(msg);
        return;
      }

      setImage({
        url: data.url!,
        revisedPrompt: data.revisedPrompt,
        prompt,
        style,
        size,
      });
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!image?.url) return;
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `launchkit-image-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  };

  const handleReset = () => {
    setImage(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Image Generator</h1>
        <p className="text-muted-foreground">
          Create stunning AI images with DALL-E 3. Costs 10 credits per image.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Controls */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Image Settings</CardTitle>
            <CardDescription>Describe what you want to create</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Prompt */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain lake at sunset with pine trees reflecting on the water…"
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  {prompt.length}/4000 characters
                </p>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-md border p-2 text-center text-xs transition-colors",
                        style === s.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="text-lg">{s.emoji}</div>
                      <div className="mt-0.5 font-medium">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id)}
                      className={cn(
                        "rounded-md border p-2 text-center text-xs transition-colors",
                        size === s.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{s.label}</div>
                      <div className="text-muted-foreground">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALITIES.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      className={cn(
                        "rounded-md border p-2 text-center text-xs transition-colors",
                        quality === q.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">{q.label}</div>
                      <div className="text-muted-foreground">{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image (10 credits)
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Image output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Generated Image</CardTitle>
              <CardDescription>Your DALL-E 3 image will appear here</CardDescription>
            </div>
            {image && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
                <Loader2 className="mb-4 h-12 w-12 animate-spin opacity-50" />
                <p className="text-sm font-medium">Creating your image…</p>
                <p className="mt-1 text-xs">DALL-E 3 typically takes 10-20 seconds</p>
              </div>
            )}

            {!image && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
                <ImageIcon className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm">Your image will appear here</p>
                <p className="mt-1 text-xs">Enter a prompt and click Generate</p>
              </div>
            )}

            {image && (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full rounded-lg object-contain shadow-md"
                />
                {image.revisedPrompt && image.revisedPrompt !== image.prompt && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">DALL-E revised your prompt:</p>
                    <p className="text-sm italic text-muted-foreground">{image.revisedPrompt}</p>
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

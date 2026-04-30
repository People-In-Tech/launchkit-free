"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Image as ImageIcon, Download, Loader2, Wand2, RefreshCw,
  ChevronDown, Sparkles
} from "lucide-react";

interface Provider {
  id: string;
  label: string;
  vendor: string;
  configured: boolean;
  sizes: string[];
  envKey: string;
}

interface GeneratedImage {
  url: string;
  provider: string;
  revisedPrompt?: string;
  prompt: string;
  timestamp: number;
}

export function ImageGenerator() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("dall-e-3");
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  async function loadProviders() {
    if (providersLoaded) return;
    const res = await fetch("/api/ai/image");
    const data = await res.json();
    setProviders(data.providers);
    const first = data.providers.find((p: Provider) => p.configured);
    if (first) setSelectedProvider(first.id);
    setProvidersLoaded(true);
  }

  const activeProvider = providers.find((p) => p.id === selectedProvider);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider: selectedProvider,
          size: selectedSize,
          quality: selectedQuality,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const data = await res.json();
      setImages((prev) => [
        { ...data, prompt, timestamp: Date.now() },
        ...prev,
      ]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string, prompt: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `launchkit-${prompt.slice(0, 30).replace(/\s+/g, "-")}.png`;
      a.click();
    } catch {
      window.open(url, "_blank");
    }
  }

  const EXAMPLE_PROMPTS = [
    "A minimalist SaaS dashboard UI in dark mode, glassmorphism style",
    "Abstract geometric background for a tech startup, indigo and cyan gradient",
    "Clean product mockup on MacBook Pro, white background",
    "Vector illustration of a rocket launching, flat design",
  ];

  return (
    <div className="space-y-6">
      {/* Generation form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-indigo-500" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider + size picker */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Provider</label>
              <div className="relative">
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    const p = providers.find((p) => p.id === e.target.value);
                    if (p?.sizes[0]) setSelectedSize(p.sizes[0]);
                  }}
                  onFocus={loadProviders}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm appearance-none pr-8"
                >
                  {!providersLoaded && <option value="dall-e-3">DALL-E 3 (OpenAI)</option>}
                  {providers.map((p) => (
                    <option key={p.id} value={p.id} disabled={!p.configured}>
                      {p.label} ({p.vendor}){!p.configured ? " — not configured" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {activeProvider && (
              <div className="min-w-[120px]">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Size</label>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm appearance-none pr-8"
                  >
                    {activeProvider.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Prompt */}
          <form ref={formRef} onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prompt</label>
              <div className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate…"
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={!prompt.trim() || loading} className="gap-2 shrink-0">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate</>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="rounded-full border bg-muted/50 hover:bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {p.slice(0, 45)}…
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Generated ({images.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, i) => (
              <div
                key={img.timestamp}
                className="group relative rounded-xl border overflow-hidden bg-muted/30"
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full aspect-square object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                  <p className="text-white text-xs line-clamp-2">{img.revisedPrompt ?? img.prompt}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 gap-1.5 text-xs h-7"
                      onClick={() => downloadImage(img.url, img.prompt)}
                    >
                      <Download className="h-3 w-3" /> Download
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={() => setPrompt(img.prompt)}
                      title="Re-use prompt"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {/* Provider badge */}
                <div className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80">
                  {img.provider}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !loading && (
        <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No images yet</p>
          <p className="text-sm text-muted-foreground">Enter a prompt above and click Generate.</p>
        </div>
      )}
    </div>
  );
}

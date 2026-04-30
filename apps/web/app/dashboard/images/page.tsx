import type { Metadata } from "next";
import { ImageGenerator } from "@/components/ai/image-generator";

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate images with DALL-E 3, Flux, or Stable Diffusion.",
};

export default function ImagesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Image Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate images with DALL·E 3, Flux, or Stable Diffusion — all from one UI.
        </p>
      </div>
      <ImageGenerator />
    </div>
  );
}

"use client";

import Image from "next/image";

const tools = [
  { name: "Claude Code", domain: "anthropic.com" },
  { name: "Antigravity", domain: "deepmind.google" },
  { name: "Wispr", domain: "wisprflow.ai" },
  { name: "Windsurf", domain: "codeium.com" },
  { name: "Cursor", domain: "cursor.com" },
  { name: "Warp", domain: "warp.dev" },
  { name: "Amp", domain: "amp.dev" },
  { name: "VS Code", domain: "visualstudio.com" },
  { name: "GitHub Copilot", domain: "github.com" },
  { name: "Gemini", domain: "gemini.google.com" },
  { name: "Bolt", domain: "bolt.new" },
  { name: "Loveable", domain: "lovable.dev" },
  { name: "V0", domain: "v0.dev" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Replit", domain: "replit.com" },
  { name: "Perplexity", domain: "perplexity.ai" },
  { name: "Hugging Face", domain: "huggingface.co" },
  { name: "Devin", domain: "cognition.ai" },
  { name: "Aider", domain: "aider.chat" },
  { name: "Phind", domain: "phind.com" },
];

export function AiToolsCarousel() {
  return (
    <div className="relative overflow-hidden w-full pt-10">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
          A Blueprint made to work with your AI Tools
        </p>
      </div>

      {/* 
        We use two identical lists side-by-side. 
        The animation translates them by -50% to create an infinite loop.
        Using logo.clearbit.com as a fallback since cdn.brandfetch.io hotlinking 
        requires an active Brandfetch API key / registered domain.
      */}
      <div className="group relative flex w-full overflow-hidden">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-40" />

        {/* Scrolling container */}
        <div className="flex w-max animate-scroll-left hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, arrayIndex) => (
            <div 
              key={arrayIndex} 
              className="flex w-max items-center gap-10 sm:gap-16 px-5 sm:px-8"
            >
              {tools.map((tool, index) => (
                <div
                  key={`${tool.name}-${index}`}
                  className="flex min-w-[60px] sm:min-w-[80px] items-center justify-center transition-transform hover:scale-110"
                  title={tool.name}
                >
                  <img
                    src={`https://cdn.brandfetch.io/${tool.domain}/w/400/h/400/theme/dark/fallback/transparent`}
                    alt={`${tool.name} logo`}
                    width={40}
                    height={40}
                    className="object-contain transition-all rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('google.com')) {
                        target.src = `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`;
                      } else {
                        target.style.display = 'none';
                        if (target.parentElement) target.parentElement.style.display = 'none';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-40" />
      </div>
    </div>
  );
}

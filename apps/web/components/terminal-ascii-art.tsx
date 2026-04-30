import { cn } from "@/lib/utils";

export const ASCII_BANNER_LINES = [
  "  ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗██╗  ██╗██╗████████╗",
  "  ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██║ ██╔╝██║╚══██╔══╝",
  "  ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╔╝ ██║   ██║   ",
  "  ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔═██╗ ██║   ██║   ",
  "  ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║██║  ██╗██║   ██║   ",
  "  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝  ",
];

export function TerminalAsciiArt({ className }: { className?: string }) {
  return (
    <div className={cn("whitespace-pre", className)}>
      {ASCII_BANNER_LINES.map((line, i) => (
        <div key={i} className="leading-[1.2]">
          <span
            className="font-mono bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

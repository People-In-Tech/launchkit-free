import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MacbookMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-5xl px-4 sm:px-8", className)}>
      {/* Screen lid (Outer metal) */}
      <div className="relative rounded-[1rem] sm:rounded-[2rem] bg-zinc-300 dark:bg-zinc-800 p-1.5 sm:p-2 shadow-2xl z-10 ring-1 ring-black/10 dark:ring-white/10">
        {/* Inner black bezel */}
        <div className="relative rounded-[0.75rem] sm:rounded-[1.5rem] bg-zinc-950 p-1 sm:p-3 overflow-hidden shadow-inner">
          {/* Notch/Webcam */}
          <div className="absolute top-0 inset-x-0 mx-auto w-24 sm:w-32 h-4 sm:h-6 bg-zinc-950 rounded-b-[0.5rem] sm:rounded-b-xl flex items-center justify-center z-20">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-900/50 flex items-center justify-center shadow-[inset_0_0_2px_rgba(0,0,0,0.8)]">
              <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-blue-400/80" />
            </div>
          </div>
          
          {/* Screen Content */}
          <div className="relative w-full aspect-video rounded-md sm:rounded-xl overflow-hidden bg-background">
            {children}
          </div>
        </div>
      </div>
      
      {/* Base */}
      <div className="relative z-20 mx-auto w-[105%] -left-[2.5%] h-4 sm:h-6 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-b-2xl sm:rounded-b-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex justify-center border-t border-white/20 dark:border-zinc-600">
        {/* Thumb indent */}
        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gradient-to-b from-zinc-400 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 rounded-b-md sm:rounded-b-xl shadow-inner border-b border-black/10 dark:border-white/5" />
      </div>
    </div>
  );
}

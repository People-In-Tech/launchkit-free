import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * LaunchKit logo icon — automatically switches between light and dark
 * variants using Tailwind's `dark:` class. Uses pre-rendered PNGs for
 * performance (the source SVGs embed base64 raster data).
 *
 * `size` controls width/height in pixels (default 32).
 */
export function Logo({
  size = 32,
  className,
  forceDark = false,
}: {
  size?: number;
  className?: string;
  forceDark?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {/* Light mode */}
      <Image
        src="/icon-light-64.png"
        alt="LaunchKit"
        width={size}
        height={size}
        className={cn(
          "rounded-xl",
          forceDark ? "hidden" : "block dark:hidden"
        )}
        priority
      />
      {/* Dark mode */}
      <Image
        src="/icon-dark-64.png"
        alt="LaunchKit"
        width={size}
        height={size}
        className={cn(
          "rounded-xl",
          forceDark ? "block" : "hidden dark:block"
        )}
        priority
      />
    </span>
  );
}

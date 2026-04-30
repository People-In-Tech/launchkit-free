'use client';

import { cn } from '@/lib/utils';

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  className?: string;
}

/**
 * A lightweight CSS-only bar chart component.
 * No external chart library required.
 */
export function BarChart({ data, color = 'bg-primary', className }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('flex items-end gap-1.5', className)} style={{ height: 160 }}>
      {data.map((item) => {
        const heightPct = (item.value / max) * 100;
        return (
          <div
            key={item.label}
            className="group relative flex flex-1 flex-col items-center justify-end"
            style={{ height: '100%' }}
          >
            {/* Tooltip */}
            <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
              {item.value}
            </div>
            {/* Bar */}
            <div
              className={cn('w-full rounded-t transition-all', color)}
              style={{
                height: `${Math.max(heightPct, 2)}%`,
                minHeight: 2,
              }}
            />
            {/* Label */}
            <span className="mt-1.5 text-[10px] text-muted-foreground truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

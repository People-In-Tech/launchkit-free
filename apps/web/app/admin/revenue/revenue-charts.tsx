'use client';

import { cn } from '@/lib/utils';

interface WaterfallItem {
  label: string;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  netNewMrr: number;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  className?: string;
}

export function WaterfallChart({ data, className }: WaterfallChartProps) {
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.newMrr + d.expansionMrr, Math.abs(d.contractionMrr) + Math.abs(d.churnedMrr), Math.abs(d.netNewMrr))),
    1
  );

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{item.label}</span>
            <span className={cn(
              'font-mono',
              item.netNewMrr >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {item.netNewMrr >= 0 ? '+' : ''}${item.netNewMrr.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-0.5 h-5">
            {item.newMrr > 0 && (
              <div
                className="bg-green-500 rounded-sm transition-all"
                style={{ width: `${(item.newMrr / maxVal) * 100}%` }}
                title={`New: $${item.newMrr}`}
              />
            )}
            {item.expansionMrr > 0 && (
              <div
                className="bg-blue-500 rounded-sm transition-all"
                style={{ width: `${(item.expansionMrr / maxVal) * 100}%` }}
                title={`Expansion: $${item.expansionMrr}`}
              />
            )}
            {item.contractionMrr < 0 && (
              <div
                className="bg-amber-500 rounded-sm transition-all"
                style={{ width: `${(Math.abs(item.contractionMrr) / maxVal) * 100}%` }}
                title={`Contraction: -$${Math.abs(item.contractionMrr)}`}
              />
            )}
            {item.churnedMrr < 0 && (
              <div
                className="bg-red-500 rounded-sm transition-all"
                style={{ width: `${(Math.abs(item.churnedMrr) / maxVal) * 100}%` }}
                title={`Churned: -$${Math.abs(item.churnedMrr)}`}
              />
            )}
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-[10px] text-muted-foreground pt-2">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500" /> New</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-blue-500" /> Expansion</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-500" /> Contraction</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-500" /> Churned</span>
      </div>
    </div>
  );
}

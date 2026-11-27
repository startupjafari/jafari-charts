import type { LucideIcon } from './icons';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Card } from './card';

/**
 * StudentHub MetricTile: icon chip, the number with its unit, a caption and an
 * optional hint. `tone` colours only the chip; the number stays a text token.
 */
export function MetricTile({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone = 'text-primary-ink',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  tone?: string;
}) {
  const empty = value === null || value === undefined || value === '';
  return (
    <Card className="flex items-center gap-3 p-3 transition-[box-shadow] hover:ring-ring/40">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg bg-current/10',
          tone,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1">
          <span
            className={cn(
              'text-xl leading-tight font-semibold tabular-nums',
              empty && 'text-muted-foreground/60',
            )}
          >
            {empty ? '—' : value}
          </span>
          {unit && !empty && <span className="text-xs text-muted-foreground">{unit}</span>}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{label}</span>
        {hint && (
          <span className="block truncate text-[0.6875rem] text-muted-foreground">{hint}</span>
        )}
      </span>
    </Card>
  );
}

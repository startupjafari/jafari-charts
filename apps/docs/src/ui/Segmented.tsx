import type { LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../lib/cn';

export interface SegmentedOption<V extends string | number> {
  value: V;
  label: string;
  /** Show an icon instead of the text (the label stays as the accessible name). */
  icon?: LucideIcon;
}

/**
 * Compact single-choice control built on native radio inputs, so arrow keys,
 * focus and screen reader semantics come from the browser. Looks like StudentHub's
 * `SegmentedTabs`: a muted track with a raised active option.
 */
export function Segmented<V extends string | number>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  size = 'md',
  className,
}: {
  label: string;
  options: readonly SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  hideLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend
        className={
          hideLabel ? 'sr-only' : 'mb-1.5 p-0 text-[0.8125rem] font-medium text-foreground'
        }
      >
        {label}
      </legend>
      <div
        className={cn(
          'inline-flex max-w-full flex-wrap gap-0.5 rounded-xl border border-border bg-muted/50',
          size === 'sm' ? 'rounded-lg p-0.5' : 'p-1',
        )}
      >
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <label
              key={String(o.value)}
              className="relative inline-flex"
              title={Icon ? o.label : undefined}
            >
              <input
                type="radio"
                name={name}
                value={String(o.value)}
                checked={o.value === value}
                onChange={() => onChange(o.value)}
                className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
              />
              <span
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-hover:text-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-ring/25 dark:peer-checked:bg-input/50',
                  size === 'sm'
                    ? 'h-6 rounded-md px-2 text-xs'
                    : 'h-8 rounded-lg px-3 text-[0.8125rem]',
                  Icon && (size === 'sm' ? 'w-7 px-0' : 'w-8 px-0'),
                )}
              >
                {Icon ? (
                  <>
                    <Icon className="size-3.5" aria-hidden />
                    <span className="sr-only">{o.label}</span>
                  </>
                ) : (
                  o.label
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

import type { LucideIcon } from './icons';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface SegmentedItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: LucideIcon;
  /** Tooltip; also the accessible name when the label is visually hidden (icon-only items). */
  title?: string;
  /** Language of the label when it differs from the page (a language switcher). */
  lang?: string;
}

/**
 * StudentHub SegmentedTabs: a muted track, the active item raised on the background.
 * Buttons with `aria-pressed` (a filter, not a tablist: there is no tab panel).
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  labelledBy,
  iconOnly = false,
  stretch = false,
  stacked = false,
  className,
}: {
  items: readonly SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group (or `labelledBy`, the id of a visible caption). */
  label?: string;
  labelledBy?: string;
  iconOnly?: boolean;
  stretch?: boolean;
  /** Icon above a small label: leaves room for longer (translated) labels in narrow tracks. */
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={cn(
        'flex max-w-full items-center gap-0.5 rounded-xl border border-border bg-muted/50 p-0.5',
        stretch ? 'w-full' : 'w-fit',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            aria-label={iconOnly ? (item.title ?? String(item.label)) : undefined}
            title={iconOnly ? (item.title ?? String(item.label)) : item.title}
            lang={item.lang}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[0.8rem] font-medium whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-ring/25 lg:min-h-[1.875rem] lg:px-2.5',
              iconOnly && 'px-2.5 lg:px-2',
              stretch ? 'min-w-0 flex-1 px-1.5 lg:px-1.5' : 'shrink-0',
              stacked && 'flex-col gap-0.5 py-1.5 text-[0.6875rem] leading-tight',
              active
                ? 'bg-background text-foreground shadow-sm dark:bg-input/40'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {!iconOnly && item.label}
          </button>
        );
      })}
    </div>
  );
}

import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/use-media-query';
import { useScrollRow } from '../lib/use-scroll-row';

// StudentHub's SegmentedTabs (`shared/ui/segmented-tabs.tsx`): a single-choice row in the
// language of Tabs — a `bg-muted/50` track with a raised `bg-background` active option.
//
// A row has two modes on phones:
//  · it fits or almost fits — a scrolling track: native touch scroll, mouse drag
//    (`useScrollRow`), edge fades, and the active option slides into view after a change;
//  · a narrow screen and a row wider than its track — it collapses into one selector: the
//    current option, and on press the list arrives as an island at the bottom of the screen.

/** Narrower than this, a list is more honest than scrolling (two or three chips fit). */
const COLLAPSE_QUERY = '(max-width: 25rem)';

export interface SegmentedTabItem<T extends string> {
  value: T;
  label: ReactNode;
  /** A counter after the label. 0 is not shown. */
  count?: number;
  /** Counter tone: `accent` — solid accent, `muted` — solid grey; default — neutral. */
  countTone?: 'accent' | 'muted';
  icon?: LucideIcon;
}

export interface SegmentedTabsProps<T extends string> {
  items: readonly SegmentedTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  'aria-label'?: string;
  /** Accessible name from a visible label. */
  'aria-labelledby'?: string;
  /** Collapse the row into a selector on a narrow screen. */
  collapsible?: boolean;
  /** Dense row: a step lower on the scale (40 px for fingers, 28 px for the pointer). */
  compact?: boolean;
  /** Right click (and the context-menu key) on an option. */
  onItemContextMenu?: (value: T, event: React.MouseEvent<HTMLElement>) => void;
  /** Options share the row's width equally. */
  stretch?: boolean;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  collapsible = true,
  compact = false,
  onItemContextMenu,
  stretch = false,
  className,
}: SegmentedTabsProps<T>) {
  const row = useScrollRow<HTMLDivElement>();
  const { reveal } = row;
  const narrow = useMediaQuery(COLLAPSE_QUERY);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // "The row did not fit" is remembered: collapsed, there is nothing left to measure, and
  // the decision must be stable or the selector and the track would flicker.
  // (Updated during render rather than in an effect: the same latch, one render sooner.)
  const [tooWide, setTooWide] = useState(false);
  if (row.overflowing && !tooWide) setTooWide(true);

  const collapsed = collapsible && narrow && tooWide;
  const active = items.find((item) => item.value === value);

  // After a change (including one from the selector) the track brings the active option in.
  useEffect(() => {
    if (!collapsed) reveal(activeRef.current);
  }, [value, collapsed, reveal]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  function countPill(isActive: boolean, tone?: SegmentedTabItem<T>['countTone']): string {
    return cn(
      'shrink-0 rounded-full px-1.5 py-px text-center text-[0.6875rem] font-semibold tabular-nums',
      tone === 'accent'
        ? 'bg-primary text-primary-foreground'
        : tone === 'muted'
          ? 'bg-muted-foreground/60 text-white'
          : isActive
            ? 'bg-primary/15 text-primary'
            : 'bg-foreground/10 text-muted-foreground',
    );
  }

  if (collapsed) {
    const ActiveIcon = active?.icon;
    return (
      <div
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn('min-w-0', className)}
      >
        <button
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3.5 text-sm font-medium transition-colors',
            compact ? 'min-h-10' : 'min-h-11',
          )}
        >
          {ActiveIcon && <ActiveIcon className="size-4 shrink-0" aria-hidden />}
          <span className="min-w-0 truncate">{active?.label}</span>
          {!!active?.count && (
            <span className={countPill(true, active.countTone)}>
              {active.count > 99 ? '99+' : active.count}
            </span>
          )}
          <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        {menuOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            <>
              {/* Press catcher: a tap outside closes the list, without dimming — it is a
                  popover, not a modal sheet. */}
              <div
                data-overlay
                className="pointer-events-auto fixed inset-0 z-[199]"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className={cn(
                  'material-island pointer-events-auto fixed inset-x-3 bottom-[calc(var(--bottom-nav-offset)+var(--kb-inset,0px))] z-[200]',
                  'flex max-h-[min(60dvh,24rem)] flex-col overflow-y-auto overscroll-contain',
                  'rounded-3xl border border-border/60 p-1.5 shadow-lg',
                  'origin-bottom duration-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 motion-reduce:animate-none',
                )}
              >
                {items.map((item) => {
                  const isActive = item.value === value;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setMenuOpen(false);
                        onChange(item.value);
                      }}
                      onContextMenu={
                        onItemContextMenu
                          ? (e) => {
                              setMenuOpen(false);
                              onItemContextMenu(item.value, e);
                            }
                          : undefined
                      }
                      className={cn(
                        'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium transition-colors hover:bg-foreground/[0.06] active:bg-foreground/[0.09]',
                        isActive && 'bg-primary/10 text-primary',
                      )}
                    >
                      {Icon && <Icon className="size-5 shrink-0 opacity-80" aria-hidden />}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {!!item.count && (
                        <span className={countPill(isActive, item.countTone)}>
                          {item.count > 99 ? '99+' : item.count}
                        </span>
                      )}
                      {isActive && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </>,
            document.body,
          )}
      </div>
    );
  }

  return (
    <div
      ref={row.ref}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      // The row may not fit a narrow screen — it scrolls without a visible bar, with edge
      // fades and dragging (see useScrollRow).
      className={cn(
        'flex max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/50 lg:rounded-xl',
        compact ? 'p-0.5' : 'p-1',
        stretch && 'w-full',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        row.overflowing && 'cursor-grab',
        row.dragging && 'cursor-grabbing select-none',
        className,
      )}
      style={{ maskImage: row.fadeMask, WebkitMaskImage: row.fadeMask }}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            ref={isActive ? activeRef : undefined}
            type="button"
            // aria-pressed, not role="tab": a filter switch without a linked tabpanel.
            aria-pressed={isActive}
            onClick={() => onChange(item.value)}
            onContextMenu={onItemContextMenu ? (e) => onItemContextMenu(item.value, e) : undefined}
            className={cn(
              // 44 px for fingers, 32 px for the pointer; `compact` lowers both to 40 and 28.
              'flex shrink-0 cursor-pointer items-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring/20 lg:rounded-lg',
              compact ? 'min-h-10 px-3 lg:min-h-7 lg:px-2.5' : 'min-h-11 px-3.5 lg:min-h-8 lg:px-3',
              stretch && 'flex-1 justify-center',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {item.label}
            {!!item.count && (
              <span className={countPill(isActive, item.countTone)}>
                {item.count > 99 ? '99+' : item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

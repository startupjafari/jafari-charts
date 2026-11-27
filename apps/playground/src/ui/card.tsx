import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/utils';

/** Content surface: card background separated by a ring, never a shadow. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A chart panel (StudentHub SectionPanel): title and a mandatory one-line explanation,
 * optional controls on the right, the chart, then an optional footer for presets and
 * read-outs. Keeps the `.card` class and `data-testid` the e2e suites look for. No
 * `overflow-hidden`: chart tooltips may extend past the panel edge.
 */
export function ChartCard({
  id,
  title,
  description,
  actions,
  footer,
  wide,
  className,
  bodyClassName,
  style,
  children,
}: {
  /** `data-testid`; defaults to the title (the visual suite addresses cards by title). */
  id?: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Span the whole grid row (calendars). */
  wide?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'card flex min-w-0 flex-col rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10',
        wide && 'col-span-full',
        className,
      )}
      data-testid={id ?? (typeof title === 'string' ? title : undefined)}
      style={style}
    >
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1 basis-48">
          <h3 className="text-sm leading-snug font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('min-w-0 flex-1 px-4 pt-3 pb-4', bodyClassName)}>{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-xl border-t border-border bg-muted/40 px-4 py-2.5 text-xs">
          {footer}
        </footer>
      )}
    </section>
  );
}

/** Responsive grid of chart cards: one column on phones, two from ~900 px of content. */
export function CardGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))] gap-4',
        className,
      )}
      {...props}
    />
  );
}

/** A labelled read-out of live state in a card footer: "Domain  x full; y full". */
export function Readout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 font-mono text-[0.75rem] font-medium break-all text-foreground">
        {children}
      </span>
    </span>
  );
}

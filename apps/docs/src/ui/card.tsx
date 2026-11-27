import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Content surface: card colour separated by a hairline ring, no shadow (StudentHub `Card`). */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Panel with a header (title + one-line explanation) and a body — StudentHub's
 * `SectionPanel`. The subtitle is required on purpose: it says why the panel is there.
 */
export function SectionPanel({
  title,
  subtitle,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm leading-snug font-semibold">{title}</p>
          <p className="m-0 text-xs leading-snug text-muted-foreground">{subtitle}</p>
        </div>
        {actions}
      </div>
      <div className={cn('flex-1 bg-preview px-4 py-3', bodyClassName)}>{children}</div>
    </Card>
  );
}

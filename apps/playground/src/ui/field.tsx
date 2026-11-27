import { useId, type ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * A labelled control: a small caption above (or beside, `inline`) the control.
 * `children` receives the caption's id; the control names itself with `aria-labelledby`.
 */
export function Field({
  label,
  hint,
  inline = false,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  inline?: boolean;
  className?: string;
  children: (labelId: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        'flex min-w-0',
        inline ? 'flex-row items-center gap-2' : 'flex-col gap-1.5',
        className,
      )}
    >
      <span id={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children(id)}
      {hint && <span className="text-[0.6875rem] text-muted-foreground">{hint}</span>}
    </div>
  );
}

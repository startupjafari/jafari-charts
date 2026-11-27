import { useId, type ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Label } from './label';

/**
 * A StudentHub `Label` and its control (DESIGN_SYSTEM §10.3): the caption above the control,
 * or beside it with `inline` (header toolbars). `children` receives the control id for
 * `<SelectTrigger id>`, which the label names and focuses. A `group` control (SegmentedTabs)
 * is not labelable: it names itself with `aria-label`, and the caption is only visual.
 */
export function Field({
  label,
  group = false,
  inline = false,
  className,
  children,
}: {
  label: string;
  group?: boolean;
  inline?: boolean;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        'flex min-w-0',
        inline ? 'flex-row flex-wrap items-center gap-x-2.5 gap-y-1.5' : 'flex-col gap-2',
        className,
      )}
    >
      {group ? (
        <Label asChild>
          <span aria-hidden>{label}</span>
        </Label>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}
      {children(id)}
    </div>
  );
}

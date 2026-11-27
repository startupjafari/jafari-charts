import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/** A key cap for interaction hints ("Ctrl", "⇧", "+"). */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1 font-sans text-[0.6875rem] leading-none font-medium text-foreground shadow-[0_1px_0_var(--border)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

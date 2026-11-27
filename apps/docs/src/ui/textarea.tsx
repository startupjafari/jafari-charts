import * as React from 'react';
import { cn } from '../lib/cn';
import { AREA_SIZE, type ControlSize } from './control-size';

// StudentHub's Textarea (`shared/ui/textarea.tsx`): the Input recipe for several lines. The
// size sets the minimum height and padding; the content grows it from there.
function Textarea({
  className,
  size = 'md',
  ...props
}: React.ComponentProps<'textarea'> & { size?: ControlSize }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full min-w-0 rounded-xl border border-input bg-background transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground/70 hover:border-ring/50 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:bg-input/30 dark:disabled:bg-input/60',
        AREA_SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

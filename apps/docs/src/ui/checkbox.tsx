import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn';

// StudentHub's Checkbox (`shared/ui/checkbox.tsx`): a rounded square, blue fill when checked,
// the Input/Select focus ring. Controlled through checked/onCheckedChange.
//
// The root and the visible box are separate elements: the box stays 20×20 while the root
// takes 28×28 presses (WCAG 2.5.8 asks for 24×24). A negative margin cancels the extra
// size, so in the flow the checkbox still takes 20px.
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group peer -m-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center p-1 outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span
        data-slot="checkbox-box"
        className="flex size-5 items-center justify-center rounded-md border border-input bg-background text-primary-foreground transition-[color,box-shadow,border-color] group-hover:border-ring/50 group-focus-visible:border-ring group-focus-visible:ring-4 group-focus-visible:ring-ring/15 group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary group-aria-invalid:border-destructive group-aria-invalid:ring-4 group-aria-invalid:ring-destructive/15 dark:bg-input/30"
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current"
        >
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

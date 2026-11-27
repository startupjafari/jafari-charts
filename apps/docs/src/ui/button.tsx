import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn';
import { CONTROL_SIZE, CONTROL_SQUARE, type ControlSize } from './control-size';

// StudentHub's Button (`shared/ui/button.tsx`): rounded-xl, a soft "breathing" focus ring
// (ring-4 ring/20) and a light press. `transform` is deliberately left out of the
// transitions: the press response must be instant, colour and shadow may ease.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-150 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/20 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background hover:border-ring/50 hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20',
        link: 'text-primary underline-offset-4 transition-colors hover:text-primary/70 hover:underline',
      },
      // Height comes from the shared control scale (control-size.ts): four sizes, the same
      // heights as fields and selects. An icon button is the same size as a square: `icon`.
      size: CONTROL_SIZE,
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'lg',
  icon = false,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  Omit<VariantProps<typeof buttonVariants>, 'size'> & {
    size?: ControlSize;
    /** Icon button: a square of the chosen size's height, no horizontal padding. */
    icon?: boolean;
    asChild?: boolean;
    /** Request in flight: the button turns muted and shows a spinner in place of its content. */
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';
  // `loading` cannot work with `asChild` (Slot expects a single child) — ignored there.
  const isLoading = loading && !asChild;

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        icon && CONTROL_SQUARE[size],
        isLoading &&
          'pointer-events-none bg-muted text-muted-foreground hover:bg-muted disabled:opacity-70',
        className,
      )}
      disabled={asChild ? undefined : disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        // The original content keeps the width, so a row of buttons does not jump.
        <span className="grid place-items-center">
          <span className="invisible col-start-1 row-start-1 inline-flex items-center gap-2">
            {children}
          </span>
          <Loader2 className="col-start-1 row-start-1 size-4 animate-spin" aria-hidden />
        </span>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };

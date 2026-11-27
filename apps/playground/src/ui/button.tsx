import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

/** StudentHub button: rounded-xl, soft focus ring, instant press feedback. */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/25 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background hover:border-ring/50 hover:bg-muted hover:text-foreground dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3 text-[0.8rem] [&_svg:not([class*=size-])]:size-3.5',
        md: 'h-9 gap-2 px-3.5 text-sm',
        lg: 'h-10 gap-2 px-4 text-sm',
      },
      icon: { true: 'gap-0 px-0', false: '' },
    },
    compoundVariants: [
      { size: 'sm', icon: true, class: 'size-8' },
      { size: 'md', icon: true, class: 'size-9' },
      { size: 'lg', icon: true, class: 'size-10' },
    ],
    defaultVariants: { variant: 'default', size: 'lg', icon: false },
  },
);

export function Button({
  className,
  variant,
  size,
  icon,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, icon }), className)}
      {...props}
    />
  );
}

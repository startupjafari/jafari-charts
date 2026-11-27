import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * Button recipe from the StudentHub design system: rounded-xl, a soft focus ring,
 * an instant 1px press (transform is not transitioned) and four control heights.
 * `buttonVariants` styles links that look like buttons.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium whitespace-nowrap no-underline outline-none select-none transition-[color,background-color,border-color,box-shadow,opacity] focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background text-foreground hover:border-ring/50 hover:bg-muted dark:bg-input/20 dark:hover:bg-input/40',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-primary-ink underline-offset-4 hover:underline',
      },
      size: {
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-9 px-3.5',
        lg: 'h-10 px-4',
        xl: 'h-12 rounded-2xl px-6 text-[0.9375rem]',
        icon: 'size-9 px-0',
        'icon-sm': 'size-8 rounded-lg px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'lg' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

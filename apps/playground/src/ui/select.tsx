import { Check, ChevronDown } from './icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../lib/utils';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

/** StudentHub Select (Radix): input-like trigger, rounded popover, blue check on the choice. */
export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  labelledBy,
  id,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  /** Accessible name when no <label htmlFor> points at the trigger. */
  label?: string;
  labelledBy?: string;
  id?: string;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        className={cn(
          'flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 text-[0.8rem] font-medium lg:h-9 outline-none hover:border-ring/50 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 dark:bg-input/30 [&>span]:truncate',
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="relative z-[200] max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport className="w-full min-w-[var(--radix-select-trigger-width)]">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-[0.8rem] outline-none select-none focus:bg-muted focus:text-foreground"
              >
                <span className="absolute right-2.5 flex size-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4 text-primary" aria-hidden />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

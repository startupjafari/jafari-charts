import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { cn } from '../lib/cn';
import { useScrollRow } from '../lib/use-scroll-row';

// StudentHub's Tabs (`shared/ui/tabs.tsx`, Radix) in the same language as SegmentedTabs:
// a visible `bg-muted/50` track and a raised `bg-background` active tab. The list scrolls
// on phones.
const Tabs = TabsPrimitive.Root;

function TabsList({ className, style, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  // A long list can be dragged with the mouse, fades at its edges and knows it scrolls.
  const row = useScrollRow<HTMLDivElement>();
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-muted/50 p-1 text-muted-foreground [scrollbar-width:none] sm:w-auto lg:rounded-xl [&::-webkit-scrollbar]:hidden',
        row.overflowing && 'cursor-grab',
        row.dragging && 'cursor-grabbing select-none',
        className,
      )}
      style={{ maskImage: row.fadeMask, WebkitMaskImage: row.fadeMask, ...style }}
      {...props}
      ref={row.ref}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-medium whitespace-nowrap transition-[color,background-color] outline-none select-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:flex-none lg:min-h-8 lg:rounded-lg lg:px-3',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('mt-4 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

import type { LucideIcon } from '../ui/icons';
import { useState, type ReactNode } from 'react';
import type { SceneId } from '../catalog';
import { useT } from '../i18n';
import { CardGrid, CardHeadingLevel } from '../ui/card';
import { Field } from '../ui/field';
import { SegmentedTabs } from '../ui/segmented-tabs';

/**
 * StudentHub PageHeader: a full-bleed band in the sidebar's material with an accent bar,
 * the title and one line on what the page is for; controls sit on the right.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="-mx-4 -mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-sidebar-border bg-sidebar px-4 py-3 md:-mx-6 md:-mt-6 md:px-6 lg:min-h-16">
      <div className="flex min-w-0 flex-1 basis-72 items-center gap-3">
        <span className="h-8 w-1 shrink-0 self-start rounded-full bg-primary" aria-hidden />
        <div className="min-w-0">
          <h1
            id="scene-title"
            tabIndex={-1}
            className="text-lg leading-tight font-bold tracking-tight focus:outline-none"
          >
            {title}
          </h1>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {actions && (
        <div className="flex max-w-full flex-wrap items-center gap-x-5 gap-y-2">{actions}</div>
      )}
    </header>
  );
}

/**
 * Header, interaction hints and content of one scene; title and summary come from the
 * interface messages (`messages.scenes`).
 */
export function ScenePage({
  scene,
  actions,
  hints,
  children,
}: {
  scene: SceneId;
  actions?: ReactNode;
  hints?: ReactNode;
  children: ReactNode;
}) {
  const info = useT().scenes[scene];
  return (
    <>
      <PageHeader title={info.title} subtitle={info.summary} actions={actions} />
      {hints && <Hints>{hints}</Hints>}
      {children}
    </>
  );
}

/** "How to use this page": short instructions, each with an icon. */
export function Hints({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <ul
      aria-label={t.a11y.hints}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-primary/[0.04] px-4 py-2.5 text-xs text-muted-foreground ring-1 ring-primary/10 dark:bg-primary/[0.07]"
    >
      {children}
    </ul>
  );
}

export function Hint({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
      <span className="flex flex-wrap items-center gap-1">{children}</span>
    </li>
  );
}

/** A titled group of chart cards inside a scene ("Showcase", "Edge cases"). */
export function SceneSection({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count?: number;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-0.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {t.sections.chartCount(count)}
          </span>
        )}
        <p className="basis-full text-xs text-muted-foreground">{description}</p>
      </div>
      <CardHeadingLevel.Provider value={3}>
        <CardGrid>{children}</CardGrid>
      </CardHeadingLevel.Provider>
    </div>
  );
}

export type CaseFilter = 'all' | 'showcase' | 'edge';

/** "Show: All · Showcase · Edge cases" for scenes that mix examples and stress fixtures. */
export function useCaseFilter() {
  const t = useT();
  const [filter, setFilter] = useState<CaseFilter>('all');
  const cases = (['all', 'showcase', 'edge'] as const).map((value) => ({
    value,
    label: t.filter[value],
  }));
  const control = (
    <Field label={t.filter.label} group inline>
      {() => (
        <SegmentedTabs
          items={cases}
          value={filter}
          onChange={setFilter}
          aria-label={t.filter.label}
        />
      )}
    </Field>
  );
  return [filter, control] as const;
}

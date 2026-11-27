import { ChevronRight, CircleCheck, House, Info, Link2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { Link, useLocation } from '../lib/router';
import { useBreadcrumb } from '../shell/breadcrumbs';
import { Badge } from './badge';

const TONES = {
  info: { icon: Info, box: 'border-info/25 bg-info/[0.06]', mark: 'text-info' },
  warning: {
    icon: TriangleAlert,
    box: 'border-warning/30 bg-warning/[0.07]',
    mark: 'text-warning',
  },
  success: { icon: CircleCheck, box: 'border-success/25 bg-success/[0.06]', mark: 'text-success' },
} as const;

/** A note in the flow of the page: icon + optional title + text (StudentHub `Alert`). */
export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'success';
  title?: ReactNode;
  children: ReactNode;
}) {
  const { icon: Icon, box, mark } = TONES[tone];
  return (
    <aside
      className={cn('my-5 flex gap-3 rounded-xl border px-4 py-3 text-[0.875rem] leading-6', box)}
    >
      <Icon className={cn('mt-[3px] size-4.5 shrink-0', mark)} aria-hidden />
      <div className="min-w-0 flex-1 [&_p]:mb-2">
        {title ? <div className="mb-0.5 font-semibold text-foreground">{title}</div> : null}
        <div className="text-foreground/85 [&>:last-child]:mb-0">{children}</div>
      </div>
    </aside>
  );
}

/** Inline keyboard key. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** “Home › Group › Page” trail above the page title. */
function Breadcrumbs({ page }: { page: string }) {
  const t = useT();
  const crumb = useBreadcrumb();
  return (
    <nav aria-label={t.a11y.breadcrumb} className="mb-3">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-[0.8125rem] text-muted-foreground">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex size-6 items-center justify-center rounded-md hover:bg-muted hover:text-foreground"
            aria-label={t.pages.home}
          >
            <House className="size-3.5" aria-hidden />
          </Link>
        </li>
        {crumb.group ? (
          <li className="flex items-center gap-1">
            <ChevronRight className="size-3.5 opacity-60" aria-hidden />
            <span>{crumb.group}</span>
          </li>
        ) : null}
        <li className="flex min-w-0 items-center gap-1">
          <ChevronRight className="size-3.5 opacity-60" aria-hidden />
          <span aria-current="page" className="truncate font-medium text-foreground">
            {crumb.page ?? page}
          </span>
        </li>
      </ol>
    </nav>
  );
}

/**
 * Page header: breadcrumb trail, the title with the StudentHub accent bar, an
 * optional tag (e.g. “Core chart”) and the lead paragraph.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const crumb = useBreadcrumb();
  // The eyebrow repeats the sidebar group on most pages; show it only when it adds something.
  const tag = eyebrow && eyebrow !== crumb.group ? eyebrow : null;
  return (
    <header className="mb-8">
      <Breadcrumbs page={title} />
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-8 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="m-0 text-[1.75rem] leading-tight font-bold tracking-[-0.025em] [overflow-wrap:anywhere] sm:text-[2rem]">
            {title}
          </h1>
          {tag ? <Badge>{tag}</Badge> : null}
        </div>
      </div>
      {lead ? (
        <p className="mt-3 mb-0 max-w-[68ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
          {lead}
        </p>
      ) : null}
      {children}
    </header>
  );
}

/** Section with a stable anchor, a self-link and an optional lead. */
export function Section({
  id,
  title,
  children,
  lead,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  const t = useT();
  const { path } = useLocation();
  return (
    <section className="doc-section" aria-labelledby={`${id}-heading`}>
      <h2 id={id} className="group/h">
        <span id={`${id}-heading`}>{title}</span>
        <Link
          to={path}
          section={id}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover/h:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
          aria-label={t.a11y.sectionLink(title)}
        >
          <Link2 className="size-4" aria-hidden />
        </Link>
      </h2>
      {lead ? <p className="section-lead">{lead}</p> : null}
      {children}
    </section>
  );
}

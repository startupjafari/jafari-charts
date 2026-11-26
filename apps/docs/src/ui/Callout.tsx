import type { ReactNode } from 'react';

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'success';
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className={`callout callout-${tone}`}>
      {title ? <p className="callout-title">{title}</p> : null}
      <div className="callout-body">{children}</div>
    </aside>
  );
}

/** Inline keyboard key. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** Page header with eyebrow, title and lead paragraph. */
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
  return (
    <header className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {lead ? <p className="lead">{lead}</p> : null}
      {children}
    </header>
  );
}

/** Section heading with a stable anchor and a self-link. */
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
  return (
    <section className="doc-section" aria-labelledby={`${id}-heading`}>
      <h2 id={id}>
        <span id={`${id}-heading`}>{title}</span>
      </h2>
      {lead ? <p className="section-lead">{lead}</p> : null}
      {children}
    </section>
  );
}

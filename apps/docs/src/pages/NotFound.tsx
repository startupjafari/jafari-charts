import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { PageHeader } from '../ui/Callout';

interface NotFoundText {
  lead: (path: string) => string;
  links: ReactNode;
}

const TEXT: L<NotFoundText> = {
  en: {
    lead: (path) => `There is no page at “${path}”.`,
    links: (
      <>
        Go to the <Link to="/">home page</Link>, browse the <Link to="/charts">charts</Link> or the{' '}
        <Link to="/api">API reference</Link>.
      </>
    ),
  },
  ru: {
    lead: (path) => `По адресу «${path}» страницы нет.`,
    links: (
      <>
        Перейдите на <Link to="/">главную страницу</Link>, к списку{' '}
        <Link to="/charts">диаграмм</Link> или в <Link to="/api">справочник API</Link>.
      </>
    ),
  },
};

export function NotFound() {
  const { path } = useLocation();
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader title={ui.pages.notFound} lead={t.lead(path)} />
      {/* StudentHub EmptyState: icon, one line, the way out. */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-6" aria-hidden />
        </span>
        <p className="m-0 max-w-md text-sm text-muted-foreground">{t.links}</p>
      </div>
    </article>
  );
}

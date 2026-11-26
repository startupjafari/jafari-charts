import type { ReactNode } from 'react';
import { useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { REPO_URL } from '../lib/repo';
import { Callout, PageHeader } from '../ui/Callout';

interface GitHubText {
  lead: string;
  open: string;
  notPublicTitle: string;
  notPublic: string;
  meanwhile: ReactNode;
}

const TEXT: L<GitHubText> = {
  en: {
    lead: 'Source code, issues and releases.',
    open: 'Open the repository',
    notPublicTitle: 'Repository not public yet',
    notPublic:
      'The Jafari Charts repository has not been published. Once it is, this page will link to it.',
    meanwhile: (
      <>
        In the meantime, see the <Link to="/changelog">changelog</Link> for what has changed and the{' '}
        <Link to="/getting-started">introduction</Link> for the project’s status.
      </>
    ),
  },
  ru: {
    lead: 'Исходный код, задачи и релизы.',
    open: 'Открыть репозиторий',
    notPublicTitle: 'Репозиторий пока не открыт',
    notPublic:
      'Репозиторий Jafari Charts ещё не опубликован. Как только это произойдёт, здесь появится ссылка на него.',
    meanwhile: (
      <>
        А пока загляните в <Link to="/changelog">журнал изменений</Link>, чтобы узнать, что
        изменилось, и во <Link to="/getting-started">введение</Link> — там описан текущий статус
        проекта.
      </>
    ),
  },
};

export function GitHub() {
  const ui = useT();
  const t = useText(TEXT);
  if (REPO_URL) {
    return (
      <article>
        <PageHeader eyebrow={ui.nav.reference} title={ui.pages.github} lead={t.lead} />
        <p>
          <a className="btn btn-primary" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            {t.open}
          </a>
        </p>
        <p className="muted">
          <code>{REPO_URL}</code>
        </p>
      </article>
    );
  }
  return (
    <article>
      <PageHeader eyebrow={ui.nav.reference} title={ui.pages.github} />
      <Callout title={t.notPublicTitle}>
        <p>{t.notPublic}</p>
      </Callout>
      <p>{t.meanwhile}</p>
    </article>
  );
}

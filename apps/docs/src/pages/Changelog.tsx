import changelog from '../../../../CHANGELOG.md?raw';
import { useLang, useT, useText, type L } from '../i18n';
import { Markdown } from '../lib/markdown';
import { Callout, PageHeader } from '../ui/Callout';

interface ChangelogText {
  lead: string;
  /** Shown when the page language differs from the changelog's (English). */
  englishOnly: { title: string; body: string } | null;
}

const TEXT: L<ChangelogText> = {
  en: {
    lead: 'Rendered from CHANGELOG.md in the repository at build time.',
    englishOnly: null,
  },
  ru: {
    lead: 'Формируется из CHANGELOG.md в репозитории при сборке сайта.',
    englishOnly: {
      title: 'Журнал изменений ведётся на английском',
      body: 'Записи ниже приводятся в оригинале, без перевода, — так они в точности совпадают с CHANGELOG.md в репозитории.',
    },
  },
};

export function Changelog() {
  const lang = useLang();
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader eyebrow={ui.nav.reference} title={ui.pages.changelog} lead={t.lead} />
      {t.englishOnly ? <Callout title={t.englishOnly.title}>{t.englishOnly.body}</Callout> : null}
      {/* The source is English: mark it so screen readers switch voice on the Russian site. */}
      <div lang={lang === 'en' ? undefined : 'en'}>
        <Markdown source={changelog} skipTitle />
      </div>
    </article>
  );
}

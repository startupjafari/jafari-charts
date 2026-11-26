import type { ReactNode } from 'react';
import { useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { PageHeader, Section } from '../ui/Callout';
import { Example } from '../ui/Example';

interface ExampleSectionText {
  toc: string;
  title: string;
  lead: ReactNode;
  example: string;
}

interface ExamplesText {
  lead: string;
  dashboard: ExampleSectionText;
  sync: ExampleSectionText;
  localized: ExampleSectionText;
}

const TEXT: L<ExamplesText> = {
  en: {
    lead: 'Complete, realistic compositions you can copy: a university analytics dashboard, synchronised charts and localised charts.',
    dashboard: {
      toc: 'University dashboard',
      title: 'University analytics dashboard',
      lead: 'KPI cards with sparklines, user growth, activity by role, registrations, ratings, roles, complaints, a login calendar and plan completion — nine chart types, one consistent look, in both themes. Switch the preview to 480 or 320 px to see it reflow.',
      example: 'Dashboard',
    },
    sync: {
      toc: 'Synchronised charts',
      title: 'Synchronised charts',
      lead: 'Charts that share a syncId show the crosshair and tooltip at the same x value. Each chart resolves the value in its own data with a binary search; a chart whose range does not contain it shows nothing.',
      example: 'Shared crosshair',
    },
    localized: {
      toc: 'Russian and Kazakh',
      title: 'Russian and Kazakh',
      lead: 'Dates, numbers, week starts (Monday for ru and kk) and built-in texts such as “Total” follow the locale. Kazakh uses built-in CLDR data when the browser’s Intl lacks it.',
      example: 'ru / kk',
    },
  },
  ru: {
    lead: 'Законченные реалистичные композиции, которые можно скопировать: аналитический дашборд университета, синхронизированные диаграммы и локализованные диаграммы.',
    dashboard: {
      toc: 'Дашборд университета',
      title: 'Аналитический дашборд университета',
      lead: (
        <>
          KPI-карточки со спарклайнами, рост числа пользователей, активность по ролям, регистрации,
          рейтинги, роли, обращения, календарь входов и выполнение плана — девять типов диаграмм в
          едином стиле и в обеих темах. Переключите превью на 480 или 320 px, чтобы увидеть, как
          перестраивается макет. Подписи внутри примера остаются на английском — это исходный код из
          панели кода, — а оси и подсказки диаграмм показывают числа и даты по-русски.
        </>
      ),
      example: 'Дашборд',
    },
    sync: {
      toc: 'Синхронизированные диаграммы',
      title: 'Синхронизированные диаграммы',
      lead: 'Диаграммы с общим syncId показывают перекрестие и подсказку в одном и том же значении X. Каждая диаграмма находит это значение в своих данных бинарным поиском; если оно вне её диапазона, диаграмма ничего не показывает.',
      example: 'Общее перекрестие',
    },
    localized: {
      toc: 'Русский и казахский',
      title: 'Русский и казахский',
      lead: 'Даты, числа, первый день недели (понедельник для ru и kk) и встроенные тексты вроде «Итого» следуют локали. Для казахского используются встроенные данные CLDR, если в Intl браузера их нет.',
      example: 'ru / kk',
    },
  },
};

const SECTIONS = [
  { id: 'dashboard', key: 'dashboard', example: 'dashboard/Dashboard', codeOpen: false },
  { id: 'sync', key: 'sync', example: 'dashboard/SyncDemo', codeOpen: true },
  { id: 'localized', key: 'localized', example: 'dashboard/Localized', codeOpen: true },
] as const;

export function Examples() {
  const { path } = useLocation();
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader eyebrow={ui.nav.tools} title={ui.pages.examples} lead={t.lead}>
        <nav aria-label={ui.a11y.onThisPage}>
          <ul className="page-toc">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link to={path} section={s.id}>
                  {t[s.key].toc}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {SECTIONS.map((s) => (
        <Section key={s.id} id={s.id} title={t[s.key].title} lead={t[s.key].lead}>
          <Example id={s.example} title={t[s.key].example} codeOpen={s.codeOpen} />
        </Section>
      ))}
    </article>
  );
}

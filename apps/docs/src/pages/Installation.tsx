import type { ReactNode } from 'react';
import { useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';

const ENTRY_POINTS = [
  '@jafari/charts',
  '@jafari/charts/core',
  '@jafari/charts/themes',
  '@jafari/charts/export',
  '@jafari/charts/styles.css',
] as const;

type EntryPoint = (typeof ENTRY_POINTS)[number];

interface InstallationText {
  lead: string;
  notOnNpmTitle: string;
  notOnNpm: string;
  install: string;
  peers: ReactNode;
  entryPoints: string;
  importCol: string;
  contentsCol: string;
  entries: Record<EntryPoint, ReactNode>;
  styles: string;
  stylesText: ReactNode;
  ssr: string;
  ssrText: ReactNode;
  useClient: ReactNode;
  typescript: string;
  typescriptText: ReactNode;
  notNumeric: string;
  exportTitle: string;
  exportText: string;
  next: ReactNode;
}

const TEXT: L<InstallationText> = {
  en: {
    lead: 'One package, two peer dependencies, no CSS import required.',
    notOnNpmTitle: 'Not on npm yet',
    notOnNpm:
      'Jafari Charts 0.1.0 has not been published. The commands below are what installation will look like once it is; until then the packages are consumed from the monorepo workspace.',
    install: 'Install',
    peers: (
      <>
        <code>react</code> and <code>react-dom</code> 18.2 or newer are peer dependencies. There are
        no other runtime dependencies.
      </>
    ),
    entryPoints: 'Entry points',
    importCol: 'Import',
    contentsCol: 'Contents',
    entries: {
      '@jafari/charts': (
        <>
          Chart components, primitives, <code>ChartProvider</code>, hooks, <code>createTheme</code>{' '}
          and the formatting helpers.
        </>
      ),
      '@jafari/charts/core':
        'The framework-independent math core (scales, ticks, curves, models…).',
      '@jafari/charts/themes': 'Tokens, themes and the stylesheet generator.',
      '@jafari/charts/export':
        'SVG/PNG/WebP/CSV export — never in your main bundle unless imported.',
      '@jafari/charts/styles.css': 'The stylesheet, for strict Content Security Policies.',
    },
    styles: 'Styles',
    stylesText: (
      <>
        Styles are injected automatically (React 19 <code>&lt;style precedence&gt;</code>,
        deduplicated and SSR-safe). With a strict CSP that forbids inline styles, import the
        stylesheet and turn injection off:
      </>
    ),
    ssr: 'Server rendering and Next.js',
    ssrText: (
      <>
        Charts render on the server at <code>initialWidth</code> (640 px by default) so the HTML is
        meaningful, hydrate without mismatches and then adapt to the measured width. Layout never
        reads the DOM, so server and client compute identical markup.
      </>
    ),
    useClient: (
      <>
        The React components ship with the <code>"use client"</code> directive, so they can be
        imported from Next.js App Router server components.
      </>
    ),
    typescript: 'TypeScript',
    typescriptText: (
      <>
        Types ship with the package. Keys are checked against your data: <code>xKey</code> must be a
        date, number or string field, and series keys must be numeric fields.
      </>
    ),
    notNumeric: "'plan' is not numeric",
    exportTitle: 'Export (optional)',
    exportText: 'Load the export module only when the user asks for a download:',
    next: (
      <>
        Next: <Link to="/quick-start">Quick start</Link>.
      </>
    ),
  },
  ru: {
    lead: 'Один пакет, две peer-зависимости, импортировать CSS не нужно.',
    notOnNpmTitle: 'Пока не в npm',
    notOnNpm:
      'Jafari Charts 0.1.0 ещё не опубликована. Ниже показано, как будет выглядеть установка после публикации; до тех пор пакеты подключаются из workspace монорепозитория.',
    install: 'Установка',
    peers: (
      <>
        <code>react</code> и <code>react-dom</code> версии 18.2 или новее — peer-зависимости. Других
        зависимостей во время выполнения нет.
      </>
    ),
    entryPoints: 'Точки входа',
    importCol: 'Импорт',
    contentsCol: 'Содержимое',
    entries: {
      '@jafari/charts': (
        <>
          Компоненты диаграмм, примитивы, <code>ChartProvider</code>, хуки, <code>createTheme</code>{' '}
          и функции форматирования.
        </>
      ),
      '@jafari/charts/core':
        'Математическое ядро, не зависящее от фреймворка (шкалы, деления, кривые, модели…).',
      '@jafari/charts/themes': 'Токены, темы и генератор таблицы стилей.',
      '@jafari/charts/export':
        'Экспорт в SVG/PNG/WebP/CSV — попадает в основной бандл, только если вы его импортируете.',
      '@jafari/charts/styles.css': 'Таблица стилей — для строгих политик Content Security Policy.',
    },
    styles: 'Стили',
    stylesText: (
      <>
        Стили внедряются автоматически (через <code>&lt;style precedence&gt;</code> из React 19, без
        дублирования и безопасно для SSR). Если строгая CSP запрещает встроенные стили, импортируйте
        таблицу стилей и отключите внедрение:
      </>
    ),
    ssr: 'Серверный рендеринг и Next.js',
    ssrText: (
      <>
        На сервере диаграммы рендерятся с шириной <code>initialWidth</code> (по умолчанию 640 px),
        чтобы HTML был содержательным, гидратируются без расхождений и затем подстраиваются под
        измеренную ширину. Раскладка никогда не читает DOM, поэтому сервер и клиент получают
        одинаковую разметку.
      </>
    ),
    useClient: (
      <>
        React-компоненты поставляются с директивой <code>"use client"</code>, поэтому их можно
        импортировать из серверных компонентов Next.js App Router.
      </>
    ),
    typescript: 'TypeScript',
    typescriptText: (
      <>
        Типы поставляются вместе с пакетом. Ключи проверяются по вашим данным: <code>xKey</code>{' '}
        должен быть полем с датой, числом или строкой, а ключи рядов — числовыми полями.
      </>
    ),
    notNumeric: "'plan' — не числовое поле",
    exportTitle: 'Экспорт (необязательно)',
    exportText: 'Загружайте модуль экспорта только тогда, когда пользователь просит скачать файл:',
    next: (
      <>
        Дальше: <Link to="/quick-start">Быстрый старт</Link>.
      </>
    ),
  },
};

export function Installation() {
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader eyebrow={ui.nav.gettingStarted} title={ui.pages.installation} lead={t.lead} />
      <Callout tone="warning" title={t.notOnNpmTitle}>
        {t.notOnNpm}
      </Callout>

      <Section id="install" title={t.install}>
        <CodeBlock
          files={[
            { name: 'pnpm', code: 'pnpm add @jafari/charts', language: 'bash' },
            { name: 'npm', code: 'npm install @jafari/charts', language: 'bash' },
            { name: 'yarn', code: 'yarn add @jafari/charts', language: 'bash' },
          ]}
        />
        <p>{t.peers}</p>
      </Section>

      <Section id="entry-points" title={t.entryPoints}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.importCol}</th>
                <th scope="col">{t.contentsCol}</th>
              </tr>
            </thead>
            <tbody>
              {ENTRY_POINTS.map((entry) => (
                <tr key={entry}>
                  <th scope="row">
                    <code>{entry}</code>
                  </th>
                  <td>{t.entries[entry]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="styles" title={t.styles}>
        <p>{t.stylesText}</p>
        <CodeBlock
          title="main.tsx"
          code={`import '@jafari/charts/styles.css';
import { ChartProvider } from '@jafari/charts';

root.render(
  <ChartProvider injectStyles={false}>
    <App />
  </ChartProvider>,
);`}
        />
      </Section>

      <Section id="ssr" title={t.ssr}>
        <p>{t.ssrText}</p>
        <p>{t.useClient}</p>
        <CodeBlock
          title="app/page.tsx"
          code={`import { LineChart } from '@jafari/charts';

export default async function Page() {
  const data = await getAnalytics();
  return <LineChart data={data} xKey="date" yKey="users" initialWidth={720} />;
}`}
        />
      </Section>

      <Section id="typescript" title={t.typescript}>
        <p>{t.typescriptText}</p>
        <CodeBlock
          code={`type Row = { date: string; users: number; plan: string };

<LineChart<Row> data={rows} xKey="date" yKey="users" />; // ✓
<LineChart<Row> data={rows} xKey="date" yKey="plan" />;  // ✗ ${t.notNumeric}`}
        />
      </Section>

      <Section id="export" title={t.exportTitle}>
        <p>{t.exportText}</p>
        <CodeBlock
          code={`const { exportChart } = await import('@jafari/charts/export');
await exportChart(element, { format: 'png', scale: 2, background: 'light', filename: 'growth' });`}
        />
        <p>{t.next}</p>
      </Section>
    </article>
  );
}

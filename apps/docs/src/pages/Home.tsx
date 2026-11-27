import { AreaChart, formatNumber } from '@startupjafari/charts';
import type { ReactNode } from 'react';
import bench from '../../../../benchmarks/results/latest.json';
import sizes from '../../../../benchmarks/size.json';
import { CHARTS } from '../docs/charts';
import { dailyUsers } from '../examples/data';
import { ruPlural, useLang, useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Example } from '../ui/Example';
import { ChartCard } from './ChartsIndex';

interface HomeText {
  eyebrow: string;
  lead: string;
  getStarted: string;
  openPlayground: string;
  browseCharts: (count: number) => string;
  hero: { sessions: string; users: string; title: string };
  keyNumbers: string;
  /** Formats a size from benchmarks/size.json (a decimal string such as "13.8"). */
  kb: (value: string) => string;
  lineSize: string;
  allSize: string;
  domNodes: string;
  dependencies: string;
  statsNote: ReactNode;
  why: string;
  features: readonly { title: string; text: string }[];
  oneLine: string;
  oneLineLead: string;
  firstChart: string;
  gallery: string;
  allCharts: string;
  dashboard: string;
}

const TEXT: L<HomeText> = {
  en: {
    eyebrow: 'React charting library · v0.1.0',
    lead: 'A self-contained data visualisation library for React with its own math core, SVG and Canvas renderers and one consistent visual language.',
    getStarted: 'Get started',
    openPlayground: 'Open the playground',
    browseCharts: (n) => `Browse ${n} charts →`,
    hero: {
      sessions: 'Sessions',
      users: 'Active users',
      title: 'Sessions and active users, last 120 days',
    },
    keyNumbers: 'Key numbers',
    kb: (v) => `${v} KB`,
    lineSize: 'gzip for a LineChart, including the math and CSS it uses',
    allSize: 'gzip for everything in @startupjafari/charts',
    domNodes: 'DOM nodes for a 100 000-point line chart (SVG)',
    dependencies: 'third-party chart or math dependencies',
    statsNote: (
      <>
        Sizes from <code>pnpm size</code>; DOM count from the committed benchmark run (
        <Link to="/performance">methodology</Link>).
      </>
    ),
    why: 'Why Jafari Charts',
    features: [
      {
        title: 'Performance first',
        text: 'Memoised layouts, one frame-throttled pointer handler per chart, batched SVG paths, LTTB downsampling and k-d tree hit testing. Hover re-renders only the tooltip.',
      },
      {
        title: 'Beautiful by default',
        text: 'A validated palette, 2 px lines, rounded data ends, hairline grids and value-first tooltips — with no configuration.',
      },
      {
        title: 'Lightweight',
        text: 'Zero runtime dependencies in the core, one module per source file and lazy Canvas and export chunks. Budgets are checked in CI.',
      },
      {
        title: 'Zero chart dependencies',
        text: 'Every scale, tick algorithm, curve, layout and interaction is implemented in the project — nothing is wrapped.',
      },
      {
        title: 'Accessible',
        text: 'Keyboard navigation, live announcements, hidden data tables, legend buttons with aria-pressed and identity that never relies on colour alone.',
      },
      {
        title: 'SSR and theming built in',
        text: 'Deterministic layout without DOM reads, hydration without mismatches, light/dark/auto themes and CSS variables for every token.',
      },
    ],
    oneLine: 'A chart in one line',
    oneLineLead:
      'Charts fill their container, pick tick values that never overlap, show a tooltip and a hidden data table for screen readers — without configuration. Keys are type-checked against your data.',
    firstChart: 'Your first chart',
    gallery: 'Gallery',
    allCharts: 'See all charts →',
    dashboard: 'Dashboard example →',
  },
  ru: {
    eyebrow: 'Библиотека диаграмм для React · v0.1.0',
    lead: 'Самодостаточная библиотека визуализации данных для React — с собственным математическим ядром, SVG- и Canvas-рендерерами и единым визуальным языком.',
    getStarted: 'Начать',
    openPlayground: 'Открыть песочницу',
    browseCharts: (n) => `Смотреть ${n} ${ruPlural(n, ['диаграмму', 'диаграммы', 'диаграмм'])} →`,
    hero: {
      sessions: 'Сессии',
      users: 'Активные пользователи',
      title: 'Сессии и активные пользователи за последние 120 дней',
    },
    keyNumbers: 'Ключевые цифры',
    kb: (v) => `${v.replace('.', ',')} КБ`,
    lineSize: 'gzip для LineChart вместе с нужной ему математикой и CSS',
    allSize: 'gzip для всего @startupjafari/charts',
    domNodes: 'DOM-узлов у линейной диаграммы на 100 000 точек (SVG)',
    dependencies: 'сторонних зависимостей для диаграмм или математики',
    statsNote: (
      <>
        Размеры — из <code>pnpm size</code>, число DOM-узлов — из закоммиченного прогона бенчмарков
        (<Link to="/performance">методика</Link>).
      </>
    ),
    why: 'Почему Jafari Charts',
    features: [
      {
        title: 'Производительность прежде всего',
        text: 'Мемоизированные раскладки, один обработчик указателя на диаграмму с троттлингом по кадрам, пакетная отрисовка SVG-путей, прореживание LTTB и поиск элемента под указателем через k-d-дерево. При наведении перерисовывается только подсказка.',
      },
      {
        title: 'Красиво по умолчанию',
        text: 'Проверенная палитра, линии толщиной 2 px, скругления на концах столбцов, тонкая сетка и подсказки, где на первом месте значение, — всё это без настройки.',
      },
      {
        title: 'Лёгкость',
        text: 'Ядро без зависимостей во время выполнения, по модулю на каждый исходный файл, ленивые чанки для Canvas и экспорта. Лимиты размера проверяются в CI.',
      },
      {
        title: 'Без сторонних библиотек диаграмм',
        text: 'Все шкалы, алгоритмы делений, кривые, раскладки и взаимодействия реализованы в самом проекте — ничего не взято в обёртку.',
      },
      {
        title: 'Доступность',
        text: 'Навигация с клавиатуры, живые оповещения, скрытые таблицы данных, кнопки легенды с aria-pressed и различимость рядов, которая не держится на одном цвете.',
      },
      {
        title: 'SSR и темы из коробки',
        text: 'Детерминированная раскладка без чтения DOM, гидратация без расхождений, светлая, тёмная и автоматическая темы и CSS-переменная для каждого токена.',
      },
    ],
    oneLine: 'Диаграмма в одну строку',
    oneLineLead:
      'Диаграммы заполняют контейнер, подбирают деления так, чтобы подписи не перекрывались, показывают подсказку и скрытую таблицу данных для скринридеров — без настройки. Ключи проверяются по типу ваших данных.',
    firstChart: 'Ваша первая диаграмма',
    gallery: 'Галерея',
    allCharts: 'Все диаграммы →',
    dashboard: 'Пример дашборда →',
  },
};

function sizeOf(prefix: string): string | null {
  const row = sizes.find((r) => r.scenario.startsWith(prefix));
  return row ? row['gzip KB'] : null;
}

/** Hero chart: a page decoration, so its labels follow the site language. */
function HeroChart({ text }: { text: HomeText['hero'] }) {
  return (
    <AreaChart
      data={dailyUsers}
      xKey="date"
      series={[
        { key: 'sessions', label: text.sessions },
        { key: 'users', label: text.users },
      ]}
      legend={{ position: 'top', align: 'end' }}
      height={300}
      title={text.title}
    />
  );
}

export function Home() {
  const lang = useLang();
  const ui = useT();
  const t = useText(TEXT);
  const lineKb = sizeOf('app: LineChart');
  const allKb = sizeOf('app: everything');
  const big = bench.scaling.find(
    (r) => r.chart === 'line' && r.renderer === 'svg' && r.points === 100000,
  );
  const featured = [
    'line-chart',
    'bar-chart',
    'donut-chart',
    'stacked-area-chart',
    'gauge-chart',
    'waterfall-chart',
  ]
    .map((slug) => CHARTS.find((c) => c.slug === slug))
    .filter((c) => c !== undefined);
  return (
    <article className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="hero-title">Jafari Charts</h1>
          <p className="hero-tagline">{ui.meta.tagline}</p>
          <p className="lead">{t.lead}</p>
          <div className="hero-actions">
            <Link to="/getting-started" className="btn btn-primary">
              {t.getStarted}
            </Link>
            <Link to="/playground" className="btn">
              {t.openPlayground}
            </Link>
            <Link to="/charts" className="btn btn-ghost">
              {t.browseCharts(CHARTS.length)}
            </Link>
          </div>
        </div>
        <div className="hero-chart card">
          <ErrorBoundary label={ui.errors.chart}>
            <HeroChart text={t.hero} />
          </ErrorBoundary>
        </div>
      </section>

      <section className="stats" aria-label={t.keyNumbers}>
        {lineKb ? (
          <div className="stat">
            <span className="stat-value">{t.kb(lineKb)}</span>
            <span className="stat-label">{t.lineSize}</span>
          </div>
        ) : null}
        {allKb ? (
          <div className="stat">
            <span className="stat-value">{t.kb(allKb)}</span>
            <span className="stat-label">{t.allSize}</span>
          </div>
        ) : null}
        {big ? (
          <div className="stat">
            <span className="stat-value">{formatNumber(big.domNodes, { locale: lang })}</span>
            <span className="stat-label">{t.domNodes}</span>
          </div>
        ) : null}
        <div className="stat">
          <span className="stat-value">0</span>
          <span className="stat-label">{t.dependencies}</span>
        </div>
      </section>
      <p className="muted stats-note">{t.statsNote}</p>

      <section className="doc-section" aria-labelledby="features">
        <h2 id="features">{t.why}</h2>
        <div className="feature-grid">
          {t.features.map((f) => (
            <div key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section" aria-labelledby="one-line">
        <h2 id="one-line">{t.oneLine}</h2>
        <p className="section-lead">{t.oneLineLead}</p>
        <Example id="home/OneLine" title={t.firstChart} codeOpen />
      </section>

      <section className="doc-section" aria-labelledby="gallery">
        <h2 id="gallery">{t.gallery}</h2>
        <div className="card-grid">
          {featured.map((d) => (
            <ChartCard key={d.slug} doc={d} />
          ))}
        </div>
        <p>
          <Link to="/charts">{t.allCharts}</Link> · <Link to="/examples">{t.dashboard}</Link>
        </p>
      </section>
    </article>
  );
}

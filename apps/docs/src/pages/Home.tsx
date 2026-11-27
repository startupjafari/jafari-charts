import { AreaChart, BarChart, DonutChart, formatNumber, GaugeChart } from '@startupjafari/charts';
import {
  Accessibility,
  ArrowRight,
  Blocks,
  BookOpen,
  Braces,
  Feather,
  FlaskConical,
  Gauge,
  LayoutGrid,
  Server,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Suspense, use, type ReactNode } from 'react';
import bench from '../../../../benchmarks/results/latest.json';
import sizes from '../../../../benchmarks/size.json';
import { CHARTS } from '../docs/charts';
import { dailyUsers, devices, registrations } from '../examples/data';
import OneLine from '../examples/home/OneLine';
import { loadCode } from '../examples';
import { ruPlural, useLang, useT, useText, type L, type Lang } from '../i18n';
import { cn } from '../lib/cn';
import { Link } from '../lib/router';
import { buttonVariants } from '../ui/button';
import { SectionPanel } from '../ui/card';
import { CodeBlock } from '../ui/CodeBlock';
import { CopyButton } from '../ui/CopyButton';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { ChartCard } from './ChartsIndex';

interface HomeText {
  eyebrow: string;
  titleLines: readonly [string, string];
  lead: string;
  getStarted: string;
  browseCharts: (count: number) => string;
  openPlayground: string;
  installLabel: string;
  showcase: {
    title: string;
    lead: string;
    traffic: { title: string; subtitle: string; sessions: string; users: string };
    devices: { title: string; subtitle: string; names: Record<string, string> };
    registrations: { title: string; subtitle: string; students: string };
    satisfaction: {
      title: string;
      subtitle: string;
      label: string;
      bands: [string, string, string];
    };
  };
  start: { title: string; lead: string };
  paths: readonly { to: string; icon: LucideIcon; title: string; text: string }[];
  keyNumbers: string;
  /** Formats a size from benchmarks/size.json (a decimal string such as "13.8"). */
  kb: (value: string) => string;
  lineSize: string;
  allSize: string;
  domNodes: string;
  dependencies: string;
  statsNote: ReactNode;
  why: string;
  whyLead: string;
  features: readonly { title: string; text: string }[];
  oneLine: string;
  oneLineLead: string;
  gallery: string;
  galleryLead: string;
  allCharts: string;
  dashboard: string;
}

const FEATURE_ICONS: readonly LucideIcon[] = [
  Gauge,
  Sparkles,
  Feather,
  Blocks,
  Accessibility,
  Server,
];

const TEXT: L<HomeText> = {
  en: {
    eyebrow: 'React charting library · v0.1.0',
    titleLines: ['Beautiful charts for React,', 'engineered for performance.'],
    lead: 'A self-contained data visualisation library for React with its own math core, SVG and Canvas renderers and one consistent visual language.',
    getStarted: 'Get started',
    browseCharts: (n) => `Browse ${n} charts`,
    openPlayground: 'Open the playground',
    installLabel: 'Install with pnpm',
    showcase: {
      title: 'Live, not screenshots',
      lead: 'Every chart on this page is rendered by the library right now. Hover, tab into them, switch the theme.',
      traffic: {
        title: 'Sessions and active users',
        subtitle: 'AreaChart · 120 days, shared tooltip and crosshair',
        sessions: 'Sessions',
        users: 'Active users',
      },
      devices: {
        title: 'Traffic by device',
        subtitle: 'DonutChart · total in the centre',
        names: { Mobile: 'Mobile', Desktop: 'Desktop', Tablet: 'Tablet', Other: 'Other' },
      },
      registrations: {
        title: 'Student registrations',
        subtitle: 'BarChart · one line of code',
        students: 'Students',
      },
      satisfaction: {
        title: 'Student satisfaction',
        subtitle: 'GaugeChart · coloured bands',
        label: 'Satisfaction',
        bands: ['Low', 'Medium', 'High'],
      },
    },
    start: {
      title: 'Where to start',
      lead: 'Four ways into the docs, depending on what you need right now.',
    },
    paths: [
      {
        to: '/getting-started',
        icon: BookOpen,
        title: 'Getting started',
        text: 'What the library is, how it is built, and your first chart in a few minutes.',
      },
      {
        to: '/charts',
        icon: LayoutGrid,
        title: 'Charts',
        text: 'Every chart type with live examples, when to use it, and its props.',
      },
      {
        to: '/api',
        icon: Braces,
        title: 'API reference',
        text: 'Exported components, hooks, helpers and types, all in one place.',
      },
      {
        to: '/playground',
        icon: FlaskConical,
        title: 'Playground',
        text: 'Change props, data size and renderer, and watch render time live.',
      },
    ],
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
    whyLead:
      'Good defaults everywhere, so the chart you get without configuration is the one you ship.',
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
    gallery: 'Gallery',
    galleryLead: 'A few of the chart types. Each page explains when to use it.',
    allCharts: 'See all charts',
    dashboard: 'Dashboard example',
  },
  ru: {
    eyebrow: 'Библиотека диаграмм для React · v0.1.0',
    titleLines: ['Красивые диаграммы для React,', 'спроектированные для скорости.'],
    lead: 'Самодостаточная библиотека визуализации данных для React — с собственным математическим ядром, SVG- и Canvas-рендерерами и единым визуальным языком.',
    getStarted: 'Начать',
    browseCharts: (n) => `${n} ${ruPlural(n, ['диаграмма', 'диаграммы', 'диаграмм'])}`,
    openPlayground: 'Открыть песочницу',
    installLabel: 'Установка через pnpm',
    showcase: {
      title: 'Вживую, а не скриншоты',
      lead: 'Все диаграммы на этой странице прямо сейчас строит библиотека. Наведите указатель, перейдите к ним клавишей Tab, смените тему.',
      traffic: {
        title: 'Сессии и активные пользователи',
        subtitle: 'AreaChart · 120 дней, общая подсказка и перекрестие',
        sessions: 'Сессии',
        users: 'Активные пользователи',
      },
      devices: {
        title: 'Трафик по устройствам',
        subtitle: 'DonutChart · сумма в центре',
        names: { Mobile: 'Телефон', Desktop: 'Компьютер', Tablet: 'Планшет', Other: 'Другое' },
      },
      registrations: {
        title: 'Регистрации студентов',
        subtitle: 'BarChart · одна строка кода',
        students: 'Студенты',
      },
      satisfaction: {
        title: 'Удовлетворённость студентов',
        subtitle: 'GaugeChart · цветные диапазоны',
        label: 'Удовлетворённость',
        bands: ['Низкая', 'Средняя', 'Высокая'],
      },
    },
    start: {
      title: 'С чего начать',
      lead: 'Четыре входа в документацию — в зависимости от того, что нужно прямо сейчас.',
    },
    paths: [
      {
        to: '/getting-started',
        icon: BookOpen,
        title: 'Начало работы',
        text: 'Что это за библиотека, как она устроена и первая диаграмма за несколько минут.',
      },
      {
        to: '/charts',
        icon: LayoutGrid,
        title: 'Диаграммы',
        text: 'Все типы диаграмм с живыми примерами, подсказкой, когда их выбирать, и пропсами.',
      },
      {
        to: '/api',
        icon: Braces,
        title: 'Справочник API',
        text: 'Экспортируемые компоненты, хуки, утилиты и типы — в одном месте.',
      },
      {
        to: '/playground',
        icon: FlaskConical,
        title: 'Песочница',
        text: 'Меняйте пропсы, объём данных и рендерер и смотрите время отрисовки вживую.',
      },
    ],
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
    whyLead:
      'Продуманные значения по умолчанию везде — поэтому диаграмма без настройки и есть та, что уходит в продакшен.',
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
    gallery: 'Галерея',
    galleryLead: 'Несколько типов диаграмм. На странице каждого — когда его выбирать.',
    allCharts: 'Все диаграммы',
    dashboard: 'Пример дашборда',
  },
};

const INSTALL = 'pnpm add @startupjafari/charts';

function sizeOf(prefix: string): string | null {
  const row = sizes.find((r) => r.scenario.startsWith(prefix));
  return row ? row['gzip KB'] : null;
}

function monthName(index: number, lang: Lang): string {
  const name = new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' }).format(
    Date.UTC(2025, index, 1),
  );
  return name.charAt(0).toUpperCase() + name.slice(1).replace('.', '');
}

/** The example's real source (the same file that renders next to it). */
function OneLineCode() {
  const files = use(loadCode('home/OneLine'));
  const main = files[0];
  return main ? <CodeBlock code={main.code} title={main.name} className="my-0" /> : null;
}

/** Page width container shared by every home section. */
function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

function SectionHeading({ id, title, lead }: { id: string; title: string; lead?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2
        id={id}
        className="title-gradient m-0 text-[1.625rem] leading-tight font-semibold tracking-[-0.03em] sm:text-[2rem]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="m-0 max-w-[60ch] text-[1rem] leading-relaxed text-foreground/70">{lead}</p>
      ) : null}
    </div>
  );
}

/** Live showcase: four charts in StudentHub-style section panels. */
function Showcase({ text }: { text: HomeText['showcase'] }) {
  const lang = useLang();
  const ui = useT();
  const months = registrations.map((r, i) => ({ month: monthName(i, lang), students: r.students }));
  const deviceData = devices.map((d) => ({
    device: text.devices.names[d.device] ?? d.device,
    share: d.share,
  }));
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SectionPanel
        className="lg:col-span-2"
        title={text.traffic.title}
        subtitle={text.traffic.subtitle}
      >
        <ErrorBoundary label={ui.errors.chart}>
          <AreaChart
            data={dailyUsers}
            xKey="date"
            series={[
              { key: 'sessions', label: text.traffic.sessions },
              { key: 'users', label: text.traffic.users },
            ]}
            legend={{ position: 'top', align: 'end' }}
            height={260}
            title={text.traffic.title}
          />
        </ErrorBoundary>
      </SectionPanel>
      <SectionPanel title={text.devices.title} subtitle={text.devices.subtitle}>
        <ErrorBoundary label={ui.errors.chart}>
          <DonutChart
            data={deviceData}
            labelKey="device"
            valueKey="share"
            height={240}
            title={text.devices.title}
          />
        </ErrorBoundary>
      </SectionPanel>
      <SectionPanel
        className="lg:col-span-2"
        title={text.registrations.title}
        subtitle={text.registrations.subtitle}
      >
        <ErrorBoundary label={ui.errors.chart}>
          <BarChart
            data={months}
            xKey="month"
            yKey="students"
            label={text.registrations.students}
            height={220}
            title={text.registrations.title}
          />
        </ErrorBoundary>
      </SectionPanel>
      <SectionPanel title={text.satisfaction.title} subtitle={text.satisfaction.subtitle}>
        <ErrorBoundary label={ui.errors.chart}>
          <GaugeChart
            value={68}
            label={text.satisfaction.label}
            bands={[
              { to: 40, color: 'var(--jc-negative)', label: text.satisfaction.bands[0] },
              { to: 75, color: 'var(--jc-warning)', label: text.satisfaction.bands[1] },
              { to: 100, color: 'var(--jc-positive)', label: text.satisfaction.bands[2] },
            ]}
            title={text.satisfaction.title}
          />
        </ErrorBoundary>
      </SectionPanel>
    </div>
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
  const stats = [
    lineKb ? { value: t.kb(lineKb), label: t.lineSize } : null,
    allKb ? { value: t.kb(allKb), label: t.allSize } : null,
    big ? { value: formatNumber(big.domNodes, { locale: lang }), label: t.domNodes } : null,
    { value: '0', label: t.dependencies },
  ].filter((s) => s !== null);
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="mesh-dots pointer-events-none absolute inset-0 -z-10" />
        <Container className="flex flex-col items-center pt-14 pb-12 text-center sm:pt-20 sm:pb-16">
          <span className="soft-up inline-flex items-center gap-2.5 rounded-full border border-border bg-background/70 py-1.5 pr-3.5 pl-3 text-[0.8125rem] font-medium text-muted-foreground backdrop-blur-sm">
            <span aria-hidden className="relative grid size-2 place-items-center">
              <span className="absolute inset-0 rounded-full bg-primary" />
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
            </span>
            {t.eyebrow}
          </span>
          <h1
            id="hero-title"
            className="mt-6 mb-0 max-w-[22ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.06] font-semibold tracking-[-0.038em] text-balance"
          >
            <span className="sr-only">Jafari Charts — </span>
            <span className="title-gradient block soft-up [--delay:0.05s]">{t.titleLines[0]}</span>
            <span className="title-accent block soft-up [--delay:0.12s]">{t.titleLines[1]}</span>
          </h1>
          <p className="soft-up mt-6 mb-0 max-w-[58ch] text-[clamp(1rem,1.4vw,1.125rem)] leading-relaxed text-muted-foreground [--delay:0.2s]">
            {t.lead}
          </p>
          <div className="soft-up mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap [--delay:0.28s]">
            <Link
              to="/getting-started"
              className={cn(buttonVariants({ size: 'xl' }), 'primary-glow')}
            >
              {t.getStarted}
              <ArrowRight aria-hidden />
            </Link>
            <Link to="/charts" className={buttonVariants({ variant: 'outline', size: 'xl' })}>
              <LayoutGrid aria-hidden />
              {t.browseCharts(CHARTS.length)}
            </Link>
          </div>
          <div className="soft-up mt-6 flex max-w-full items-center gap-1 rounded-xl border border-border bg-code py-1 pr-1 pl-3.5 font-mono text-[0.8125rem] shadow-sm [--delay:0.34s]">
            <span aria-hidden className="mr-1 text-muted-foreground select-none">
              $
            </span>
            <code
              className="truncate bg-transparent p-0 text-[0.8125rem]"
              aria-label={t.installLabel}
            >
              {INSTALL}
            </code>
            <CopyButton text={INSTALL} className="ml-2" />
          </div>
        </Container>
      </section>

      {/* ── Live showcase ────────────────────────────────────────────────── */}
      <Container className="pb-4">
        <section aria-labelledby="showcase">
          <SectionHeading id="showcase" title={t.showcase.title} lead={t.showcase.lead} />
          <Showcase text={t.showcase} />
        </section>

        {/* ── Key numbers ──────────────────────────────────────────────────── */}
        <section className="mt-6" aria-label={t.keyNumbers}>
          <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1 rounded-xl bg-card px-4 py-3.5 ring-1 ring-foreground/10"
              >
                <dt className="order-2 text-[0.8125rem] leading-snug text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 m-0 text-2xl leading-tight font-semibold tracking-[-0.02em] tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 mb-0 text-[0.8125rem] text-muted-foreground">{t.statsNote}</p>
        </section>

        {/* ── Where to start ───────────────────────────────────────────────── */}
        <section className="mt-16" aria-labelledby="start">
          <SectionHeading id="start" title={t.start.title} lead={t.start.lead} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.paths.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  className="group/path flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 outline-none hover:bg-muted/40 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      {p.title}
                      <ArrowRight
                        className="size-4 text-muted-foreground group-hover/path:translate-x-0.5 group-hover/path:text-primary-ink"
                        aria-hidden
                      />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{p.text}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── A chart in one line ──────────────────────────────────────────── */}
        <section className="mt-16" aria-labelledby="one-line">
          <SectionHeading id="one-line" title={t.oneLine} lead={t.oneLineLead} />
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            <Suspense
              fallback={<div className="min-h-40 rounded-xl bg-code ring-1 ring-foreground/10" />}
            >
              <OneLineCode />
            </Suspense>
            <div className="flex flex-col justify-center rounded-xl bg-preview p-4 ring-1 ring-foreground/10 sm:p-5">
              <ErrorBoundary label={ui.errors.chart}>
                <OneLine />
              </ErrorBoundary>
            </div>
          </div>
        </section>

        {/* ── Why ──────────────────────────────────────────────────────────── */}
        <section className="mt-16" aria-labelledby="features">
          <SectionHeading id="features" title={t.why} lead={t.whyLead} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Sparkles;
              return (
                <div
                  key={f.title}
                  className="flex gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="m-0 text-[0.9375rem] font-semibold">{f.title}</h3>
                    <p className="mt-1 mb-0 text-sm leading-relaxed text-muted-foreground">
                      {f.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Gallery ──────────────────────────────────────────────────────── */}
        <section className="mt-16" aria-labelledby="gallery">
          <SectionHeading id="gallery" title={t.gallery} lead={t.galleryLead} />
          <div className="card-grid">
            {featured.map((d) => (
              <ChartCard key={d.slug} doc={d} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/charts" className={buttonVariants({ variant: 'outline', size: 'md' })}>
              {t.allCharts}
              <ArrowRight aria-hidden />
            </Link>
            <Link to="/examples" className={buttonVariants({ variant: 'ghost', size: 'md' })}>
              {t.dashboard}
              <ArrowRight aria-hidden />
            </Link>
            <Link to="/playground" className={buttonVariants({ variant: 'ghost', size: 'md' })}>
              {t.openPlayground}
              <ArrowRight aria-hidden />
            </Link>
          </div>
        </section>
      </Container>
    </article>
  );
}

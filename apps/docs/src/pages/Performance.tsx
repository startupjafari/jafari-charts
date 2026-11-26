import { ChartReferenceLine, formatDate, formatNumber, GroupedBarChart } from '@jafari/charts';
import type { ReactNode } from 'react';
import bench from '../../../../benchmarks/results/latest.json';
import sizes from '../../../../benchmarks/size.json';
import { ruPlural, useLang, useT, useText, type L, type Lang } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';

/**
 * Benchmark and bundle-size results, imported from the repository at build time
 * (`benchmarks/results/latest.json`, `benchmarks/size.json`) and drawn with
 * Jafari Charts. Nothing here is hand-entered.
 */

type ScalingRow = (typeof bench.scaling)[number];

interface PerformanceText {
  lead: string;
  toc: readonly (readonly [id: string, title: string])[];
  run: string;
  date: string;
  cpu: string;
  cpuValue: (cpu: string, cores: number, memoryGB: number) => string;
  browser: string;
  browserValue: (version: string) => string;
  mode: string;
  quickRun: string;
  fullRun: string;
  machineTitle: string;
  machine: string;
  single: string;
  mountTitle: string;
  mountLead: string;
  mountChart: string;
  updateTitle: string;
  updateLead: string;
  outlier: (o: { renderer: string; chart: string; points: string; time: string }) => ReactNode;
  updateChart: string;
  domTitle: string;
  domLead: string;
  domChart: string;
  hoverTitle: string;
  hoverLead: string;
  hoverChart: string;
  msUnit: string;
  mbUnit: string;
  kbUnit: string;
  /** Compact point counts: 100000 → "100k". */
  points: (n: number) => string;
  /** Benchmark chart ids (`line`, `bar`…) as shown in labels and tables. */
  chartName: (id: string) => string;
  scalingCaption: string;
  multiCaption: string;
  cols: {
    chart: string;
    renderer: string;
    points: string;
    mount: string;
    update: string;
    hoverP50: string;
    hoverP95: string;
    longTasks: string;
    domNodes: string;
    heap: string;
    charts: string;
    filterSwitch: string;
    resize: string;
    longestTask: string;
  };
  many: string;
  manyLead: string;
  chartsCount: (n: number) => string;
  manyChart: string;
  scenarios: string;
  scenarioName: (name: string) => string;
  perUpdate: (p50: string, p95: string) => string;
  leak: (o: { start: number; end: number; delta: number; dom: number }) => string;
  bundle: string;
  bundleLead: ReactNode;
  gzipSeries: string;
  budgetSeries: string;
  bundleChart: string;
  sizeScenario: (name: string) => string;
  sizeCols: { scenario: string; minified: string; gzip: string; budget: string; status: string };
  status: (status: string) => string;
  methodology: string;
  methodItems: readonly ReactNode[];
  commands: string;
  ownDevice: ReactNode;
  renderer: string;
  rendererText: readonly ReactNode[];
}

const RU_SCENARIOS: Record<string, string> = {
  'streaming (1 000-point window)': 'потоковые данные (окно в 1 000 точек)',
  'leak check (100 × mount/unmount of 10 charts)':
    'проверка утечек (100 × монтирование и размонтирование 10 диаграмм)',
};

const RU_SIZE_SCENARIOS: Record<string, string> = {
  'core: scales + ticks + format': 'core: шкалы + деления + форматирование',
  'core: base (scales, ticks, geometry, curves, data, formatting)':
    'core: база (шкалы, деления, геометрия, кривые, данные, форматирование)',
  'core: everything (incl. chart models)': 'core: всё (включая модели диаграмм)',
  'react layer: LineChart (core external)': 'слой React: LineChart (core — внешний)',
  'react layer: all components (core external)': 'слой React: все компоненты (core — внешний)',
  'app: LineChart (React layer + core it needs)':
    'приложение: LineChart (слой React + нужная ему часть core)',
  'app: AreaChart + BarChart + Sparkline': 'приложение: AreaChart + BarChart + Sparkline',
  'app: everything from @jafari/charts': 'приложение: всё из @jafari/charts',
  'canvas renderer (lazy chunk, core external)': 'рендерер canvas (ленивый чанк, core — внешний)',
  'export module': 'модуль экспорта',
  'themes: tokens only': 'темы: только токены',
};

/** Short names: they are x-axis labels on the charts below. */
const RU_CHARTS: Record<string, string> = {
  line: 'линии',
  area: 'области',
  bar: 'столбцы',
  scatter: 'точки',
};

const TEXT: L<PerformanceText> = {
  en: {
    lead: 'Results of the repository’s benchmark suite and bundle-size check, drawn with Jafari Charts. Every number on this page comes from files committed to the repository.',
    toc: [
      ['run', 'This run'],
      ['single', 'Single chart'],
      ['many', 'Many charts'],
      ['scenarios', 'Scenarios'],
      ['bundle', 'Bundle size'],
      ['methodology', 'Methodology'],
      ['renderer', 'SVG or Canvas'],
    ],
    run: 'This run',
    date: 'Date',
    cpu: 'CPU',
    cpuValue: (cpu, cores, memory) => `${cpu} (${cores} cores, ${memory} GB)`,
    browser: 'Browser',
    browserValue: (v) => `Chromium ${v} (Playwright, headless)`,
    mode: 'Mode',
    quickRun: 'Quick run (fewer sizes and repetitions)',
    fullRun: 'Full run',
    machineTitle: 'Absolute numbers depend on the machine',
    machine:
      'Compare runs made on the same machine. These results describe Jafari Charts only; no other libraries were measured, so this page makes no comparisons.',
    single: 'Single chart',
    mountTitle: 'Mount time',
    mountLead:
      'Median time from mounting the chart to the next painted frame, by chart type and input size.',
    mountChart: 'Mount time by chart, size and renderer',
    updateTitle: 'Update time',
    updateLead: 'Median time to replace the whole dataset (filter switching) and paint.',
    outlier: (o) => (
      <>
        One result is far outside the others and is left out of the chart so the rest stay readable:
        the {o.renderer} {o.chart} chart with {o.points} points took {o.time} (it is in the table
        below). ARCHITECTURE.md §7 describes the Canvas batching fix for this case (flushing every
        256 subpaths); re-running <code>pnpm bench</code> refreshes these results.
      </>
    ),
    updateChart: 'Update time by chart, size and renderer',
    domTitle: 'DOM size',
    domLead:
      'Elements inside the benchmark container. Mark batching and downsampling keep the DOM almost constant from 365 to 100 000 points.',
    domChart: 'DOM nodes by chart, size and renderer',
    hoverTitle: 'Hover latency (p95)',
    hoverLead:
      'Time from a pointer move to the next frame, 95th percentile of 40 moves. The dashed line is one frame at 60 Hz (16.7 ms): values around it mean the hover update fits in a single frame.',
    hoverChart: 'Hover latency p95',
    msUnit: 'ms',
    mbUnit: 'MB',
    kbUnit: 'KB',
    points: (n) => (n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1000 ? `${n / 1000}k` : String(n)),
    chartName: (id) => id,
    scalingCaption: 'Single chart (benchmarks/results/latest.json → scaling)',
    multiCaption: 'Many line charts on one page, 365 points each (→ multi)',
    cols: {
      chart: 'Chart',
      renderer: 'Renderer',
      points: 'Points',
      mount: 'Mount',
      update: 'Update',
      hoverP50: 'Hover p50',
      hoverP95: 'Hover p95',
      longTasks: 'Long tasks',
      domNodes: 'DOM nodes',
      heap: 'Heap',
      charts: 'Charts',
      filterSwitch: 'Filter switch',
      resize: 'Resize',
      longestTask: 'Longest task',
    },
    many: 'Many charts on one page',
    manyLead:
      'Line charts with 365 points each. Filter switch replaces every chart’s data; resize changes the container width. All charts share one ResizeObserver.',
    chartsCount: (n) => `${n} charts`,
    manyChart: 'Many charts: mount, filter switch and resize',
    scenarios: 'Scenarios',
    scenarioName: (name) => name,
    perUpdate: (p50, p95) => `p50 ${p50}, p95 ${p95} per update (render + next frame)`,
    leak: (o) =>
      `heap ${o.start} MB → ${o.end} MB (Δ ${o.delta} MB), ${o.dom} DOM nodes left behind`,
    bundle: 'Bundle size',
    bundleLead: (
      <>
        From <code>pnpm size</code> (benchmarks/size.json): a consumer build with Vite, minified and
        gzipped, React external. Each scenario has a budget that fails the check when exceeded.
      </>
    ),
    gzipSeries: 'gzip KB',
    budgetSeries: 'Budget KB',
    bundleChart: 'Bundle size against budget',
    sizeScenario: (name) => name,
    sizeCols: {
      scenario: 'Scenario',
      minified: 'Minified',
      gzip: 'gzip',
      budget: 'Budget',
      status: 'Status',
    },
    status: (s) => s,
    methodology: 'Methodology',
    methodItems: [
      <>
        <strong>Production build.</strong> <code>pnpm bench</code> builds the playground app with
        Vite and serves it with <code>vite preview</code>; nothing runs in development mode.
      </>,
      <>
        <strong>Chromium.</strong> Pages are driven by Playwright’s Chromium (version above) in a
        1000 × 800 viewport, with animations off.
      </>,
      <>
        <strong>Medians.</strong> Mount is the median of 3 fresh page loads, update the median of 5
        dataset replacements; multi-chart filter switch and resize are medians of 4.
      </>,
      <>
        <strong>Mount / update / resize</strong>: from a synchronous React commit (
        <code>flushSync</code>) to the next frame (<code>requestAnimationFrame</code> +{' '}
        <code>setTimeout</code>), so layout and paint are included.
      </>,
      <>
        <strong>Hover p50/p95</strong>: synthetic pointer moves across the chart; time from dispatch
        to the next frame. <strong>Long tasks</strong> are counted with a{' '}
        <code>PerformanceObserver</code> (tasks over 50 ms) during hovering.
      </>,
      <>
        <strong>DOM nodes</strong>: all elements inside the benchmark container.{' '}
        <strong>Heap</strong>: <code>performance.memory.usedJSHeapSize</code> after a forced garbage
        collection.
      </>,
      <>
        <strong>Leak check</strong>: repeated mount/unmount of 10 charts; heap and DOM must return
        to the baseline.
      </>,
      <>
        <strong>Bundle size</strong>: <code>pnpm size</code> builds small consumer entry points and
        reports minified and gzip sizes against budgets.
      </>,
    ],
    commands: `pnpm bench          # full run → benchmarks/results/latest.json + REPORT.md
pnpm bench --quick  # fewer sizes and repetitions
pnpm size           # bundle sizes → benchmarks/size.json`,
    ownDevice: (
      <>
        Want numbers for your own device? The <Link to="/playground">Playground</Link> measures
        render time, DOM size and FPS live in your browser.
      </>
    ),
    renderer: 'SVG or Canvas?',
    rendererText: [
      <>
        With mark batching, SVG is as fast as or faster than Canvas for bar charts up to 10 000 bars
        and for line and area charts at any input size — downsampling keeps the drawn points at
        about two per pixel, so the DOM stays small. Canvas has no per-element cost but pays for
        re-rasterising the whole surface, and its text and hit testing are separate anyway.
      </>,
      <>
        Therefore <code>renderer="auto"</code> keeps line, area and bar charts on SVG. Chart types
        whose marks cannot be reduced — large scatter plots — set their own{' '}
        <code>canvasThreshold</code> from their benchmarks and switch to Canvas above it. You can
        always force <code>renderer="canvas"</code> or <code>"svg"</code>.
      </>,
      <>
        One finding from the benchmarks: Chromium’s <code>closePath()</code> slows down
        quadratically on paths with thousands of closed subpaths, so the Canvas renderer flushes its
        batches every 256 subpaths (about 1 s → 70 ms for 10 000 bars, per ARCHITECTURE.md).
      </>,
    ],
  },
  ru: {
    lead: 'Результаты бенчмарков и проверки размера бандла из репозитория, построенные с помощью Jafari Charts. Каждое число на этой странице взято из файлов, закоммиченных в репозиторий.',
    toc: [
      ['run', 'Этот прогон'],
      ['single', 'Одна диаграмма'],
      ['many', 'Много диаграмм'],
      ['scenarios', 'Сценарии'],
      ['bundle', 'Размер бандла'],
      ['methodology', 'Методика'],
      ['renderer', 'SVG или Canvas'],
    ],
    run: 'Этот прогон',
    date: 'Дата',
    cpu: 'Процессор',
    cpuValue: (cpu, cores, memory) =>
      `${cpu} (${cores} ${ruPlural(cores, ['ядро', 'ядра', 'ядер'])}, ${memory} ГБ)`,
    browser: 'Браузер',
    browserValue: (v) => `Chromium ${v} (Playwright, headless-режим)`,
    mode: 'Режим',
    quickRun: 'Быстрый прогон (меньше размеров и повторов)',
    fullRun: 'Полный прогон',
    machineTitle: 'Абсолютные значения зависят от машины',
    machine:
      'Сравнивайте прогоны, сделанные на одной и той же машине. Эти результаты описывают только Jafari Charts: другие библиотеки не измерялись, поэтому сравнений на этой странице нет.',
    single: 'Одна диаграмма',
    mountTitle: 'Время монтирования',
    mountLead:
      'Медианное время от монтирования диаграммы до следующего отрисованного кадра — по типу диаграммы и объёму данных.',
    mountChart: 'Время монтирования по диаграмме, объёму данных и рендереру',
    updateTitle: 'Время обновления',
    updateLead: 'Медианное время замены всего набора данных (переключение фильтра) и отрисовки.',
    outlier: (o) => (
      <>
        Один результат сильно выбивается из остальных и не показан на графике, чтобы остальные
        оставались читаемыми: «{o.chart}» на {o.renderer}, точек — {o.points}, обновление заняло{' '}
        {o.time} (результат есть в таблице ниже). В ARCHITECTURE.md §7 описано исправление пакетной
        отрисовки Canvas для этого случая (сброс пакета каждые 256 подпутей); повторный запуск{' '}
        <code>pnpm bench</code> обновит эти результаты.
      </>
    ),
    updateChart: 'Время обновления по диаграмме, объёму данных и рендереру',
    domTitle: 'Размер DOM',
    domLead:
      'Элементы внутри контейнера бенчмарка. Благодаря пакетной отрисовке меток и прореживанию размер DOM почти не меняется — от 365 до 100 000 точек.',
    domChart: 'DOM-узлы по диаграмме, объёму данных и рендереру',
    hoverTitle: 'Задержка при наведении (p95)',
    hoverLead:
      'Время от движения указателя до следующего кадра, 95-й перцентиль по 40 движениям. Пунктирная линия — один кадр при 60 Гц (16,7 мс): значения около неё означают, что обновление при наведении укладывается в один кадр.',
    hoverChart: 'Задержка при наведении, p95',
    msUnit: 'мс',
    mbUnit: 'МБ',
    kbUnit: 'КБ',
    points: (n) =>
      n >= 1_000_000
        ? `${formatNumber(n / 1_000_000, { locale: 'ru' })} млн`
        : n >= 1000
          ? `${formatNumber(n / 1000, { locale: 'ru' })} тыс.`
          : String(n),
    chartName: (id) => RU_CHARTS[id] ?? id,
    scalingCaption: 'Одна диаграмма (benchmarks/results/latest.json → scaling)',
    multiCaption: 'Много линейных диаграмм на одной странице, по 365 точек (→ multi)',
    cols: {
      chart: 'Диаграмма',
      renderer: 'Рендерер',
      points: 'Точки',
      mount: 'Монтирование',
      update: 'Обновление',
      hoverP50: 'Наведение p50',
      hoverP95: 'Наведение p95',
      longTasks: 'Долгие задачи',
      domNodes: 'DOM-узлы',
      heap: 'Куча',
      charts: 'Диаграммы',
      filterSwitch: 'Смена фильтра',
      resize: 'Изменение размера',
      longestTask: 'Самая долгая задача',
    },
    many: 'Много диаграмм на одной странице',
    manyLead:
      'Линейные диаграммы по 365 точек. Смена фильтра заменяет данные всех диаграмм, изменение размера меняет ширину контейнера. Все диаграммы используют один общий ResizeObserver.',
    chartsCount: (n) => `${n} ${ruPlural(n, ['диаграмма', 'диаграммы', 'диаграмм'])}`,
    manyChart: 'Много диаграмм: монтирование, смена фильтра и изменение размера',
    scenarios: 'Сценарии',
    scenarioName: (name) => RU_SCENARIOS[name] ?? name,
    perUpdate: (p50, p95) => `p50 ${p50}, p95 ${p95} на обновление (рендер + следующий кадр)`,
    leak: (o) =>
      `куча ${formatNumber(o.start, { locale: 'ru' })} МБ → ${formatNumber(o.end, { locale: 'ru' })} МБ (Δ ${formatNumber(o.delta, { locale: 'ru' })} МБ), DOM-узлов осталось: ${o.dom}`,
    bundle: 'Размер бандла',
    bundleLead: (
      <>
        Из <code>pnpm size</code> (benchmarks/size.json): сборка приложения-потребителя на Vite,
        минифицированная и сжатая gzip, React — внешняя зависимость. У каждого сценария есть лимит;
        если он превышен, проверка не проходит.
      </>
    ),
    gzipSeries: 'gzip, КБ',
    budgetSeries: 'Лимит, КБ',
    bundleChart: 'Размер бандла относительно лимита',
    sizeScenario: (name) => RU_SIZE_SCENARIOS[name] ?? name,
    sizeCols: {
      scenario: 'Сценарий',
      minified: 'Минифицированный',
      gzip: 'gzip',
      budget: 'Лимит',
      status: 'Статус',
    },
    status: (s) => (s === 'ok' ? 'в норме' : s),
    methodology: 'Методика',
    methodItems: [
      <>
        <strong>Продакшен-сборка.</strong> <code>pnpm bench</code> собирает приложение playground
        через Vite и раздаёт его через <code>vite preview</code>; в режиме разработки ничего не
        запускается.
      </>,
      <>
        <strong>Chromium.</strong> Страницами управляет Chromium из Playwright (версия указана выше)
        в окне 1000 × 800 с отключённой анимацией.
      </>,
      <>
        <strong>Медианы.</strong> Монтирование — медиана 3 загрузок страницы с нуля, обновление —
        медиана 5 замен набора данных; смена фильтра и изменение размера для множества диаграмм —
        медианы 4 замеров.
      </>,
      <>
        <strong>Монтирование / обновление / изменение размера</strong>: от синхронного коммита React
        (<code>flushSync</code>) до следующего кадра (<code>requestAnimationFrame</code> +{' '}
        <code>setTimeout</code>), то есть с учётом раскладки и отрисовки.
      </>,
      <>
        <strong>Наведение p50/p95</strong>: синтетические движения указателя по диаграмме; время от
        отправки события до следующего кадра. <strong>Долгие задачи</strong> подсчитываются через{' '}
        <code>PerformanceObserver</code> (задачи дольше 50 мс) во время наведения.
      </>,
      <>
        <strong>DOM-узлы</strong>: все элементы внутри контейнера бенчмарка. <strong>Куча</strong>:{' '}
        <code>performance.memory.usedJSHeapSize</code> после принудительной сборки мусора.
      </>,
      <>
        <strong>Проверка утечек</strong>: многократное монтирование и размонтирование 10 диаграмм;
        куча и DOM должны вернуться к исходному уровню.
      </>,
      <>
        <strong>Размер бандла</strong>: <code>pnpm size</code> собирает небольшие точки входа
        приложения-потребителя и сообщает минифицированный и gzip-размер в сравнении с лимитами.
      </>,
    ],
    commands: `pnpm bench          # полный прогон → benchmarks/results/latest.json + REPORT.md
pnpm bench --quick  # меньше размеров и повторов
pnpm size           # размеры бандла → benchmarks/size.json`,
    ownDevice: (
      <>
        Нужны цифры для вашего устройства? <Link to="/playground">Песочница</Link> измеряет время
        отрисовки, размер DOM и FPS прямо в вашем браузере.
      </>
    ),
    renderer: 'SVG или Canvas?',
    rendererText: [
      <>
        Благодаря пакетной отрисовке меток SVG не уступает Canvas или обгоняет его на столбчатых
        диаграммах до 10 000 столбцов, а на линейных диаграммах и диаграммах с областями — при любом
        объёме данных: прореживание оставляет около двух точек на пиксель, поэтому DOM остаётся
        небольшим. У Canvas нет затрат на каждый элемент, зато он платит за повторную растеризацию
        всей поверхности, а текст и поиск элемента под указателем у него всё равно реализованы
        отдельно.
      </>,
      <>
        Поэтому <code>renderer="auto"</code> оставляет линейные и столбчатые диаграммы и диаграммы с
        областями на SVG. Типы диаграмм, метки которых нельзя сократить, — большие точечные
        диаграммы — задают собственный <code>canvasThreshold</code> по результатам своих бенчмарков
        и выше него переходят на Canvas. Рендерер всегда можно задать явно:{' '}
        <code>renderer="canvas"</code> или <code>"svg"</code>.
      </>,
      <>
        Одна из находок бенчмарков: <code>closePath()</code> в Chromium замедляется квадратично на
        путях с тысячами замкнутых подпутей, поэтому Canvas-рендерер сбрасывает пакеты каждые 256
        подпутей (примерно 1 с → 70 мс для 10 000 столбцов, согласно ARCHITECTURE.md).
      </>,
    ],
  },
};

/** The slowest update when it is more than 5× the next slowest (it would flatten the chart). */
function findOutlier(rows: readonly ScalingRow[]): ScalingRow | null {
  const sorted = [...rows].sort((a, b) => b.updateMs - a.updateMs);
  const [first, second] = sorted;
  return first && second && first.updateMs > second.updateMs * 5 ? first : null;
}

/** Number formatting for the current language. */
function useFormat() {
  const lang: Lang = useLang();
  const t = useText(TEXT);
  return {
    t,
    lang,
    num: (v: number, digits?: number) =>
      formatNumber(v, {
        locale: lang,
        ...(digits !== undefined ? { maximumFractionDigits: digits } : {}),
      }),
    ms: (v: number) => `${formatNumber(v, { locale: lang, maximumFractionDigits: 1 })} ${t.msUnit}`,
    mb: (v: number) => `${formatNumber(v, { locale: lang, maximumFractionDigits: 1 })} ${t.mbUnit}`,
    /** A decimal string from size.json ("13.8") in the current language. */
    kb: (v: string | number) => `${lang === 'ru' ? String(v).replace('.', ',') : v} ${t.kbUnit}`,
    label: (r: ScalingRow) => `${t.chartName(r.chart)} · ${t.points(r.points)}`,
  };
}

type Format = ReturnType<typeof useFormat>;

/** One row per (chart, points) with SVG and Canvas side by side. */
function pivot(f: Format, metric: (r: ScalingRow) => number) {
  const rows = new Map<string, { label: string; svg: number | null; canvas: number | null }>();
  for (const r of bench.scaling) {
    const label = f.label(r);
    const row = rows.get(label) ?? { label, svg: null, canvas: null };
    if (r.renderer === 'svg') row.svg = metric(r);
    else if (r.renderer === 'canvas') row.canvas = metric(r);
    rows.set(label, row);
  }
  return [...rows.values()];
}

const RENDERER_SERIES = [
  { key: 'svg', label: 'SVG' },
  { key: 'canvas', label: 'Canvas' },
] as const;

function ScalingTable({ f }: { f: Format }) {
  const c = f.t.cols;
  return (
    <div className="table-wrap">
      <table>
        <caption>{f.t.scalingCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{c.chart}</th>
            <th scope="col">{c.renderer}</th>
            <th scope="col" className="num">
              {c.points}
            </th>
            <th scope="col" className="num">
              {c.mount}
            </th>
            <th scope="col" className="num">
              {c.update}
            </th>
            <th scope="col" className="num">
              {c.hoverP50}
            </th>
            <th scope="col" className="num">
              {c.hoverP95}
            </th>
            <th scope="col" className="num">
              {c.longTasks}
            </th>
            <th scope="col" className="num">
              {c.domNodes}
            </th>
            <th scope="col" className="num">
              {c.heap}
            </th>
          </tr>
        </thead>
        <tbody>
          {bench.scaling.map((r) => (
            <tr key={`${r.chart}-${r.renderer}-${r.points}`}>
              <th scope="row">{f.t.chartName(r.chart)}</th>
              <td>{r.renderer}</td>
              <td className="num">{f.num(r.points)}</td>
              <td className="num">{f.ms(r.mountMs)}</td>
              <td className="num">{f.ms(r.updateMs)}</td>
              <td className="num">{f.ms(r.hoverP50Ms)}</td>
              <td className="num">{f.ms(r.hoverP95Ms)}</td>
              <td className="num">{r.longTasksDuringHover}</td>
              <td className="num">{r.domNodes}</td>
              <td className="num">{f.mb(r.heapMB)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MultiTable({ f }: { f: Format }) {
  const c = f.t.cols;
  return (
    <div className="table-wrap">
      <table>
        <caption>{f.t.multiCaption}</caption>
        <thead>
          <tr>
            <th scope="col" className="num">
              {c.charts}
            </th>
            <th scope="col" className="num">
              {c.mount}
            </th>
            <th scope="col" className="num">
              {c.filterSwitch}
            </th>
            <th scope="col" className="num">
              {c.resize}
            </th>
            <th scope="col" className="num">
              {c.hoverP95}
            </th>
            <th scope="col" className="num">
              {c.longTasks}
            </th>
            <th scope="col" className="num">
              {c.longestTask}
            </th>
            <th scope="col" className="num">
              {c.domNodes}
            </th>
            <th scope="col" className="num">
              {c.heap}
            </th>
          </tr>
        </thead>
        <tbody>
          {bench.multi.map((r) => (
            <tr key={r.charts}>
              <th scope="row" className="num">
                {r.charts}
              </th>
              <td className="num">{f.ms(r.mountMs)}</td>
              <td className="num">{f.ms(r.filterSwitchMs)}</td>
              <td className="num">{f.ms(r.resizeMs)}</td>
              <td className="num">{f.ms(r.hoverP95Ms)}</td>
              <td className="num">{r.longTasks}</td>
              <td className="num">{f.ms(r.longestTaskMs)}</td>
              <td className="num">{f.num(r.domNodes)}</td>
              <td className="num">{f.mb(r.heapMB)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioList({ f }: { f: Format }) {
  return (
    <ul>
      {bench.scenarios.map((s) => (
        <li key={s.name}>
          <strong>{f.t.scenarioName(s.name)}</strong>:{' '}
          {'p50Ms' in s && typeof s.p50Ms === 'number'
            ? f.t.perUpdate(
                f.ms(s.p50Ms),
                'p95Ms' in s && typeof s.p95Ms === 'number' ? f.ms(s.p95Ms) : '—',
              )
            : null}
          {'heapDeltaMB' in s && typeof s.heapDeltaMB === 'number'
            ? f.t.leak({
                start: s.heapStartMB,
                end: s.heapEndMB,
                delta: s.heapDeltaMB,
                dom: s.domNodesAfter,
              })
            : null}
        </li>
      ))}
    </ul>
  );
}

const sizeRows = sizes.map((s) => ({
  scenario: s.scenario,
  gzip: Number(s['gzip KB']),
  budget: s['budget KB'],
}));

export function Performance() {
  const { path } = useLocation();
  const ui = useT();
  const f = useFormat();
  const { t, lang } = f;
  const meta = bench.meta;
  const mount = pivot(f, (r) => r.mountMs);
  const updateOutlier = findOutlier(bench.scaling);
  const update = pivot(f, (r) => r.updateMs).map((row) => ({
    ...row,
    ...(updateOutlier && row.label === f.label(updateOutlier)
      ? { [updateOutlier.renderer === 'svg' ? 'svg' : 'canvas']: null }
      : {}),
  }));
  const dom = pivot(f, (r) => r.domNodes);
  const hover = pivot(f, (r) => r.hoverP95Ms);
  const multi = bench.multi.map((r) => ({
    label: t.chartsCount(r.charts),
    mount: r.mountMs,
    filter: r.filterSwitchMs,
    resize: r.resizeMs,
  }));
  const bundleRows = sizeRows.map((r) => ({ ...r, scenario: t.sizeScenario(r.scenario) }));
  return (
    <article>
      <PageHeader eyebrow={ui.nav.guides} title={ui.pages.performance} lead={t.lead}>
        <nav aria-label={ui.a11y.onThisPage}>
          <ul className="page-toc">
            {t.toc.map(([id, title]) => (
              <li key={id}>
                <Link to={path} section={id}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="run" title={t.run}>
        <dl className="meta-grid">
          <div>
            <dt>{t.date}</dt>
            <dd>
              {formatDate(Date.parse(meta.date), {
                locale: lang,
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </dd>
          </div>
          <div>
            <dt>{t.cpu}</dt>
            <dd>{t.cpuValue(meta.cpu, meta.cores, meta.memoryGB)}</dd>
          </div>
          <div>
            <dt>{t.browser}</dt>
            <dd>{t.browserValue(meta.browser)}</dd>
          </div>
          <div>
            <dt>{t.mode}</dt>
            <dd>{meta.quick ? t.quickRun : t.fullRun}</dd>
          </div>
        </dl>
        <Callout tone="warning" title={t.machineTitle}>
          {t.machine}
        </Callout>
      </Section>

      <Section id="single" title={t.single}>
        <h3>{t.mountTitle}</h3>
        <p className="section-lead">{t.mountLead}</p>
        <GroupedBarChart
          data={mount}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={f.ms}
          yAxis={{ title: t.msUnit }}
          animation={false}
          height={280}
          title={t.mountChart}
        />

        <h3>{t.updateTitle}</h3>
        <p className="section-lead">
          {t.updateLead}
          {updateOutlier ? (
            <>
              {' '}
              {t.outlier({
                renderer: updateOutlier.renderer,
                chart: t.chartName(updateOutlier.chart),
                points: f.num(updateOutlier.points),
                time: f.ms(updateOutlier.updateMs),
              })}
            </>
          ) : null}
        </p>
        <GroupedBarChart
          data={update}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={f.ms}
          yAxis={{ title: t.msUnit }}
          animation={false}
          height={280}
          title={t.updateChart}
        />

        <h3>{t.domTitle}</h3>
        <p className="section-lead">{t.domLead}</p>
        <GroupedBarChart
          data={dom}
          xKey="label"
          series={RENDERER_SERIES}
          animation={false}
          height={240}
          title={t.domChart}
        />

        <h3>{t.hoverTitle}</h3>
        <p className="section-lead">{t.hoverLead}</p>
        <GroupedBarChart
          data={hover}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={f.ms}
          animation={false}
          height={240}
          title={t.hoverChart}
        >
          <ChartReferenceLine y={16.7} />
        </GroupedBarChart>
        <ScalingTable f={f} />
      </Section>

      <Section id="many" title={t.many}>
        <p className="section-lead">{t.manyLead}</p>
        <GroupedBarChart
          data={multi}
          xKey="label"
          series={[
            { key: 'mount', label: t.cols.mount },
            { key: 'filter', label: t.cols.filterSwitch },
            { key: 'resize', label: t.cols.resize },
          ]}
          valueFormatter={f.ms}
          animation={false}
          height={240}
          title={t.manyChart}
        />
        <MultiTable f={f} />
      </Section>

      <Section id="scenarios" title={t.scenarios}>
        <ScenarioList f={f} />
      </Section>

      <Section id="bundle" title={t.bundle}>
        <p className="section-lead">{t.bundleLead}</p>
        <GroupedBarChart
          layout="horizontal"
          data={bundleRows}
          xKey="scenario"
          series={[
            { key: 'gzip', label: t.gzipSeries },
            { key: 'budget', label: t.budgetSeries, color: 'var(--jc-neutral)' },
          ]}
          valueFormatter={f.kb}
          animation={false}
          height={Math.max(260, bundleRows.length * 46)}
          title={t.bundleChart}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.sizeCols.scenario}</th>
                <th scope="col" className="num">
                  {t.sizeCols.minified}
                </th>
                <th scope="col" className="num">
                  {t.sizeCols.gzip}
                </th>
                <th scope="col" className="num">
                  {t.sizeCols.budget}
                </th>
                <th scope="col">{t.sizeCols.status}</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.scenario}>
                  <th scope="row">{t.sizeScenario(s.scenario)}</th>
                  <td className="num">{f.kb(s['min KB'])}</td>
                  <td className="num">{f.kb(s['gzip KB'])}</td>
                  <td className="num">{f.kb(s['budget KB'])}</td>
                  <td>{t.status(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="methodology" title={t.methodology}>
        <ul>
          {t.methodItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <CodeBlock language="bash" code={t.commands} />
        <p>{t.ownDevice}</p>
      </Section>

      <Section id="renderer" title={t.renderer}>
        {t.rendererText.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Section>
    </article>
  );
}

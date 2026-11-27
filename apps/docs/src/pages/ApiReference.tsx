import * as Library from '@startupjafari/charts';
import { CHARTS } from '../docs/charts';
import { BASE_PROPS } from '../docs/props';
import { useLang, useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { Code, CodeBlock } from '../ui/CodeBlock';
import { inlineCode, PropsTable } from '../ui/PropsTable';

interface ApiEntry {
  name: string;
  signature: string;
  /** Backticks become inline code. */
  description: L<string>;
  /** Internal docs page. */
  to?: string;
  section?: string;
}

interface ApiGroup {
  id: string;
  title: string;
  lead?: string;
  entries: ApiEntry[];
}

const PRIMITIVES: ApiEntry[] = [
  {
    name: 'ChartReferenceLine',
    signature: '(props: ChartReferenceLineProps) => ReactNode',
    description: {
      en: 'Target lines, thresholds, averages (data values).',
      ru: 'Целевые линии, пороги, средние значения (в значениях данных).',
      kk: 'Мақсатты сызықтар, шектер, орташа мәндер (деректер мәндерімен).',
    },
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartReferenceArea',
    signature: '(props: ChartReferenceAreaProps) => ReactNode',
    description: {
      en: 'Highlighted region on either axis.',
      ru: 'Выделенная область по любой из осей.',
      kk: 'Кез келген ось бойынша ерекшеленген аймақ.',
    },
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartReferenceDot',
    signature: '(props: ChartReferenceDotProps) => ReactNode',
    description: {
      en: 'A highlighted point with an optional label.',
      ru: 'Выделенная точка с необязательной подписью.',
      kk: 'Ерекшеленген нүкте, қаласаңыз жазуымен бірге.',
    },
    to: '/components',
    section: 'reference',
  },
  {
    name: 'ChartAnnotation',
    signature: '(props: ChartAnnotationProps) => ReactNode',
    description: {
      en: 'A note attached to a pixel position, with a leader line.',
      ru: 'Заметка, привязанная к позиции в пикселях, с выносной линией.',
      kk: 'Пиксельдегі орынға байланған, сілтеме сызығы бар ескертпе.',
    },
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartLabel',
    signature: '(props: ChartLabelProps) => ReactNode',
    description: {
      en: 'Text in chart pixels using text tokens.',
      ru: 'Текст в пикселях диаграммы, оформленный текстовыми токенами.',
      kk: 'Диаграмма пиксельдеріндегі, мәтін токендерімен безендірілген мәтін.',
    },
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartMarker',
    signature: '(props: ChartMarkerProps) => ReactNode',
    description: {
      en: 'A single symbol (circle, square, diamond, triangle, cross, star…).',
      ru: 'Одиночный символ (круг, квадрат, ромб, треугольник, крест, звезда…).',
      kk: 'Жалғыз таңба (шеңбер, шаршы, ромб, үшбұрыш, айқыш, жұлдыз…).',
    },
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'ChartGradient',
    signature: '(props: ChartGradientProps) => ReactNode',
    description: {
      en: 'Linear gradient definition for custom marks.',
      ru: 'Определение линейного градиента для собственных меток.',
      kk: 'Өз белгілеріңізге арналған сызықтық градиент анықтамасы.',
    },
    to: '/components',
    section: 'gradient',
  },
  {
    name: 'ChartAxis / XAxis / YAxis',
    signature: '(props: ChartAxisProps | XAxisProps | YAxisProps) => ReactNode',
    description: {
      en: 'Tick labels along one edge of the plot.',
      ru: 'Подписи делений вдоль одной из сторон области построения.',
      kk: 'Салу аймағының бір шетінің бойындағы бөлік жазулары.',
    },
    to: '/components',
    section: 'axes',
  },
  {
    name: 'ChartGrid',
    signature: '(props: ChartGridProps) => ReactNode',
    description: {
      en: 'Hairline gridlines.',
      ru: 'Тонкие линии сетки.',
      kk: 'Жіңішке тор сызықтары.',
    },
    to: '/components',
    section: 'axes',
  },
  {
    name: 'ChartTooltip',
    signature: '(props: TooltipOptions) => ReactNode',
    description: {
      en: 'HTML tooltip (rendered by charts; configure with the `tooltip` prop).',
      ru: 'HTML-подсказка (её отрисовывают сами диаграммы; настраивается пропом `tooltip`).',
      kk: 'HTML қалқымалы кеңес (оны диаграммалардың өзі салады; `tooltip` пропымен бапталады).',
    },
    to: '/components',
    section: 'tooltip',
  },
  {
    name: 'ChartLegend',
    signature: '(props: LegendOptions) => ReactNode',
    description: {
      en: 'Legend with toggle buttons (configure with the `legend` prop).',
      ru: 'Легенда с кнопками-переключателями (настраивается пропом `legend`).',
      kk: 'Ауыстырғыш түймелері бар шартты белгілер (`legend` пропымен бапталады).',
    },
    to: '/components',
    section: 'legend',
  },
  {
    name: 'ChartCrosshair / ChartCursor',
    signature: '(props: ChartCrosshairProps) => ReactNode',
    description: {
      en: 'Active-x hairline and the bar cursor band.',
      ru: 'Тонкая линия в активной точке по X и полоса-курсор столбчатых диаграмм.',
      kk: 'X бойынша белсенді нүктедегі жіңішке сызық және бағаналы диаграммалардағы курсор жолағы.',
    },
    to: '/components',
    section: 'crosshair',
  },
  {
    name: 'ChartEmptyState / ChartLoadingState / ChartErrorState',
    signature: '(props) => ReactNode',
    description: {
      en: 'State overlays used by every chart.',
      ru: 'Слои состояний, которые используют все диаграммы.',
      kk: 'Барлық диаграмма пайдаланатын күй қабаттары.',
    },
    to: '/components',
    section: 'states',
  },
  {
    name: 'SeriesKey',
    signature: '(props: SeriesKeyProps) => ReactNode',
    description: {
      en: 'Swatch identifying a series (line, square or symbol).',
      ru: 'Значок, обозначающий ряд (линия, квадрат или символ).',
      kk: 'Қатарды белгілейтін белгіше (сызық, шаршы немесе таңба).',
    },
  },
];

const PROVIDERS: ApiEntry[] = [
  {
    name: 'ChartProvider',
    signature: '(props: ChartProviderProps) => ReactNode',
    description: {
      en: 'Defaults (locale, theme, animation, renderer, messages, injectStyles) for every chart below.',
      ru: 'Значения по умолчанию (locale, theme, animation, renderer, messages, injectStyles) для всех вложенных диаграмм.',
      kk: 'Ішкі диаграммалардың барлығына арналған әдепкі мәндер (locale, theme, animation, renderer, messages, injectStyles).',
    },
    to: '/components',
    section: 'chart-provider',
  },
  {
    name: 'useChartConfig',
    signature: '() => ChartConfig',
    description: {
      en: 'The merged provider configuration.',
      ru: 'Объединённая конфигурация провайдеров.',
      kk: 'Провайдерлердің біріктірілген конфигурациясы.',
    },
  },
  {
    name: 'useChart',
    signature: '() => ChartInstance',
    description: {
      en: 'Inside a chart: scales (`frame`), `plot`, `width`, `height`, the interaction `store`, `series`, `locale`, `messages`. Throws outside a chart.',
      ru: 'Внутри диаграммы: шкалы (`frame`), `plot`, `width`, `height`, хранилище взаимодействия `store`, `series`, `locale`, `messages`. Вне диаграммы выбрасывает ошибку.',
      kk: 'Диаграмма ішінде: шкалалар (`frame`), `plot`, `width`, `height`, өзара әрекеттесу қоймасы `store`, `series`, `locale`, `messages`. Диаграммадан тыс қате лақтырады.',
    },
    to: '/components',
    section: 'annotations',
  },
  {
    name: 'useOptionalChart',
    signature: '() => ChartInstance | null',
    description: {
      en: 'Like `useChart`, but returns null outside a chart.',
      ru: 'То же, что `useChart`, но вне диаграммы возвращает null.',
      kk: '`useChart` сияқты, бірақ диаграммадан тыс null қайтарады.',
    },
  },
  {
    name: 'useStoreSelector',
    signature: '<S, R>(store: Store<S>, selector: (state: S) => R) => R',
    description: {
      en: 'Subscribe to a slice of the interaction store (re-renders only when it changes).',
      ru: 'Подписка на часть хранилища взаимодействия (перерисовка — только когда эта часть меняется).',
      kk: 'Өзара әрекеттесу қоймасының бір бөлігіне жазылу (қайта рендеринг тек сол бөлік өзгергенде болады).',
    },
  },
  {
    name: 'useReducedMotion',
    signature: '() => boolean',
    description: {
      en: 'True when the user prefers reduced motion.',
      ru: 'Возвращает true, если пользователь включил «уменьшение движения».',
      kk: 'Пайдаланушы «қозғалысты азайту» баптауын қосса, true қайтарады.',
    },
  },
];

const BUILDING_BLOCKS: ApiEntry[] = [
  {
    name: 'ChartView',
    signature: '(props: ChartViewProps) => ReactNode',
    description: {
      en: 'The shell every chart uses: layers, interaction, tooltip, legend, states and accessibility. For building new chart types.',
      ru: 'Оболочка, на которой построены все диаграммы: слои, взаимодействие, подсказка, легенда, состояния и доступность. Для создания новых типов диаграмм.',
      kk: 'Барлық диаграмма құрылған қабық: қабаттар, өзара әрекеттесу, қалқымалы кеңес, шартты белгілер, күйлер және қолжетімділік. Диаграмманың жаңа түрлерін жасауға арналған.',
    },
  },
  {
    name: 'useChartRoot',
    signature: '(props: BaseChartProps, defaults: { height: number }) => ChartRoot',
    description: {
      en: 'Resolves size, locale, messages, animation, theme and the store for a new chart type.',
      ru: 'Определяет размер, локаль, тексты, анимацию, тему и хранилище для нового типа диаграммы.',
      kk: 'Диаграмманың жаңа түрі үшін өлшемді, локальді, мәтіндерді, анимацияны, тақырыпты және қойманы анықтайды.',
    },
  },
  {
    name: 'SeriesLayer / MarkList',
    signature: '(props) => ReactNode',
    description: {
      en: 'SVG renderer for scene marks (batched paths).',
      ru: 'SVG-рендерер меток сцены (пути объединяются в пакеты).',
      kk: 'Сахна белгілеріне арналған SVG рендерері (path элементтері топтап біріктіріледі).',
    },
  },
  {
    name: 'CanvasMarks',
    signature: '(props) => ReactNode',
    description: {
      en: 'Canvas renderer for scene marks (loads the canvas module lazily).',
      ru: 'Canvas-рендерер меток сцены (модуль canvas загружается лениво).',
      kk: 'Сахна белгілеріне арналған Canvas рендерері (canvas модулін кешіктіріп жүктейді).',
    },
  },
  {
    name: 'TextLabels',
    signature: '({ labels }: { labels: readonly TextMark[] }) => ReactNode',
    description: {
      en: 'Text marks (value labels).',
      ru: 'Текстовые метки (подписи значений).',
      kk: 'Мәтіндік белгілер (мән жазулары).',
    },
  },
  {
    name: 'ChartDataTable',
    signature: '(props: { table: DataTable; caption: string; limit: number }) => ReactNode',
    description: {
      en: 'Visually hidden data table.',
      ru: 'Визуально скрытая таблица данных.',
      kk: 'Көзге көрінбейтін деректер кестесі.',
    },
  },
  {
    name: 'ChartStyles',
    signature: '() => ReactNode',
    description: {
      en: 'Injects the stylesheet once per document (respects `injectStyles`).',
      ru: 'Внедряет таблицу стилей один раз на документ (учитывает `injectStyles`).',
      kk: 'Стильдер кестесін құжатқа бір рет енгізеді (`injectStyles` ескеріледі).',
    },
  },
];

const THEMING: ApiEntry[] = [
  {
    name: 'createTheme',
    signature: '(options?: CreateThemeOptions) => Theme',
    description: {
      en: 'A theme from token overrides, optionally per mode (`light`, `dark`).',
      ru: 'Тема из переопределённых токенов, при необходимости — отдельно для каждого режима (`light`, `dark`).',
      kk: 'Қайта анықталған токендерден жасалған тақырып, қажет болса — әр режим үшін бөлек (`light`, `dark`).',
    },
    to: '/themes',
    section: 'create-theme',
  },
  {
    name: 'lightTheme / darkTheme',
    signature: 'ThemeTokens',
    description: {
      en: 'Default token values.',
      ru: 'Значения токенов по умолчанию.',
      kk: 'Токендердің әдепкі мәндері.',
    },
    to: '/themes',
    section: 'tokens',
  },
  {
    name: 'palette',
    signature: '{ primary, blue, success, warning, error, purple, cyan, pink }',
    description: { en: 'Brand colours.', ru: 'Фирменные цвета.', kk: 'Фирмалық түстер.' },
    to: '/themes',
    section: 'palette',
  },
  {
    name: 'seriesColor',
    signature: '(index: number) => string',
    description: {
      en: '`var(--jc-series-N)` for a 0-based series slot.',
      ru: '`var(--jc-series-N)` для слота ряда (нумерация с 0).',
      kk: 'Қатар слотына арналған `var(--jc-series-N)` (нөмірлеу 0-ден басталады).',
    },
  },
  {
    name: 'cssVar',
    signature: '(token: keyof ThemeTokens) => string',
    description: {
      en: "CSS variable reference, e.g. `cssVar('grid')` → `var(--jc-grid)`.",
      ru: "Ссылка на CSS-переменную, например `cssVar('grid')` → `var(--jc-grid)`.",
      kk: "CSS айнымалысына сілтеме, мысалы `cssVar('grid')` → `var(--jc-grid)`.",
    },
  },
];

const FORMATTING: ApiEntry[] = [
  {
    name: 'formatNumber',
    signature:
      '(value: number | null | undefined, options?: Intl.NumberFormatOptions & { locale?: string }) => string',
    description: {
      en: 'Cached Intl number formatting; missing values print "—".',
      ru: 'Форматирование чисел через Intl с кешированием; отсутствующие значения выводятся как «—».',
      kk: 'Intl арқылы кэштелетін сан пішімдеу; жоқ мәндер «—» болып шығады.',
    },
  },
  {
    name: 'formatCompact',
    signature: '(value, locale = "en", maximumFractionDigits = 1) => string',
    description: {
      en: '1 234 567 → "1.2M" (en), "1,2 млн" (ru, kk).',
      ru: '1 234 567 → "1.2M" (en), "1,2 млн" (ru, kk).',
      kk: '1 234 567 → "1.2M" (en), "1,2 млн" (ru, kk).',
    },
  },
  {
    name: 'formatPercent',
    signature: '(value, locale = "en", maximumFractionDigits = 1) => string',
    description: {
      en: 'Ratio to percent: 0.25 → "25%".',
      ru: 'Перевод доли в проценты: 0.25 → "25%".',
      kk: 'Үлесті пайызға айналдыру: 0.25 → "25%".',
    },
  },
  {
    name: 'formatCurrency',
    signature: '(value, currency: string, locale = "en", options?) => string',
    description: {
      en: 'Currency with narrow symbols (₸, $, €).',
      ru: 'Денежные суммы с узкими символами валют (₸, $, €).',
      kk: 'Валютаның қысқа таңбалары бар ақша сомалары (₸, $, €).',
    },
  },
  {
    name: 'formatDate',
    signature:
      '(value: number | Date | null | undefined, options?: Intl.DateTimeFormatOptions & { locale?: string }) => string',
    description: {
      en: 'Cached Intl date formatting.',
      ru: 'Форматирование дат через Intl с кешированием.',
      kk: 'Intl арқылы кэштелетін күн пішімдеу.',
    },
  },
  {
    name: 'getMessages',
    signature: '(locale = "en", overrides?: Partial<ChartMessages>) => ChartMessages',
    description: {
      en: 'Built-in texts for a BCP 47 locale ("ru-RU" → ru), English fallback.',
      ru: 'Встроенные тексты для локали BCP 47 ("ru-RU" → ru); если локаль не поддерживается — английские.',
      kk: 'BCP 47 локалі үшін кірістірілген мәтіндер ("ru-RU" → ru); локаль қолдау көрсетілмесе — ағылшынша.',
    },
  },
  {
    name: 'MESSAGES',
    signature: "Readonly<Record<'en' | 'ru' | 'kk', ChartMessages>>",
    description: {
      en: 'Built-in texts for English, Russian and Kazakh.',
      ru: 'Встроенные тексты на английском, русском и казахском.',
      kk: 'Ағылшын, орыс және қазақ тілдеріндегі кірістірілген мәтіндер.',
    },
  },
];

const EXPORT: ApiEntry[] = [
  {
    name: 'exportChart',
    signature: '(target: Element, options: ExportChartOptions) => Promise<Blob>',
    description: {
      en: "Exports a rendered chart: `format` 'svg' | 'png' | 'webp' | 'csv', `scale`, `background`, `legend`, `padding`, `filename`, `download`.",
      ru: "Экспортирует отрисованную диаграмму: `format` 'svg' | 'png' | 'webp' | 'csv', `scale`, `background`, `legend`, `padding`, `filename`, `download`.",
      kk: "Салынған диаграмманы экспорттайды: `format` 'svg' | 'png' | 'webp' | 'csv', `scale`, `background`, `legend`, `padding`, `filename`, `download`.",
    },
  },
  {
    name: 'chartToSvg',
    signature: '(target: Element, options?: SvgExportOptions) => …',
    description: {
      en: 'Standalone SVG with inlined styles.',
      ru: 'Самодостаточный SVG со встроенными стилями.',
      kk: 'Стильдері ішіне кірістірілген дербес SVG.',
    },
  },
  {
    name: 'toSvgBlob / toPngBlob / toWebpBlob',
    signature: '(target: Element, options?) => Blob | Promise<Blob>',
    description: {
      en: 'Blobs without triggering a download.',
      ru: 'Blob-объекты без запуска скачивания.',
      kk: 'Жүктеп алуды іске қоспайтын Blob нысандары.',
    },
  },
  {
    name: 'isWebpSupported',
    signature: '() => boolean',
    description: {
      en: 'Whether the browser can encode WebP.',
      ru: 'Умеет ли браузер кодировать WebP.',
      kk: 'Браузер WebP пішімінде кодтай ала ма.',
    },
  },
  {
    name: 'toCsv / toCsvBlob',
    signature: '(data: readonly T[], options?: CsvOptions<T>) => string | Blob',
    description: {
      en: 'RFC 4180 CSV with formula-injection protection and an optional BOM.',
      ru: 'CSV по RFC 4180 с защитой от инъекции формул и необязательным BOM.',
      kk: 'Формула инъекциясынан қорғалған, қалауыңызша BOM қосылатын RFC 4180 бойынша CSV.',
    },
  },
  {
    name: 'downloadBlob',
    signature: '(blob: Blob, filename: string) => void',
    description: {
      en: 'Triggers a browser download.',
      ru: 'Запускает скачивание файла в браузере.',
      kk: 'Браузерде файлды жүктеп алуды іске қосады.',
    },
  },
];

const TYPES = [
  'BaseChartProps',
  'CartesianChartProps',
  'SeriesConfig',
  'XAxisOptions',
  'YAxisOptions',
  'GridOptions',
  'CrosshairOptions',
  'ZoomOptions',
  'DownsampleOptions',
  'BarOptions',
  'ChartItemEvent',
  'TooltipOptions',
  'LegendOptions',
  'AnimationOptions',
  'Renderer',
  'ChartConfig',
  'ChartProviderProps',
  'ChartInstance',
  'ChartAdapter',
  'InteractionState',
  'ActiveItem',
  'SeriesInfo',
  'SwatchKind',
  'TooltipData',
  'TooltipRow',
  'Theme',
  'ThemeInput',
  'ThemeMode',
  'ThemeTokens',
  'ChartMessages',
  'CurveType',
  'SymbolShape',
  'AxisValue',
];

const en = {
  lead: 'Everything exported from @startupjafari/charts, grouped by purpose. Chart props are documented on each chart page.',
  importsCode: `import { LineChart, ChartProvider, createTheme, formatNumber } from '@startupjafari/charts';
import { createLinearScale } from '@startupjafari/charts/core';      // framework-independent math
const { exportChart } = await import('@startupjafari/charts/export'); // lazy`,
  groups: {
    charts: 'Charts',
    chartsLead: 'Every chart accepts BaseChartProps (below) plus its own props.',
    primitives: 'Primitives',
    providers: 'Provider and hooks',
    buildingBlocks: 'Building blocks for new chart types',
    theming: 'Theming',
    formatting: 'Formatting and localisation',
  },
  table: { export: 'Export', description: 'Description' },
  baseProps: { lead: 'Shared by every chart.' },
  export: {
    toc: 'Export',
    title: 'Export (@startupjafari/charts/export)',
    lead: 'A separate entry point: never in your main bundle unless imported.',
  },
  types: {
    title: 'Types',
    intro: 'All TypeScript types are exported from the main entry:',
    pattern: (
      <p>
        Prop types follow the <code>&lt;Component&gt;Props</code> pattern (<code>LineChart</code>{' '}
        uses <code>CartesianChartProps</code>, <code>AreaChartProps</code>,{' '}
        <code>BarChartProps</code>, <code>PieChartProps</code>…).
      </p>
    ),
    alsoExported: 'Also exported (runtime values not described above)',
  },
};

const TEXT: L<typeof en> = {
  en,
  ru: {
    lead: 'Всё, что экспортирует @startupjafari/charts, сгруппировано по назначению. Пропсы диаграмм описаны на странице каждой диаграммы.',
    importsCode: `import { LineChart, ChartProvider, createTheme, formatNumber } from '@startupjafari/charts';
import { createLinearScale } from '@startupjafari/charts/core';      // математика, не зависящая от фреймворка
const { exportChart } = await import('@startupjafari/charts/export'); // ленивая загрузка`,
    groups: {
      charts: 'Диаграммы',
      chartsLead: 'Каждая диаграмма принимает BaseChartProps (см. ниже) и собственные пропсы.',
      primitives: 'Примитивы',
      providers: 'Провайдер и хуки',
      buildingBlocks: 'Строительные блоки для новых типов диаграмм',
      theming: 'Темы',
      formatting: 'Форматирование и локализация',
    },
    table: { export: 'Имя', description: 'Описание' },
    baseProps: { lead: 'Общие для всех диаграмм.' },
    export: {
      toc: 'Экспорт',
      title: 'Экспорт (@startupjafari/charts/export)',
      lead: 'Отдельная точка входа: в основной бандл попадает, только если вы её импортируете.',
    },
    types: {
      title: 'Типы',
      intro: 'Все типы TypeScript экспортируются из основной точки входа:',
      pattern: (
        <p>
          Типы пропсов называются по шаблону <code>&lt;Component&gt;Props</code> (
          <code>LineChart</code> использует <code>CartesianChartProps</code>; есть также{' '}
          <code>AreaChartProps</code>, <code>BarChartProps</code>, <code>PieChartProps</code>…).
        </p>
      ),
      alsoExported: 'Также экспортируются (runtime-значения, не описанные выше)',
    },
  },
  kk: {
    lead: '@startupjafari/charts пакетінен экспортталатынның бәрі мақсатына қарай топтастырылған. Диаграммалардың пропстары әр диаграмманың өз бетінде сипатталған.',
    importsCode: `import { LineChart, ChartProvider, createTheme, formatNumber } from '@startupjafari/charts';
import { createLinearScale } from '@startupjafari/charts/core';      // фреймворкке тәуелсіз математика
const { exportChart } = await import('@startupjafari/charts/export'); // кешіктірілген жүктеу`,
    groups: {
      charts: 'Диаграммалар',
      chartsLead: 'Әр диаграмма BaseChartProps (төменде) және өз пропстарын қабылдайды.',
      primitives: 'Примитивтер',
      providers: 'Провайдер және хуктар',
      buildingBlocks: 'Диаграмманың жаңа түрлеріне арналған құрылыс блоктары',
      theming: 'Тақырыптар',
      formatting: 'Пішімдеу және локализация',
    },
    table: { export: 'Атауы', description: 'Сипаттамасы' },
    baseProps: { lead: 'Барлық диаграммаға ортақ.' },
    export: {
      toc: 'Экспорт',
      title: 'Экспорт (@startupjafari/charts/export)',
      lead: 'Бөлек кіру нүктесі: оны импорттамасаңыз, негізгі бандлға кірмейді.',
    },
    types: {
      title: 'Типтер',
      intro: 'TypeScript типтерінің бәрі негізгі кіру нүктесінен экспортталады:',
      pattern: (
        <p>
          Пропс типтері <code>&lt;Component&gt;Props</code> үлгісімен аталады (
          <code>LineChart</code> компоненті <code>CartesianChartProps</code> типін пайдаланады;
          сондай-ақ <code>AreaChartProps</code>, <code>BarChartProps</code>,{' '}
          <code>PieChartProps</code>… бар).
        </p>
      ),
      alsoExported: 'Сондай-ақ экспортталады (жоғарыда сипатталмаған runtime мәндері)',
    },
  },
};

function chartEntries(): ApiEntry[] {
  return CHARTS.map((c) => ({
    name: c.component,
    signature: `(props: ${c.component}Props) => ReactElement`,
    description: c.summary,
    to: `/charts/${c.slug}`,
  }));
}

function entryNames(e: ApiEntry): string[] {
  return e.name.split(' / ');
}

function ApiTable({ entries }: { entries: ApiEntry[] }) {
  const lang = useLang();
  const t = useText(TEXT).table;
  return (
    <div className="table-wrap api-table">
      <table>
        <thead>
          <tr>
            <th scope="col">{t.export}</th>
            <th scope="col">{t.description}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.name}>
              <th scope="row">
                {e.to ? (
                  <Link to={e.to} {...(e.section ? { section: e.section } : {})}>
                    <code>{e.name}</code>
                  </Link>
                ) : (
                  <code>{e.name}</code>
                )}
              </th>
              <td>
                <p className="api-desc">{inlineCode(e.description[lang])}</p>
                <span className="api-sig">
                  <Code code={e.signature} language="ts" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiReference() {
  const { path } = useLocation();
  const t = useText(TEXT);
  const ui = useT();
  const groups: ApiGroup[] = [
    {
      id: 'charts',
      title: t.groups.charts,
      lead: t.groups.chartsLead,
      entries: chartEntries(),
    },
    { id: 'primitives', title: t.groups.primitives, entries: PRIMITIVES },
    { id: 'providers', title: t.groups.providers, entries: PROVIDERS },
    {
      id: 'building-blocks',
      title: t.groups.buildingBlocks,
      entries: BUILDING_BLOCKS,
    },
    { id: 'theming', title: t.groups.theming, entries: THEMING },
    { id: 'formatting', title: t.groups.formatting, entries: FORMATTING },
  ];
  const documented = new Set(
    [...groups.flatMap((g) => g.entries), ...EXPORT]
      .flatMap(entryNames)
      .flatMap((n) => n.split(' / ')),
  );
  const undocumented = Object.keys(Library)
    .filter((k) => !documented.has(k))
    .sort();
  return (
    <article>
      <PageHeader eyebrow={ui.nav.reference} title={ui.pages.api} lead={t.lead}>
        <nav aria-label={ui.a11y.onThisPage}>
          <ul className="page-toc">
            {[
              ...groups,
              { id: 'base-props', title: 'BaseChartProps' },
              { id: 'export', title: t.export.toc },
              { id: 'types', title: t.types.title },
            ].map((g) => (
              <li key={g.id}>
                <Link to={path} section={g.id}>
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <CodeBlock code={t.importsCode} />
      {groups.map((g) => (
        <Section key={g.id} id={g.id} title={g.title} lead={g.lead}>
          <ApiTable entries={g.entries} />
        </Section>
      ))}
      <Section id="base-props" title="BaseChartProps" lead={t.baseProps.lead}>
        <PropsTable props={BASE_PROPS} />
      </Section>
      <Section id="export" title={t.export.title} lead={t.export.lead}>
        <ApiTable entries={EXPORT} />
      </Section>
      <Section id="types" title={t.types.title}>
        <p>{t.types.intro}</p>
        <ul className="type-list">
          {TYPES.map((type) => (
            <li key={type}>
              <code>{type}</code>
            </li>
          ))}
        </ul>
        {t.types.pattern}
        {undocumented.length ? (
          <Callout title={t.types.alsoExported}>
            <p>
              {undocumented.map((n, i) => (
                <span key={n}>
                  {i ? ', ' : ''}
                  <code>{n}</code>
                </span>
              ))}
            </p>
          </Callout>
        ) : null}
      </Section>
    </article>
  );
}

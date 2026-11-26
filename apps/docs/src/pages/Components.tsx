import { useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';
import { PropsTable, type PropDef } from '../ui/PropsTable';

const VALUE = 'number | string | Date';

const CHART_TICKS: L<string> = { en: "the chart's ticks", ru: 'деления диаграммы' };
const CHART_PLOT: L<string> = { en: "the chart's plot", ru: 'область построения диаграммы' };
const FILL_COLOUR: L<string> = { en: 'Fill colour.', ru: 'Цвет заливки.' };
const EXTRA_CLASS: L<string> = { en: 'Extra class.', ru: 'Дополнительный класс.' };
const X_PIXELS: L<string> = { en: 'x in chart pixels.', ru: 'x в пикселях диаграммы.' };
const Y_PIXELS: L<string> = { en: 'y in chart pixels.', ru: 'y в пикселях диаграммы.' };

const REFERENCE_LINE: PropDef[] = [
  {
    name: 'y',
    type: 'number',
    description: {
      en: 'Value on the value axis (a horizontal line in vertical charts).',
      ru: 'Значение на оси значений (в вертикальных диаграммах — горизонтальная линия).',
    },
  },
  {
    name: 'x',
    type: VALUE,
    description: {
      en: 'Value on the x/category axis (a vertical line).',
      ru: 'Значение на оси X или оси категорий (вертикальная линия).',
    },
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: { en: 'Text next to the line.', ru: 'Текст рядом с линией.' },
  },
  {
    name: 'labelPosition',
    type: "'start' | 'end'",
    default: "'end'",
    description: {
      en: 'Label placement along a horizontal line.',
      ru: 'Положение подписи вдоль горизонтальной линии.',
    },
  },
  {
    name: 'color',
    type: 'string',
    default: 'var(--jc-text-muted)',
    description: { en: 'Line colour.', ru: 'Цвет линии.' },
  },
  {
    name: 'dashed',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Dashed (default) or solid.',
      ru: 'Пунктирная (по умолчанию) или сплошная линия.',
    },
  },
];

const REFERENCE_AREA: PropDef[] = [
  {
    name: 'x1',
    type: VALUE,
    description: {
      en: 'Start on the x/category axis (default: plot edge).',
      ru: 'Начало на оси X или оси категорий (по умолчанию — край области построения).',
    },
  },
  {
    name: 'x2',
    type: VALUE,
    description: {
      en: 'End on the x/category axis.',
      ru: 'Конец на оси X или оси категорий.',
    },
  },
  {
    name: 'y1',
    type: 'number',
    description: { en: 'Start on the value axis.', ru: 'Начало на оси значений.' },
  },
  {
    name: 'y2',
    type: 'number',
    description: { en: 'End on the value axis.', ru: 'Конец на оси значений.' },
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: { en: 'Text in the top-left corner.', ru: 'Текст в левом верхнем углу.' },
  },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: FILL_COLOUR },
  {
    name: 'opacity',
    type: 'number',
    default: '0.05',
    description: { en: 'Fill opacity.', ru: 'Непрозрачность заливки.' },
  },
];

const REFERENCE_DOT: PropDef[] = [
  {
    name: 'x',
    type: VALUE,
    required: true,
    description: {
      en: 'Position on the x/category axis.',
      ru: 'Положение на оси X или оси категорий.',
    },
  },
  {
    name: 'y',
    type: 'number',
    required: true,
    description: { en: 'Position on the value axis.', ru: 'Положение на оси значений.' },
  },
  {
    name: 'r',
    type: 'number',
    default: '5',
    description: { en: 'Radius, px.', ru: 'Радиус, px.' },
  },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: FILL_COLOUR },
  {
    name: 'label',
    type: 'ReactNode',
    description: { en: 'Text above-right of the dot.', ru: 'Текст сверху справа от точки.' },
  },
];

const ANNOTATION: PropDef[] = [
  {
    name: 'x',
    type: 'number',
    required: true,
    description: {
      en: 'Anchor x in chart pixels.',
      ru: 'Координата x точки привязки в пикселях диаграммы.',
    },
  },
  {
    name: 'y',
    type: 'number',
    required: true,
    description: {
      en: 'Anchor y in chart pixels.',
      ru: 'Координата y точки привязки в пикселях диаграммы.',
    },
  },
  {
    name: 'dx',
    type: 'number',
    default: '12',
    description: {
      en: 'Horizontal offset of the note.',
      ru: 'Смещение заметки по горизонтали.',
    },
  },
  {
    name: 'dy',
    type: 'number',
    default: '-18',
    description: { en: 'Vertical offset of the note.', ru: 'Смещение заметки по вертикали.' },
  },
  {
    name: 'connector',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Leader line from the point to the note.',
      ru: 'Выносная линия от точки к заметке.',
    },
  },
  {
    name: 'children',
    type: 'ReactNode',
    required: true,
    description: { en: 'Note text.', ru: 'Текст заметки.' },
  },
];

const LABEL: PropDef[] = [
  { name: 'x', type: 'number', required: true, description: X_PIXELS },
  { name: 'y', type: 'number', required: true, description: Y_PIXELS },
  {
    name: 'children',
    type: 'ReactNode',
    required: true,
    description: { en: 'Text.', ru: 'Текст.' },
  },
  {
    name: 'anchor',
    type: "'start' | 'middle' | 'end'",
    default: "'middle'",
    description: {
      en: 'Text anchor.',
      ru: 'Выравнивание текста относительно точки привязки.',
    },
  },
  {
    name: 'tone',
    type: "'primary' | 'secondary' | 'muted' | 'inverse'",
    default: "'secondary'",
    description: {
      en: 'Text colour token — never the series colour, for contrast.',
      ru: 'Токен цвета текста — ради контраста это никогда не цвет ряда.',
    },
  },
  {
    name: 'fontSize',
    type: 'number',
    description: {
      en: 'Font size, px (default: --jc-font-size).',
      ru: 'Размер шрифта, px (по умолчанию — --jc-font-size).',
    },
  },
  { name: 'className', type: 'string', description: EXTRA_CLASS },
];

const MARKER: PropDef[] = [
  { name: 'x', type: 'number', default: '0', description: X_PIXELS },
  { name: 'y', type: 'number', default: '0', description: Y_PIXELS },
  {
    name: 'shape',
    type: "'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star'",
    default: "'circle'",
    description: { en: 'Symbol shape.', ru: 'Форма символа.' },
  },
  {
    name: 'size',
    type: 'number',
    default: '8',
    description: { en: 'Symbol size, px.', ru: 'Размер символа, px.' },
  },
  { name: 'color', type: 'string', required: true, description: FILL_COLOUR },
  {
    name: 'ring',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Surface-coloured ring so the marker stays legible over lines.',
      ru: 'Кольцо цвета фона, чтобы маркер оставался различимым поверх линий.',
    },
  },
  { name: 'className', type: 'string', description: EXTRA_CLASS },
];

const GRADIENT: PropDef[] = [
  {
    name: 'id',
    type: 'string',
    required: true,
    description: {
      en: 'Gradient id; reference it as `fill="url(#id)"`. Must be unique in the document.',
      ru: 'id градиента; ссылайтесь на него как `fill="url(#id)"`. Должен быть уникальным в пределах документа.',
    },
  },
  {
    name: 'color',
    type: 'string',
    required: true,
    description: {
      en: 'Gradient colour (CSS variables work).',
      ru: 'Цвет градиента (CSS-переменные тоже подходят).',
    },
  },
  {
    name: 'from',
    type: 'number',
    default: '0.24',
    description: {
      en: 'Opacity at the start (top/left).',
      ru: 'Непрозрачность в начале (сверху или слева).',
    },
  },
  {
    name: 'to',
    type: 'number',
    default: '0',
    description: {
      en: 'Opacity at the end (bottom/right).',
      ru: 'Непрозрачность в конце (снизу или справа).',
    },
  },
  {
    name: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: { en: 'Gradient direction.', ru: 'Направление градиента.' },
  },
];

const AXIS: PropDef[] = [
  {
    name: 'position',
    type: "'bottom' | 'top' | 'left' | 'right'",
    required: true,
    description: {
      en: 'Edge of the plot (ChartAxis only; XAxis defaults to bottom, YAxis to left).',
      ru: 'Сторона области построения (только для ChartAxis; XAxis по умолчанию снизу, YAxis — слева).',
    },
  },
  {
    name: 'ticks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: {
      en: '`{ value, position, label, anchor }` — required outside a chart.',
      ru: '`{ value, position, label, anchor }` — обязателен вне диаграммы.',
    },
  },
  {
    name: 'plot',
    type: 'Rect',
    default: CHART_PLOT,
    description: {
      en: '`{ x, y, width, height }` — required outside a chart.',
      ru: '`{ x, y, width, height }` — обязателен вне диаграммы.',
    },
  },
  {
    name: 'line',
    type: 'boolean',
    default: 'false',
    description: { en: 'Draw the axis baseline.', ru: 'Рисовать базовую линию оси.' },
  },
  {
    name: 'tickPadding',
    type: 'number',
    default: '8',
    description: {
      en: 'Distance between labels and the plot, px.',
      ru: 'Расстояние между подписями и областью построения, px.',
    },
  },
  { name: 'title', type: 'string', description: { en: 'Axis title.', ru: 'Заголовок оси.' } },
  { name: 'className', type: 'string', description: EXTRA_CLASS },
];

const GRID: PropDef[] = [
  {
    name: 'horizontal',
    type: 'boolean',
    default: 'true',
    description: { en: 'Lines at y ticks.', ru: 'Линии на делениях по Y.' },
  },
  {
    name: 'vertical',
    type: 'boolean',
    default: 'false',
    description: { en: 'Lines at x ticks.', ru: 'Линии на делениях по X.' },
  },
  {
    name: 'xTicks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: { en: 'Ticks for vertical lines.', ru: 'Деления для вертикальных линий.' },
  },
  {
    name: 'yTicks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: { en: 'Ticks for horizontal lines.', ru: 'Деления для горизонтальных линий.' },
  },
  {
    name: 'plot',
    type: 'Rect',
    default: CHART_PLOT,
    description: { en: 'Plot rectangle.', ru: 'Прямоугольник области построения.' },
  },
  {
    name: 'zeroLine',
    type: 'number | null',
    description: {
      en: 'Pixel y of an emphasised zero line.',
      ru: 'Координата y (в пикселях) выделенной нулевой линии.',
    },
  },
];

const TOOLTIP: PropDef[] = [
  {
    name: 'mode',
    type: "'shared' | 'item'",
    default: "'shared'",
    description: {
      en: '`shared`: every series at the active x; `item`: only the series under the pointer.',
      ru: '`shared` — все ряды в активной точке по X; `item` — только ряд под указателем.',
    },
  },
  {
    name: 'render',
    type: '(data: TooltipData, active: ActiveItem) => ReactNode',
    description: {
      en: 'Custom content. `data` has `title`, formatted `rows` and an optional `footer`.',
      ru: 'Собственное содержимое. В `data` есть `title`, отформатированные `rows` и необязательный `footer`.',
    },
  },
  {
    name: 'sort',
    type: "'none' | 'asc' | 'desc'",
    default: "'none'",
    description: { en: 'Row order.', ru: 'Порядок строк.' },
  },
  {
    name: 'hideEmpty',
    type: 'boolean',
    default: 'false',
    description: { en: 'Hide rows without a value.', ru: 'Скрывать строки без значения.' },
  },
  {
    name: 'offset',
    type: 'number',
    default: '14',
    description: {
      en: 'Distance from the anchor, px.',
      ru: 'Расстояние от точки привязки, px.',
    },
  },
];

const LEGEND: PropDef[] = [
  {
    name: 'position',
    type: "'top' | 'bottom'",
    default: "'bottom'",
    description: { en: 'Above or below the plot.', ru: 'Над областью построения или под ней.' },
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: { en: 'Horizontal alignment.', ru: 'Выравнивание по горизонтали.' },
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Clicking an item toggles the series (the last visible one stays on).',
      ru: 'Нажатие на элемент скрывает или показывает ряд (последний видимый ряд скрыть нельзя).',
    },
  },
  {
    name: 'render',
    type: '(items: SeriesInfo[], toggle: (id: string) => void) => ReactNode',
    description: {
      en: 'Custom legend. Items carry `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value`.',
      ru: 'Собственная легенда. Элементы содержат `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value`.',
    },
  },
];

const CROSSHAIR: PropDef[] = [
  {
    name: 'horizontal',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Also draw a horizontal line at the pointer.',
      ru: 'Дополнительно рисовать горизонтальную линию на уровне указателя.',
    },
  },
  {
    name: 'vertical',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Draw the vertical line (ChartCrosshair primitive only).',
      ru: 'Рисовать вертикальную линию (только для примитива ChartCrosshair).',
    },
  },
];

const PROVIDER: PropDef[] = [
  {
    name: 'locale',
    type: 'string',
    description: {
      en: 'Default locale for all charts below.',
      ru: 'Локаль по умолчанию для всех вложенных диаграмм.',
    },
  },
  {
    name: 'theme',
    type: "'auto' | 'light' | 'dark' | Theme",
    description: { en: 'Default theme.', ru: 'Тема по умолчанию.' },
  },
  {
    name: 'animation',
    type: 'boolean | AnimationOptions',
    description: {
      en: '`{ duration, easing, initial, maxComplexity }`; easing names: linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
      ru: '`{ duration, easing, initial, maxComplexity }`; функции плавности (easing): linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
    },
  },
  {
    name: 'renderer',
    type: "'svg' | 'canvas' | 'auto'",
    description: { en: 'Default renderer.', ru: 'Рендерер по умолчанию.' },
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: {
      en: 'Text overrides, merged with parent providers.',
      ru: 'Переопределения текстов; объединяются с переопределениями родительских провайдеров.',
    },
  },
  {
    name: 'injectStyles',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Inject the stylesheet automatically. Disable when importing `@jafari/charts/styles.css`.',
      ru: 'Автоматически внедрять таблицу стилей. Отключите, если импортируете `@jafari/charts/styles.css`.',
    },
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: { en: 'Your app.', ru: 'Ваше приложение.' },
  },
];

const STATES: PropDef[] = [
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'With data: dims the previous render. Without data: a static placeholder.',
      ru: 'При наличии данных приглушает предыдущую отрисовку. Без данных — статичная заглушка.',
    },
  },
  {
    name: 'error',
    type: 'boolean | ReactNode',
    description: {
      en: '`true` for the default message, or your own node.',
      ru: '`true` — стандартное сообщение; можно передать и собственный React-узел.',
    },
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: {
      en: 'Adds a retry button to the error state.',
      ru: 'Добавляет в состояние ошибки кнопку «Повторить».',
    },
  },
  {
    name: 'emptyMessage',
    type: 'ReactNode',
    default: { en: "'No data'", ru: "'Нет данных' (для ru)" },
    description: { en: 'Text of the empty state.', ru: 'Текст состояния «нет данных».' },
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: {
      en: 'noData, loading, error, retry, resetZoom and more.',
      ru: 'noData, loading, error, retry, resetZoom и другие.',
    },
  },
];

const TOC = [
  'reference',
  'annotations',
  'gradient',
  'axes',
  'tooltip',
  'legend',
  'crosshair',
  'states',
  'chart-provider',
] as const;

const en = {
  lead: 'Charts are composed of primitives. Most are rendered for you; the ones below can also be placed inside any cartesian chart, configured through chart props, or used on their own.',
  toc: {
    reference: 'Reference lines, areas, dots',
    annotations: 'Annotations, labels, markers',
    gradient: 'Gradients',
    axes: 'Axes and grid',
    tooltip: 'Tooltip',
    legend: 'Legend',
    crosshair: 'Crosshair and cursor',
    states: 'States',
    'chart-provider': 'ChartProvider',
  } satisfies Record<(typeof TOC)[number], string>,
  reference: {
    title: 'Reference lines, areas and dots',
    body: (
      <p>
        <code>ChartReferenceLine</code>, <code>ChartReferenceArea</code> and{' '}
        <code>ChartReferenceDot</code> take <em>data values</em> and use the chart’s scales, in
        either orientation (<code>y</code> always means the value axis). Place them as children of a
        cartesian chart.
      </p>
    ),
  },
  annotations: {
    title: 'Annotations, labels and markers',
    body: (
      <p>
        <code>ChartAnnotation</code>, <code>ChartLabel</code> and <code>ChartMarker</code> work in
        chart <em>pixels</em>. Inside a chart, <code>useChart()</code> returns the scales (
        <code>frame.x</code>, <code>frame.y</code>), the plot rectangle, the interaction store and
        the series, so a small component can translate data into pixels — that is how you build your
        own primitives.
      </p>
    ),
    example: 'A custom primitive with useChart()',
  },
  gradient: {
    title: 'Gradients',
    body: (
      <p>
        <code>ChartGradient</code> renders a <code>&lt;linearGradient&gt;</code> definition for
        custom marks. Generate the id with <code>useId</code> so two charts never share one.
      </p>
    ),
  },
  axes: {
    title: 'Axes and grid',
    body: (
      <p>
        Charts draw their own axes and grid — configure them with the <code>xAxis</code>,{' '}
        <code>yAxis</code>, <code>y2Axis</code> and <code>grid</code> props (see any{' '}
        <Link to="/charts/line-chart" section="props">
          cartesian chart
        </Link>
        ). <code>XAxis</code>, <code>YAxis</code>, <code>ChartAxis</code> and <code>ChartGrid</code>{' '}
        are the primitives behind them; outside a chart they need explicit <code>ticks</code> and{' '}
        <code>plot</code>.
      </p>
    ),
    example: 'Primitives outside a chart',
  },
  tooltip: {
    title: 'Tooltip',
    body: (
      <p>
        The HTML tooltip re-renders only when the active item changes; its position follows the
        pointer through a direct style update, so moving the mouse never re-renders React. It is
        configured with the <code>tooltip</code> prop (<code>false</code> hides it). Tooltips
        enhance but never gate: every value is also in the data table and keyboard announcements.
      </p>
    ),
    example: 'Custom tooltip content',
  },
  legend: {
    title: 'Legend',
    body: (
      <p>
        The legend appears for two or more series and wraps on narrow screens. Items are buttons
        with <code>aria-pressed</code>; hovering or focusing one highlights its series.
      </p>
    ),
    example: 'Custom legend',
  },
  crosshair: {
    title: 'Crosshair and cursor',
    body: (
      <p>
        <code>ChartCrosshair</code> is a hairline that snaps to the active x;{' '}
        <code>ChartCursor</code> is the soft band behind the active category in bar charts. Both are
        drawn automatically and controlled with the <code>crosshair</code> prop.
      </p>
    ),
    example: 'Crosshair and cursor',
  },
  states: {
    title: 'States',
    body: (
      <p>
        Empty, loading and error states keep the chart’s footprint. While loading with data, the
        previous render stays visible at reduced opacity — no skeleton flash. The state components (
        <code>ChartEmptyState</code>, <code>ChartLoadingState</code>, <code>ChartErrorState</code>)
        are exported for custom charts.
      </p>
    ),
    example: 'All states',
    caption: 'State props (every chart)',
  },
  provider: {
    body: (
      <p>
        Sets defaults for every chart below it. Providers nest: an inner provider overrides the
        outer one, and <code>messages</code> are merged.
      </p>
    ),
    example: 'Brand theme, locale and animation',
    calloutTitle: 'Reading the configuration',
    calloutBody: (
      <>
        <code>useChartConfig()</code> returns the merged provider configuration — useful when a
        custom component should follow the same locale.
      </>
    ),
  },
};

const TEXT: L<typeof en> = {
  en,
  ru: {
    lead: 'Диаграммы собираются из примитивов. Большинство из них отрисовываются автоматически, а те, что описаны ниже, можно также разместить внутри любой декартовой диаграммы, настроить через пропсы диаграммы или использовать отдельно.',
    toc: {
      reference: 'Опорные линии, области, точки',
      annotations: 'Аннотации, подписи, маркеры',
      gradient: 'Градиенты',
      axes: 'Оси и сетка',
      tooltip: 'Подсказка',
      legend: 'Легенда',
      crosshair: 'Перекрестие и курсор',
      states: 'Состояния',
      'chart-provider': 'ChartProvider',
    },
    reference: {
      title: 'Опорные линии, области и точки',
      body: (
        <p>
          <code>ChartReferenceLine</code>, <code>ChartReferenceArea</code> и{' '}
          <code>ChartReferenceDot</code> принимают <em>значения данных</em> и используют шкалы
          диаграммы при любой ориентации (<code>y</code> всегда обозначает ось значений). Размещайте
          их как дочерние элементы декартовой диаграммы.
        </p>
      ),
    },
    annotations: {
      title: 'Аннотации, подписи и маркеры',
      body: (
        <p>
          <code>ChartAnnotation</code>, <code>ChartLabel</code> и <code>ChartMarker</code> работают
          в <em>пикселях</em> диаграммы. Внутри диаграммы <code>useChart()</code> возвращает шкалы (
          <code>frame.x</code>, <code>frame.y</code>), прямоугольник области построения, хранилище
          состояния взаимодействия и ряды, поэтому небольшой компонент может переводить данные в
          пиксели — так и создаются собственные примитивы.
        </p>
      ),
      example: 'Собственный примитив на основе useChart()',
    },
    gradient: {
      title: 'Градиенты',
      body: (
        <p>
          <code>ChartGradient</code> отрисовывает определение <code>&lt;linearGradient&gt;</code>{' '}
          для собственных меток. Генерируйте id с помощью <code>useId</code>, чтобы у двух диаграмм
          никогда не оказалось общего id.
        </p>
      ),
    },
    axes: {
      title: 'Оси и сетка',
      body: (
        <p>
          Диаграммы сами рисуют оси и сетку — настраивайте их пропсами <code>xAxis</code>,{' '}
          <code>yAxis</code>, <code>y2Axis</code> и <code>grid</code> (см. любую{' '}
          <Link to="/charts/line-chart" section="props">
            декартову диаграмму
          </Link>
          ). <code>XAxis</code>, <code>YAxis</code>, <code>ChartAxis</code> и <code>ChartGrid</code>{' '}
          — примитивы, на которых они построены; вне диаграммы им нужно явно передать{' '}
          <code>ticks</code> и <code>plot</code>.
        </p>
      ),
      example: 'Примитивы вне диаграммы',
    },
    tooltip: {
      title: 'Подсказка',
      body: (
        <p>
          HTML-подсказка (tooltip) перерисовывается только при смене активного элемента; за
          указателем она следует через прямое обновление стилей, поэтому движение мыши никогда не
          вызывает перерисовку React. Подсказка настраивается пропом <code>tooltip</code> (
          <code>false</code> скрывает её). Подсказки — лишь удобство, а не единственный путь к
          данным: каждое значение есть и в таблице данных, и в голосовых оповещениях при навигации с
          клавиатуры.
        </p>
      ),
      example: 'Собственное содержимое подсказки',
    },
    legend: {
      title: 'Легенда',
      body: (
        <p>
          Легенда появляется, когда рядов два и больше, и на узких экранах переносится на несколько
          строк. Её элементы — кнопки с <code>aria-pressed</code>; наведение или фокус на элементе
          выделяет соответствующий ряд.
        </p>
      ),
      example: 'Собственная легенда',
    },
    crosshair: {
      title: 'Перекрестие и курсор',
      body: (
        <p>
          <code>ChartCrosshair</code> — тонкая линия, которая привязывается к активной точке по X;{' '}
          <code>ChartCursor</code> — мягкая полоса за активной категорией в столбчатых диаграммах.
          Оба рисуются автоматически и управляются пропом <code>crosshair</code>.
        </p>
      ),
      example: 'Перекрестие и курсор',
    },
    states: {
      title: 'Состояния',
      body: (
        <p>
          Состояния «нет данных», загрузки и ошибки сохраняют размеры диаграммы. Если при загрузке
          данные уже есть, предыдущая отрисовка остаётся видимой, но приглушённой — без мелькания
          скелетона. Компоненты состояний (<code>ChartEmptyState</code>,{' '}
          <code>ChartLoadingState</code>, <code>ChartErrorState</code>) экспортируются для
          собственных диаграмм.
        </p>
      ),
      example: 'Все состояния',
      caption: 'Пропсы состояний (у всех диаграмм)',
    },
    provider: {
      body: (
        <p>
          Задаёт значения по умолчанию для всех диаграмм внутри него. Провайдеры можно вкладывать
          друг в друга: внутренний переопределяет внешний, а <code>messages</code> объединяются.
        </p>
      ),
      example: 'Фирменная тема, локаль и анимация',
      calloutTitle: 'Чтение конфигурации',
      calloutBody: (
        <>
          <code>useChartConfig()</code> возвращает объединённую конфигурацию провайдеров — это
          пригодится, когда собственный компонент должен использовать ту же локаль.
        </>
      ),
    },
  },
};

export function Components() {
  const { path } = useLocation();
  const t = useText(TEXT);
  const ui = useT();
  return (
    <article>
      <PageHeader eyebrow={ui.nav.guides} title={ui.pages.components} lead={t.lead}>
        <nav aria-label={ui.a11y.onThisPage}>
          <ul className="page-toc">
            {TOC.map((id) => (
              <li key={id}>
                <Link to={path} section={id}>
                  {t.toc[id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="reference" title={t.reference.title}>
        {t.reference.body}
        <Example id="components/ReferenceLine" title="ChartReferenceLine" codeOpen />
        <PropsTable props={REFERENCE_LINE} caption="ChartReferenceLine" />
        <Example id="components/ReferenceArea" title="ChartReferenceArea" />
        <PropsTable props={REFERENCE_AREA} caption="ChartReferenceArea" />
        <Example id="components/ReferenceDot" title="ChartReferenceDot" />
        <PropsTable props={REFERENCE_DOT} caption="ChartReferenceDot" />
      </Section>

      <Section id="annotations" title={t.annotations.title}>
        {t.annotations.body}
        <Example id="components/Annotations" title={t.annotations.example} codeOpen />
        <PropsTable props={ANNOTATION} caption="ChartAnnotation" />
        <PropsTable props={LABEL} caption="ChartLabel" />
        <PropsTable props={MARKER} caption="ChartMarker" />
      </Section>

      <Section id="gradient" title={t.gradient.title}>
        {t.gradient.body}
        <Example id="components/Gradient" title="ChartGradient" />
        <PropsTable props={GRADIENT} caption="ChartGradient" />
      </Section>

      <Section id="axes" title={t.axes.title}>
        {t.axes.body}
        <Example id="components/Axes" title={t.axes.example} />
        <PropsTable props={AXIS} caption="ChartAxis / XAxis / YAxis" />
        <PropsTable props={GRID} caption="ChartGrid" />
      </Section>

      <Section id="tooltip" title={t.tooltip.title}>
        {t.tooltip.body}
        <Example id="components/Tooltip" title={t.tooltip.example} />
        <PropsTable props={TOOLTIP} caption="tooltip (TooltipOptions)" />
      </Section>

      <Section id="legend" title={t.legend.title}>
        {t.legend.body}
        <Example id="components/Legend" title={t.legend.example} />
        <PropsTable props={LEGEND} caption="legend (LegendOptions)" />
      </Section>

      <Section id="crosshair" title={t.crosshair.title}>
        {t.crosshair.body}
        <Example id="components/Crosshair" title={t.crosshair.example} />
        <PropsTable props={CROSSHAIR} caption="crosshair (CrosshairOptions)" />
      </Section>

      <Section id="states" title={t.states.title}>
        {t.states.body}
        <Example id="components/States" title={t.states.example} />
        <PropsTable props={STATES} caption={t.states.caption} />
      </Section>

      <Section id="chart-provider" title="ChartProvider">
        {t.provider.body}
        <Example id="components/Provider" title={t.provider.example} />
        <PropsTable props={PROVIDER} caption="ChartProvider" />
        <Callout title={t.provider.calloutTitle}>{t.provider.calloutBody}</Callout>
        <CodeBlock
          code={`import { formatNumber, useChartConfig } from '@jafari/charts';

function Total({ value }: { value: number }) {
  const { locale = 'en' } = useChartConfig();
  return <strong>{formatNumber(value, { locale })}</strong>;
}`}
        />
      </Section>
    </article>
  );
}

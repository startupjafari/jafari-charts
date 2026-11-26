import { Link } from '../lib/router';
import type { PropDef } from '../ui/PropsTable';
import type { PropGroup } from './types';

/**
 * Hand-written prop tables shared by several chart pages. Kept in sync with
 * `packages/react/src/internal/useChartRoot.ts` (BaseChartProps),
 * `packages/react/src/charts/cartesian/types.ts` and the chart components.
 * Descriptions are `{ en, ru }`; backticks become inline code.
 */

export const BASE_PROPS: readonly PropDef[] = [
  {
    name: 'height',
    type: 'number',
    default: { en: 'per chart', ru: 'зависит от диаграммы' },
    description: {
      en: 'Height of the chart surface including axes, px. The legend is added below. Defaults: 280 (cartesian), 260 (pie/donut), 200 (radial progress, gauge), 40 (sparkline).',
      ru: 'Высота области диаграммы вместе с осями, px. Легенда добавляется снизу. По умолчанию: 280 (декартовы), 260 (круговая и кольцевая), 200 (радиальный прогресс, gauge), 40 (спарклайн).',
    },
  },
  {
    name: 'width',
    type: 'number',
    description: {
      en: 'Fixed width, px. Omit to fill the container and follow its resizes.',
      ru: 'Фиксированная ширина, px. Если не задана, диаграмма заполняет контейнер и следует за изменением его размеров.',
    },
  },
  {
    name: 'initialWidth',
    type: 'number',
    default: '640',
    description: {
      en: 'Width assumed for server rendering before the container is measured.',
      ru: 'Ширина для серверного рендеринга — до того, как контейнер будет измерен.',
    },
  },
  {
    name: 'theme',
    type: "'auto' | 'light' | 'dark' | Theme",
    default: "'auto'",
    description: {
      en: (
        <>
          <code>auto</code> follows the host app (a <code>.dark</code> ancestor or its{' '}
          <code>color-scheme</code>). Pass a <code>createTheme()</code> result for custom tokens.
          See <Link to="/themes">Themes</Link>.
        </>
      ),
      ru: (
        <>
          <code>auto</code> следует за приложением (предок с классом <code>.dark</code> или его{' '}
          <code>color-scheme</code>). Для собственных токенов передайте результат{' '}
          <code>createTheme()</code>. См. <Link to="/themes">Темы</Link>.
        </>
      ),
    },
  },
  {
    name: 'locale',
    type: 'string',
    default: "'en'",
    description: {
      en: 'BCP 47 locale for numbers, dates and built-in texts ("en", "ru", "kk"…). Inherits from ChartProvider.',
      ru: 'Локаль BCP 47 для чисел, дат и встроенных текстов ("en", "ru", "kk"…). Наследуется от ChartProvider.',
    },
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: {
      en: 'Overrides for built-in texts (no data, loading, reset zoom…).',
      ru: 'Переопределения встроенных текстов («Нет данных», «Загрузка…», «Сбросить масштаб»…).',
    },
  },
  {
    name: 'animation',
    type: 'boolean | AnimationOptions',
    default: 'true',
    description: {
      en: '`false` disables all animation; `{ duration, easing, initial, maxComplexity }` tunes it. Reduced-motion preferences are always respected.',
      ru: '`false` отключает всю анимацию; `{ duration, easing, initial, maxComplexity }` настраивает её. Системная настройка «уменьшить движение» (reduced motion) соблюдается всегда.',
    },
  },
  {
    name: 'renderer',
    type: "'svg' | 'canvas' | 'auto'",
    default: "'svg'",
    description: {
      en: 'Rendering backend for data marks. Canvas is loaded lazily. `auto` switches to canvas only above a per-chart threshold measured in benchmarks.',
      ru: 'Рендерер для меток данных. Canvas загружается лениво. `auto` переходит на canvas только выше порога, измеренного в бенчмарках для каждого типа диаграммы.',
    },
  },
  {
    name: 'className',
    type: 'string',
    description: {
      en: 'Class added to the chart root (`.jc-root`).',
      ru: 'Класс корневого элемента диаграммы (`.jc-root`).',
    },
  },
  {
    name: 'style',
    type: 'CSSProperties',
    description: {
      en: 'Inline styles for the chart root.',
      ru: 'Инлайн-стили корневого элемента диаграммы.',
    },
  },
  {
    name: 'id',
    type: 'string',
    description: { en: 'DOM id of the chart root.', ru: 'DOM-id корневого элемента диаграммы.' },
  },
  {
    name: 'title',
    type: 'string',
    default: { en: "'Chart'", ru: "'Диаграмма' (для ru)" },
    description: {
      en: 'Accessible name of the chart (announced by screen readers).',
      ru: 'Доступное имя диаграммы (озвучивается скринридерами).',
    },
  },
  {
    name: 'description',
    type: 'string',
    description: {
      en: 'Extra accessible description appended to the automatic summary.',
      ru: 'Дополнительное доступное описание, которое добавляется к автоматической сводке.',
    },
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'With data: keeps the previous render dimmed. Without data: a static placeholder (no infinite animation).',
      ru: 'При наличии данных предыдущая отрисовка остаётся на месте, приглушённая. Без данных — статичная заглушка (без бесконечной анимации).',
    },
  },
  {
    name: 'error',
    type: 'boolean | ReactNode',
    description: {
      en: 'Error state: `true` shows the default message, a node replaces it.',
      ru: 'Состояние ошибки: `true` показывает стандартное сообщение, React-узел заменяет его.',
    },
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: {
      en: 'Adds a Retry button to the error state.',
      ru: 'Добавляет в состояние ошибки кнопку «Повторить».',
    },
  },
  {
    name: 'emptyMessage',
    type: 'ReactNode',
    default: { en: "'No data'", ru: "'Нет данных' (для ru)" },
    description: {
      en: 'Shown when there is nothing to plot. The chart keeps its height.',
      ru: 'Показывается, когда отображать нечего. Диаграмма сохраняет свою высоту.',
    },
  },
  {
    name: 'accessibilityTable',
    type: 'boolean | number',
    default: { en: '≤ 60 rows', ru: '≤ 60 строк' },
    description: {
      en: 'Visually hidden data table for screen readers. `true` always, `false` never, a number sets the row limit.',
      ru: 'Визуально скрытая таблица данных для скринридеров. `true` — всегда, `false` — никогда, число задаёт предельное количество строк.',
    },
  },
];

export const CARTESIAN_PROPS: readonly PropDef[] = [
  {
    name: 'data',
    type: 'readonly T[]',
    required: true,
    description: { en: 'Rows to plot.', ru: 'Строки данных для построения.' },
  },
  {
    name: 'xKey',
    type: 'DimensionKey<T>',
    required: true,
    description: {
      en: "Field for the x axis: dates (`Date` or ISO string), numbers or categories. Numeric timestamps need `xAxis={{ type: 'time' }}`. Type-checked against `T`.",
      ru: "Поле для оси X: даты (`Date` или ISO-строка), числа или категории. Для числовых временных меток нужен `xAxis={{ type: 'time' }}`. Проверяется по типу `T`.",
    },
  },
  {
    name: 'yKey',
    type: 'NumericKey<T>',
    description: {
      en: 'Single-series shortcut for `series={[{ key: yKey }]}`. If neither `yKey` nor `series` is given, the first numeric field is used (with a dev warning).',
      ru: 'Сокращение для одного ряда: то же, что `series={[{ key: yKey }]}`. Если не заданы ни `yKey`, ни `series`, берётся первое числовое поле (с предупреждением в режиме разработки).',
    },
  },
  {
    name: 'series',
    type: 'readonly SeriesConfig<T>[]',
    description: {
      en: 'One entry per series; see the SeriesConfig table below.',
      ru: 'По одной записи на ряд данных; см. таблицу SeriesConfig ниже.',
    },
  },
  {
    name: 'color',
    type: 'string',
    description: {
      en: 'Colour of the single-series shortcut.',
      ru: 'Цвет единственного ряда (сокращение `yKey`).',
    },
  },
  {
    name: 'label',
    type: 'string',
    description: {
      en: 'Label of the single-series shortcut.',
      ru: 'Название единственного ряда (сокращение `yKey`).',
    },
  },
  {
    name: 'curve',
    type: "'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter'",
    default: "'monotone'",
    description: {
      en: 'Line interpolation. Monotone never overshoots the data.',
      ru: 'Интерполяция линии. Монотонная кривая никогда не выходит за пределы данных.',
    },
  },
  {
    name: 'xAxis',
    type: 'boolean | XAxisOptions',
    default: 'true',
    description: {
      en: 'Category / x axis, whichever side it is drawn on (left in horizontal bar charts). `false` hides it; options: `tickCount`, `format`, `type`, `utc`, `line`, `title`, `maxLines`, `maxLabelWidth`.',
      ru: 'Ось категорий / ось X, на какой бы стороне она ни была (в горизонтальной столбчатой диаграмме — слева). `false` скрывает её; параметры: `tickCount`, `format`, `type`, `utc`, `line`, `title`, `maxLines`, `maxLabelWidth`.',
    },
  },
  {
    name: 'xAxis.maxLines',
    type: 'number',
    default: { en: '2 (text)', ru: '2 (текст)' },
    description: {
      en: 'Category axes: long labels wrap at word boundaries onto up to this many lines (1 for dates and numbers); `1` truncates. The tooltip shows the full label.',
      ru: 'Ось категорий: длинные подписи переносятся по словам, не более чем на столько строк (для дат и чисел — 1); `1` обрезает. Полная подпись — в подсказке.',
    },
  },
  {
    name: 'xAxis.maxLabelWidth',
    type: 'number',
    description: {
      en: 'Category axes: longest a label line may be, px. Defaults: 140 at the bottom, 32% of the chart width on the left.',
      ru: 'Ось категорий: наибольшая ширина строки подписи, px. По умолчанию 140 снизу и 32% ширины диаграммы слева.',
    },
  },
  {
    name: 'yAxis',
    type: 'boolean | YAxisOptions',
    default: 'true',
    description: {
      en: 'Value axis, whichever side it is drawn on (bottom in horizontal bar charts). `false` hides it; options: `tickCount`, `format`, `min`, `max`, `includeZero`, `scale`, `nice`, `title`, `line`, `integer`.',
      ru: 'Ось значений, на какой бы стороне она ни была (в горизонтальной столбчатой диаграмме — снизу). `false` скрывает её; параметры: `tickCount`, `format`, `min`, `max`, `includeZero`, `scale`, `nice`, `title`, `line`, `integer`.',
    },
  },
  {
    name: 'yAxis.line',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Draw the value axis baseline.',
      ru: 'Рисовать базовую линию оси значений.',
    },
  },
  {
    name: 'yAxis.integer',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Whole-number ticks only, for counts: a 0–2 range gets 0, 1, 2, never 0.5 or 1.5. The domain is rounded out to whole numbers.',
      ru: 'Только целые деления, для количеств: на диапазоне 0–2 — 0, 1, 2 без дробных 0,5 и 1,5. Границы округляются до целых.',
    },
  },
  {
    name: 'y2Axis',
    type: 'boolean | YAxisOptions',
    description: {
      en: "Secondary value axis used by series with `axis: 'right'`. Same options as `yAxis`, including `integer`.",
      ru: "Вторая ось значений — для рядов с `axis: 'right'`. Параметры те же, что у `yAxis`, включая `integer`.",
    },
  },
  {
    name: 'grid',
    type: 'boolean | { horizontal?: boolean; vertical?: boolean }',
    default: 'true',
    description: {
      en: 'Hairline gridlines; horizontal by default.',
      ru: 'Тонкие линии сетки; по умолчанию только горизонтальные.',
    },
  },
  {
    name: 'tooltip',
    type: 'boolean | TooltipOptions',
    default: 'true',
    description: {
      en: "Shared tooltip by default. Options: `mode` ('shared' | 'item'), `render`, `sort`, `hideEmpty`, `offset`.",
      ru: "По умолчанию — общая подсказка для всех рядов. Параметры: `mode` ('shared' | 'item'), `render`, `sort`, `hideEmpty`, `offset`.",
    },
  },
  {
    name: 'legend',
    type: 'boolean | LegendOptions',
    default: { en: '2+ series', ru: 'от 2 рядов' },
    description: {
      en: "Shown automatically for two or more series. Options: `position` ('top' | 'bottom'), `align`, `interactive`, `render`.",
      ru: "Показывается автоматически, если рядов два и больше. Параметры: `position` ('top' | 'bottom'), `align`, `interactive`, `render`.",
    },
  },
  {
    name: 'crosshair',
    type: 'boolean | { horizontal?: boolean }',
    default: { en: 'true (lines/areas)', ru: 'true (линии и области)' },
    description: {
      en: 'Vertical hairline at the active x. Bar charts use a soft band (cursor) instead.',
      ru: 'Тонкая вертикальная линия в активной точке по X. Столбчатые диаграммы вместо неё подсвечивают категорию мягкой полосой (курсор).',
    },
  },
  {
    name: 'dots',
    type: 'boolean',
    default: 'false',
    description: { en: 'Markers on every point.', ru: 'Маркеры в каждой точке.' },
  },
  {
    name: 'differentiate',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Distinct marker shapes and dash patterns per series, so identity never relies on colour alone.',
      ru: 'Свои формы маркеров и типы штриховки для каждого ряда, чтобы ряды различались не только цветом.',
    },
  },
  {
    name: 'valueFormatter',
    type: '(value: number, series: string) => string',
    description: {
      en: 'Formats values in tooltips, labels and the data table.',
      ru: 'Форматирует значения в подсказках, подписях и таблице данных.',
    },
  },
  {
    name: 'xFormatter',
    type: '(value: AxisValue) => string',
    description: {
      en: 'Formats x values in tooltips and the data table.',
      ru: 'Форматирует значения X в подсказках и таблице данных.',
    },
  },
  {
    name: 'hiddenSeries',
    type: 'readonly string[]',
    description: {
      en: 'Controlled list of hidden series keys (legend toggling).',
      ru: 'Контролируемый список ключей скрытых рядов (переключение в легенде).',
    },
  },
  {
    name: 'defaultHiddenSeries',
    type: 'readonly string[]',
    default: '[]',
    description: {
      en: 'Initially hidden series (uncontrolled).',
      ru: 'Ряды, скрытые изначально (неконтролируемый режим).',
    },
  },
  {
    name: 'onHiddenSeriesChange',
    type: '(hidden: string[]) => void',
    description: {
      en: 'Called when the legend toggles a series.',
      ru: 'Вызывается, когда легенда скрывает или показывает ряд.',
    },
  },
  {
    name: 'activeIndex',
    type: 'number | null',
    description: {
      en: 'Controlled active data index (`null` = none).',
      ru: 'Контролируемый индекс активной точки (`null` — активной точки нет).',
    },
  },
  {
    name: 'onActiveIndexChange',
    type: '(index: number | null) => void',
    description: {
      en: 'Called when the active index changes (pointer, touch or keyboard).',
      ru: 'Вызывается при смене активного индекса (указатель, касание или клавиатура).',
    },
  },
  {
    name: 'onHover',
    type: '(event: ChartItemEvent<T> | null) => void',
    description: {
      en: 'Hover callback with the datum, index, series, value and x.',
      ru: 'Колбэк наведения: строка данных, индекс, ряд, значение и x.',
    },
  },
  {
    name: 'onClick',
    type: '(event: ChartItemEvent<T>) => void',
    description: {
      en: 'Click (or Enter/Space on the focused item).',
      ru: 'Нажатие (или Enter/Пробел на элементе в фокусе).',
    },
  },
  {
    name: 'downsample',
    type: "false | { method?: 'lttb' | 'minmax'; threshold?: number }",
    default: { en: 'LTTB, 2 × plot width', ru: 'LTTB, 2 × ширина области построения' },
    description: {
      en: 'Line/area downsampling for large inputs. `false` draws every point.',
      ru: 'Прореживание (downsampling) линий и областей на больших объёмах данных. `false` рисует каждую точку.',
    },
  },
  {
    name: 'zoom',
    type: "boolean | { wheel?: boolean | 'ctrl'; minSpan?: number }",
    default: 'false',
    description: {
      en: 'Zoom & pan along continuous x axes: Ctrl/⌘ + wheel or pinch, drag to pan, double-click or 0 to reset, +/− on the keyboard.',
      ru: 'Масштабирование и панорамирование по непрерывной оси X: Ctrl/⌘ + колесо мыши или щипок, перетаскивание — панорамирование, двойной щелчок или 0 — сброс, +/− на клавиатуре.',
    },
  },
  {
    name: 'xDomain',
    type: 'readonly [number, number] | null',
    description: {
      en: 'Controlled visible x range (timestamps or numbers).',
      ru: 'Контролируемый видимый диапазон по X (временные метки или числа).',
    },
  },
  {
    name: 'onXDomainChange',
    type: '(domain: readonly [number, number] | null) => void',
    description: {
      en: 'Called when zooming or panning changes the visible range.',
      ru: 'Вызывается, когда масштабирование или панорамирование меняет видимый диапазон.',
    },
  },
  {
    name: 'brush',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Drag to select an x range. Combined with `zoom`, the selection zooms in.',
      ru: 'Выделение диапазона по X перетаскиванием. Вместе с `zoom` выделенный диапазон приближается.',
    },
  },
  {
    name: 'onBrush',
    type: '(range: { from: AxisValue; to: AxisValue; startIndex: number; endIndex: number }) => void',
    description: {
      en: 'Called with the selected range when a brush gesture ends.',
      ru: 'Вызывается с выделенным диапазоном, когда жест выделения завершён.',
    },
  },
  {
    name: 'syncId',
    type: 'string',
    description: {
      en: 'Charts with the same id share the crosshair and tooltip.',
      ru: 'Диаграммы с одинаковым id синхронизируют перекрестие и подсказку.',
    },
  },
  {
    name: 'highlightedSeries',
    type: 'string | null',
    description: {
      en: 'Controlled emphasis of one series; the others fade. `null` clears it.',
      ru: 'Контролируемое выделение одного ряда; остальные приглушаются. `null` снимает выделение.',
    },
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: {
      en: 'Primitives drawn above the data (reference lines, areas, annotations…).',
      ru: 'Примитивы, которые рисуются поверх данных (опорные линии, области, аннотации…).',
    },
  },
];

export const SERIES_CONFIG_PROPS: readonly PropDef[] = [
  {
    name: 'key',
    type: 'NumericKey<T>',
    required: true,
    description: {
      en: 'Field holding the series values; must be numeric in `T`.',
      ru: 'Поле со значениями ряда; в `T` оно должно быть числовым.',
    },
  },
  {
    name: 'label',
    type: 'string',
    default: 'key',
    description: { en: 'Name in legend and tooltip.', ru: 'Название в легенде и подсказке.' },
  },
  {
    name: 'color',
    type: 'string',
    default: { en: 'theme slot', ru: 'цвет слота темы' },
    description: {
      en: 'Any CSS colour, including `var(--jc-series-3)`.',
      ru: 'Любой CSS-цвет, включая `var(--jc-series-3)`.',
    },
  },
  {
    name: 'type',
    type: "'line' | 'area' | 'bar'",
    description: {
      en: 'Mark type for this series (ComboChart).',
      ru: 'Тип меток для этого ряда (ComboChart).',
    },
  },
  {
    name: 'curve',
    type: 'CurveType',
    description: { en: 'Per-series interpolation.', ru: 'Интерполяция для этого ряда.' },
  },
  {
    name: 'dashed',
    type: 'boolean',
    description: { en: 'Dashed line.', ru: 'Пунктирная линия.' },
  },
  {
    name: 'axis',
    type: "'left' | 'right'",
    default: "'left'",
    description: {
      en: '`right` plots the series on a secondary axis (`y2Axis`).',
      ru: '`right` строит ряд по второй оси значений (`y2Axis`).',
    },
  },
  {
    name: 'stackId',
    type: 'string',
    description: {
      en: 'Series with the same id are stacked.',
      ru: 'Ряды с одинаковым id складываются в стек (накопление).',
    },
  },
  {
    name: 'dots',
    type: 'boolean',
    description: { en: 'Markers on this series.', ru: 'Маркеры на этом ряду.' },
  },
  {
    name: 'symbol',
    type: "'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star'",
    description: { en: 'Marker shape.', ru: 'Форма маркера.' },
  },
  {
    name: 'format',
    type: '(value: number) => string',
    description: {
      en: "Formats this series' values in tooltips and labels.",
      ru: 'Форматирует значения этого ряда в подсказках и подписях.',
    },
  },
  {
    name: 'colorBy',
    type: '(datum: T, index: number) => string | undefined',
    description: {
      en: 'Colour of each bar (`index` is the index in `data`; `undefined` keeps the series colour). Shown in tooltips; the legend keeps the series colour.',
      ru: 'Цвет каждого столбца (`index` — индекс в `data`, `undefined` — цвет ряда). Виден в подсказке; в легенде — цвет ряда.',
    },
  },
];

export const BAR_OPTION_PROPS: readonly PropDef[] = [
  {
    name: 'barRadius',
    type: 'number',
    default: '4',
    description: {
      en: "Corner radius of the bar's data end, px.",
      ru: 'Радиус скругления столбца со стороны значения, px.',
    },
  },
  {
    name: 'maxBarSize',
    type: 'number',
    default: '24',
    description: { en: 'Maximum bar thickness, px.', ru: 'Максимальная толщина столбца, px.' },
  },
  {
    name: 'barGap',
    type: 'number',
    default: '2',
    description: {
      en: 'Gap between touching bars, px.',
      ru: 'Зазор между соседними столбцами одной категории, px.',
    },
  },
  {
    name: 'categoryGap',
    type: 'number',
    default: '0.3',
    description: {
      en: 'Space between categories as a fraction of the category width (0–1).',
      ru: 'Промежуток между категориями как доля ширины категории (0–1).',
    },
  },
  {
    name: 'labels',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Value labels at bar ends (on by default for horizontal bars and waterfalls).',
      ru: 'Подписи значений на концах столбцов (по умолчанию включены у горизонтальных и каскадных диаграмм).',
    },
  },
];

export const PIE_PROPS: readonly PropDef[] = [
  {
    name: 'data',
    type: 'readonly T[]',
    required: true,
    description: { en: 'One row per slice.', ru: 'Одна строка на сектор.' },
  },
  {
    name: 'labelKey',
    type: 'KeysMatching<T, string | number>',
    required: true,
    description: { en: 'Field naming each slice.', ru: 'Поле с названием сектора.' },
  },
  {
    name: 'valueKey',
    type: 'NumericKey<T>',
    required: true,
    description: { en: "Field holding each slice's value.", ru: 'Поле со значением сектора.' },
  },
  {
    name: 'colorKey',
    type: 'KeysMatching<T, string>',
    description: {
      en: 'Field with a CSS colour per slice.',
      ru: 'Поле с CSS-цветом для каждого сектора.',
    },
  },
  {
    name: 'colors',
    type: 'readonly string[]',
    description: {
      en: 'Colours by slice position (overrides the theme palette).',
      ru: 'Цвета по порядку секторов (заменяют палитру темы).',
    },
  },
  {
    name: 'sort',
    type: 'boolean',
    default: 'false',
    description: { en: 'Largest slice first.', ru: 'Самый большой сектор — первым.' },
  },
  {
    name: 'labels',
    type: "boolean | 'inside' | 'outside'",
    default: { en: "'inside' (pie), off (donut)", ru: "'inside' (круговая), выкл. (кольцевая)" },
    description: {
      en: 'Percent labels inside slices (when they fit) or outside with leader lines.',
      ru: 'Процентные подписи внутри секторов (если помещаются) или снаружи с выносными линиями.',
    },
  },
  {
    name: 'valueFormatter',
    type: '(value: number) => string',
    description: {
      en: 'Formats values in tooltips, the centre and the data table.',
      ru: 'Форматирует значения в подсказках, в центре и в таблице данных.',
    },
  },
  {
    name: 'labelFormatter',
    type: '(value: number, share: number) => string',
    description: { en: 'Formats slice labels.', ru: 'Форматирует подписи секторов.' },
  },
  {
    name: 'tooltip',
    type: 'boolean | TooltipOptions',
    default: { en: 'true (pie), false (donut)', ru: 'true (круговая), false (кольцевая)' },
    description: {
      en: 'The donut shows the hovered slice in its centre instead.',
      ru: 'Кольцевая диаграмма вместо подсказки показывает сектор под указателем в центре.',
    },
  },
  {
    name: 'legend',
    type: 'boolean | LegendOptions',
    default: 'true',
    description: {
      en: 'Legend with percentages; items toggle slices.',
      ru: 'Легенда с процентами; её элементы скрывают и показывают секторы.',
    },
  },
  {
    name: 'gap',
    type: 'number',
    default: '2',
    description: { en: 'Gap between slices, px.', ru: 'Зазор между секторами, px.' },
  },
  {
    name: 'cornerRadius',
    type: 'number',
    description: { en: 'Rounded slice corners, px.', ru: 'Радиус скругления углов секторов, px.' },
  },
  {
    name: 'startAngle',
    type: 'number',
    default: '0',
    description: {
      en: "Start angle in degrees, clockwise from 12 o'clock.",
      ru: 'Начальный угол в градусах, по часовой стрелке от отметки «12 часов».',
    },
  },
  {
    name: 'endAngle',
    type: 'number',
    default: '360',
    description: { en: 'End angle in degrees.', ru: 'Конечный угол в градусах.' },
  },
  {
    name: 'hiddenSeries',
    type: 'readonly string[]',
    description: {
      en: 'Controlled hidden slices (by label).',
      ru: 'Контролируемый список скрытых секторов (по названию).',
    },
  },
  {
    name: 'defaultHiddenSeries',
    type: 'readonly string[]',
    description: { en: 'Initially hidden slices.', ru: 'Секторы, скрытые изначально.' },
  },
  {
    name: 'onHiddenSeriesChange',
    type: '(hidden: string[]) => void',
    description: {
      en: 'Called when the legend toggles a slice.',
      ru: 'Вызывается, когда легенда скрывает или показывает сектор.',
    },
  },
  {
    name: 'activeIndex',
    type: 'number | null',
    description: {
      en: 'Controlled active slice (index into `data`).',
      ru: 'Контролируемый активный сектор (индекс в `data`).',
    },
  },
  {
    name: 'onActiveIndexChange',
    type: '(index: number | null) => void',
    description: {
      en: 'Called when the active slice changes.',
      ru: 'Вызывается при смене активного сектора.',
    },
  },
  {
    name: 'onHover',
    type: '(event: SliceEvent<T> | null) => void',
    description: {
      en: 'Hover callback with datum, index, label, value and share (0–1).',
      ru: 'Колбэк наведения: строка данных, индекс, название, значение и доля (0–1).',
    },
  },
  {
    name: 'onClick',
    type: '(event: SliceEvent<T>) => void',
    description: {
      en: 'Click (or Enter on the focused slice).',
      ru: 'Нажатие (или Enter на секторе в фокусе).',
    },
  },
];

export const baseGroup: PropGroup = {
  title: { en: 'Common props (BaseChartProps)', ru: 'Общие пропсы (BaseChartProps)' },
  note: {
    en: (
      <>
        Shared by every chart. Defaults for <code>theme</code>, <code>locale</code>,{' '}
        <code>animation</code> and <code>renderer</code> can be set once with{' '}
        <Link to="/components" section="chart-provider">
          ChartProvider
        </Link>
        .
      </>
    ),
    ru: (
      <>
        Общие для всех диаграмм. Значения по умолчанию для <code>theme</code>, <code>locale</code>,{' '}
        <code>animation</code> и <code>renderer</code> можно задать один раз через{' '}
        <Link to="/components" section="chart-provider">
          ChartProvider
        </Link>
        .
      </>
    ),
  },
  props: BASE_PROPS,
  collapsed: true,
};

export const cartesianGroup: PropGroup = {
  title: { en: 'Cartesian props', ru: 'Пропсы декартовых диаграмм' },
  note: {
    en: 'Shared by Line, Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar, Stacked Bar, Combo, Waterfall and Sparkline.',
    ru: 'Общие для Line, Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar, Stacked Bar, Combo, Waterfall и Sparkline.',
  },
  props: CARTESIAN_PROPS,
  collapsed: true,
};

export const seriesGroup: PropGroup = {
  title: { en: 'SeriesConfig', ru: 'SeriesConfig' },
  note: { en: 'Entries of the `series` prop.', ru: 'Элементы пропа `series`.' },
  props: SERIES_CONFIG_PROPS,
  collapsed: true,
};

export const barGroup: PropGroup = {
  title: { en: 'Bar options', ru: 'Параметры столбцов' },
  props: BAR_OPTION_PROPS,
};

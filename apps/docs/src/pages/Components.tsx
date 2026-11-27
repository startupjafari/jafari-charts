import { useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';
import { PropsTable, type PropDef } from '../ui/PropsTable';

const VALUE = 'number | string | Date';

const CHART_TICKS: L<string> = {
  en: "the chart's ticks",
  ru: 'деления диаграммы',
  kk: 'диаграмманың бөліктері',
};
const CHART_PLOT: L<string> = {
  en: "the chart's plot",
  ru: 'область построения диаграммы',
  kk: 'диаграмманың салу аймағы',
};
const FILL_COLOUR: L<string> = { en: 'Fill colour.', ru: 'Цвет заливки.', kk: 'Бояу түсі.' };
const EXTRA_CLASS: L<string> = {
  en: 'Extra class.',
  ru: 'Дополнительный класс.',
  kk: 'Қосымша класс.',
};
const X_PIXELS: L<string> = {
  en: 'x in chart pixels.',
  ru: 'x в пикселях диаграммы.',
  kk: 'Диаграмма пиксельдеріндегі x.',
};
const Y_PIXELS: L<string> = {
  en: 'y in chart pixels.',
  ru: 'y в пикселях диаграммы.',
  kk: 'Диаграмма пиксельдеріндегі y.',
};

const REFERENCE_LINE: PropDef[] = [
  {
    name: 'y',
    type: 'number',
    description: {
      en: 'Value on the value axis (a horizontal line in vertical charts).',
      ru: 'Значение на оси значений (в вертикальных диаграммах — горизонтальная линия).',
      kk: 'Мәндер осіндегі мән (тік диаграммаларда — көлденең сызық).',
    },
  },
  {
    name: 'x',
    type: VALUE,
    description: {
      en: 'Value on the x/category axis (a vertical line).',
      ru: 'Значение на оси X или оси категорий (вертикальная линия).',
      kk: 'X осіндегі немесе санаттар осіндегі мән (тік сызық).',
    },
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: {
      en: 'Text next to the line.',
      ru: 'Текст рядом с линией.',
      kk: 'Сызықтың жанындағы мәтін.',
    },
  },
  {
    name: 'labelPosition',
    type: "'start' | 'end'",
    default: "'end'",
    description: {
      en: 'Label placement along a horizontal line.',
      ru: 'Положение подписи вдоль горизонтальной линии.',
      kk: 'Көлденең сызық бойындағы жазудың орны.',
    },
  },
  {
    name: 'color',
    type: 'string',
    default: 'var(--jc-text-muted)',
    description: { en: 'Line colour.', ru: 'Цвет линии.', kk: 'Сызық түсі.' },
  },
  {
    name: 'dashed',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Dashed (default) or solid.',
      ru: 'Пунктирная (по умолчанию) или сплошная линия.',
      kk: 'Үзік (әдепкі) немесе тұтас сызық.',
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
      kk: 'X осіндегі немесе санаттар осіндегі басы (әдепкі — салу аймағының шеті).',
    },
  },
  {
    name: 'x2',
    type: VALUE,
    description: {
      en: 'End on the x/category axis.',
      ru: 'Конец на оси X или оси категорий.',
      kk: 'X осіндегі немесе санаттар осіндегі соңы.',
    },
  },
  {
    name: 'y1',
    type: 'number',
    description: {
      en: 'Start on the value axis.',
      ru: 'Начало на оси значений.',
      kk: 'Мәндер осіндегі басы.',
    },
  },
  {
    name: 'y2',
    type: 'number',
    description: {
      en: 'End on the value axis.',
      ru: 'Конец на оси значений.',
      kk: 'Мәндер осіндегі соңы.',
    },
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: {
      en: 'Text in the top-left corner.',
      ru: 'Текст в левом верхнем углу.',
      kk: 'Жоғарғы сол жақ бұрыштағы мәтін.',
    },
  },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: FILL_COLOUR },
  {
    name: 'opacity',
    type: 'number',
    default: '0.05',
    description: {
      en: 'Fill opacity.',
      ru: 'Непрозрачность заливки.',
      kk: 'Бояудың мөлдірсіздігі.',
    },
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
      kk: 'X осіндегі немесе санаттар осіндегі орны.',
    },
  },
  {
    name: 'y',
    type: 'number',
    required: true,
    description: {
      en: 'Position on the value axis.',
      ru: 'Положение на оси значений.',
      kk: 'Мәндер осіндегі орны.',
    },
  },
  {
    name: 'r',
    type: 'number',
    default: '5',
    description: { en: 'Radius, px.', ru: 'Радиус, px.', kk: 'Радиусы, px.' },
  },
  { name: 'color', type: 'string', default: 'var(--jc-text)', description: FILL_COLOUR },
  {
    name: 'label',
    type: 'ReactNode',
    description: {
      en: 'Text above-right of the dot.',
      ru: 'Текст сверху справа от точки.',
      kk: 'Нүктенің жоғарғы оң жағындағы мәтін.',
    },
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
      kk: 'Байлау нүктесінің диаграмма пиксельдеріндегі x координатасы.',
    },
  },
  {
    name: 'y',
    type: 'number',
    required: true,
    description: {
      en: 'Anchor y in chart pixels.',
      ru: 'Координата y точки привязки в пикселях диаграммы.',
      kk: 'Байлау нүктесінің диаграмма пиксельдеріндегі y координатасы.',
    },
  },
  {
    name: 'dx',
    type: 'number',
    default: '12',
    description: {
      en: 'Horizontal offset of the note.',
      ru: 'Смещение заметки по горизонтали.',
      kk: 'Ескертпенің көлденең ығысуы.',
    },
  },
  {
    name: 'dy',
    type: 'number',
    default: '-18',
    description: {
      en: 'Vertical offset of the note.',
      ru: 'Смещение заметки по вертикали.',
      kk: 'Ескертпенің тік ығысуы.',
    },
  },
  {
    name: 'connector',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Leader line from the point to the note.',
      ru: 'Выносная линия от точки к заметке.',
      kk: 'Нүктеден ескертпеге дейінгі сілтеме сызығы.',
    },
  },
  {
    name: 'children',
    type: 'ReactNode',
    required: true,
    description: { en: 'Note text.', ru: 'Текст заметки.', kk: 'Ескертпе мәтіні.' },
  },
];

const LABEL: PropDef[] = [
  { name: 'x', type: 'number', required: true, description: X_PIXELS },
  { name: 'y', type: 'number', required: true, description: Y_PIXELS },
  {
    name: 'children',
    type: 'ReactNode',
    required: true,
    description: { en: 'Text.', ru: 'Текст.', kk: 'Мәтін.' },
  },
  {
    name: 'anchor',
    type: "'start' | 'middle' | 'end'",
    default: "'middle'",
    description: {
      en: 'Text anchor.',
      ru: 'Выравнивание текста относительно точки привязки.',
      kk: 'Мәтінді байлау нүктесіне қатысты туралау.',
    },
  },
  {
    name: 'tone',
    type: "'primary' | 'secondary' | 'muted' | 'inverse'",
    default: "'secondary'",
    description: {
      en: 'Text colour token — never the series colour, for contrast.',
      ru: 'Токен цвета текста — ради контраста это никогда не цвет ряда.',
      kk: 'Мәтін түсінің токені — контраст үшін ол ешқашан қатар түсі болмайды.',
    },
  },
  {
    name: 'fontSize',
    type: 'number',
    description: {
      en: 'Font size, px (default: --jc-font-size).',
      ru: 'Размер шрифта, px (по умолчанию — --jc-font-size).',
      kk: 'Қаріп өлшемі, px (әдепкі — --jc-font-size).',
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
    description: { en: 'Symbol shape.', ru: 'Форма символа.', kk: 'Таңба пішіні.' },
  },
  {
    name: 'size',
    type: 'number',
    default: '8',
    description: { en: 'Symbol size, px.', ru: 'Размер символа, px.', kk: 'Таңба өлшемі, px.' },
  },
  { name: 'color', type: 'string', required: true, description: FILL_COLOUR },
  {
    name: 'ring',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Surface-coloured ring so the marker stays legible over lines.',
      ru: 'Кольцо цвета фона, чтобы маркер оставался различимым поверх линий.',
      kk: 'Маркер сызықтардың үстінде де анық көрінуі үшін фон түстес сақина.',
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
      kk: 'Градиент id-і; оған `fill="url(#id)"` түрінде сілтеме жасаңыз. Құжат ішінде бірегей болуы керек.',
    },
  },
  {
    name: 'color',
    type: 'string',
    required: true,
    description: {
      en: 'Gradient colour (CSS variables work).',
      ru: 'Цвет градиента (CSS-переменные тоже подходят).',
      kk: 'Градиент түсі (CSS айнымалылары да жарайды).',
    },
  },
  {
    name: 'from',
    type: 'number',
    default: '0.24',
    description: {
      en: 'Opacity at the start (top/left).',
      ru: 'Непрозрачность в начале (сверху или слева).',
      kk: 'Басындағы мөлдірсіздік (жоғарыда немесе сол жақта).',
    },
  },
  {
    name: 'to',
    type: 'number',
    default: '0',
    description: {
      en: 'Opacity at the end (bottom/right).',
      ru: 'Непрозрачность в конце (снизу или справа).',
      kk: 'Соңындағы мөлдірсіздік (төменде немесе оң жақта).',
    },
  },
  {
    name: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: {
      en: 'Gradient direction.',
      ru: 'Направление градиента.',
      kk: 'Градиент бағыты.',
    },
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
      kk: 'Салу аймағының жағы (тек ChartAxis үшін; XAxis әдепкі бойынша төменде, YAxis — сол жақта).',
    },
  },
  {
    name: 'ticks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: {
      en: '`{ value, position, label, anchor, lines? }` — required outside a chart. `lines` — the lines of a multi-line label.',
      ru: '`{ value, position, label, anchor, lines? }` — обязателен вне диаграммы. `lines` — строки многострочной подписи.',
      kk: '`{ value, position, label, anchor, lines? }` — диаграммадан тыс міндетті. `lines` — көп жолды жазудың жолдары.',
    },
  },
  {
    name: 'plot',
    type: 'Rect',
    default: CHART_PLOT,
    description: {
      en: '`{ x, y, width, height }` — required outside a chart.',
      ru: '`{ x, y, width, height }` — обязателен вне диаграммы.',
      kk: '`{ x, y, width, height }` — диаграммадан тыс міндетті.',
    },
  },
  {
    name: 'line',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Draw the axis baseline.',
      ru: 'Рисовать базовую линию оси.',
      kk: 'Остің негізгі сызығын салу.',
    },
  },
  {
    name: 'tickPadding',
    type: 'number',
    default: '8',
    description: {
      en: 'Distance between labels and the plot, px.',
      ru: 'Расстояние между подписями и областью построения, px.',
      kk: 'Жазулар мен салу аймағы арасындағы қашықтық, px.',
    },
  },
  {
    name: 'title',
    type: 'string',
    description: { en: 'Axis title.', ru: 'Заголовок оси.', kk: 'Ось атауы.' },
  },
  { name: 'className', type: 'string', description: EXTRA_CLASS },
];

const GRID: PropDef[] = [
  {
    name: 'horizontal',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Lines at y ticks.',
      ru: 'Линии на делениях по Y.',
      kk: 'Y осі бөліктеріндегі сызықтар.',
    },
  },
  {
    name: 'vertical',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Lines at x ticks.',
      ru: 'Линии на делениях по X.',
      kk: 'X осі бөліктеріндегі сызықтар.',
    },
  },
  {
    name: 'xTicks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: {
      en: 'Ticks for vertical lines.',
      ru: 'Деления для вертикальных линий.',
      kk: 'Тік сызықтарға арналған бөліктер.',
    },
  },
  {
    name: 'yTicks',
    type: 'readonly AxisTick[]',
    default: CHART_TICKS,
    description: {
      en: 'Ticks for horizontal lines.',
      ru: 'Деления для горизонтальных линий.',
      kk: 'Көлденең сызықтарға арналған бөліктер.',
    },
  },
  {
    name: 'plot',
    type: 'Rect',
    default: CHART_PLOT,
    description: {
      en: 'Plot rectangle.',
      ru: 'Прямоугольник области построения.',
      kk: 'Салу аймағының тіктөртбұрышы.',
    },
  },
  {
    name: 'zeroLine',
    type: 'number | null',
    description: {
      en: 'Pixel y of an emphasised zero line.',
      ru: 'Координата y (в пикселях) выделенной нулевой линии.',
      kk: 'Ерекшеленген нөл сызығының y координатасы (пиксельмен).',
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
      kk: '`shared` — X бойынша белсенді нүктедегі барлық қатар; `item` — тек меңзер астындағы қатар.',
    },
  },
  {
    name: 'render',
    type: '(data: TooltipData, active: ActiveItem) => ReactNode',
    description: {
      en: 'Custom content. `data` has `title`, formatted `rows` and an optional `footer`.',
      ru: 'Собственное содержимое. В `data` есть `title`, отформатированные `rows` и необязательный `footer`.',
      kk: 'Өз мазмұныңыз. `data` ішінде `title`, пішімделген `rows` және міндетті емес `footer` бар.',
    },
  },
  {
    name: 'sort',
    type: "'none' | 'asc' | 'desc'",
    default: "'none'",
    description: { en: 'Row order.', ru: 'Порядок строк.', kk: 'Жолдар реті.' },
  },
  {
    name: 'hideEmpty',
    type: 'boolean',
    default: 'false',
    description: {
      en: 'Hide rows without a value.',
      ru: 'Скрывать строки без значения.',
      kk: 'Мәні жоқ жолдарды жасыру.',
    },
  },
  {
    name: 'offset',
    type: 'number',
    default: '14',
    description: {
      en: 'Distance from the anchor, px.',
      ru: 'Расстояние от точки привязки, px.',
      kk: 'Байлау нүктесінен қашықтық, px.',
    },
  },
];

const LEGEND: PropDef[] = [
  {
    name: 'position',
    type: "'top' | 'bottom'",
    default: "'bottom'",
    description: {
      en: 'Above or below the plot.',
      ru: 'Над областью построения или под ней.',
      kk: 'Салу аймағының үстінде немесе астында.',
    },
  },
  {
    name: 'align',
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: {
      en: 'Horizontal alignment.',
      ru: 'Выравнивание по горизонтали.',
      kk: 'Көлденең туралау.',
    },
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Clicking an item toggles the series (the last visible one stays on).',
      ru: 'Нажатие на элемент скрывает или показывает ряд (последний видимый ряд скрыть нельзя).',
      kk: 'Элементті басу қатарды жасырады немесе көрсетеді (соңғы көрінетін қатарды жасыруға болмайды).',
    },
  },
  {
    name: 'render',
    type: '(items: SeriesInfo[], toggle: (id: string) => void) => ReactNode',
    description: {
      en: 'Custom legend. Items carry `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value`.',
      ru: 'Собственная легенда. Элементы содержат `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value`.',
      kk: 'Өз шартты белгілеріңіз. Элементтерде `id`, `label`, `color`, `kind`, `symbol`, `visible`, `value` бар.',
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
      kk: 'Меңзер деңгейінде көлденең сызықты да салу.',
    },
  },
  {
    name: 'vertical',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Draw the vertical line (ChartCrosshair primitive only).',
      ru: 'Рисовать вертикальную линию (только для примитива ChartCrosshair).',
      kk: 'Тік сызықты салу (тек ChartCrosshair примитиві үшін).',
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
      kk: 'Ішкі диаграммалардың барлығына арналған әдепкі локаль.',
    },
  },
  {
    name: 'theme',
    type: "'auto' | 'light' | 'dark' | Theme",
    description: { en: 'Default theme.', ru: 'Тема по умолчанию.', kk: 'Әдепкі тақырып.' },
  },
  {
    name: 'animation',
    type: 'boolean | AnimationOptions',
    description: {
      en: '`{ duration, easing, initial, maxComplexity }`; easing names: linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
      ru: '`{ duration, easing, initial, maxComplexity }`; функции плавности (easing): linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
      kk: '`{ duration, easing, initial, maxComplexity }`; easing функциялары: linear, quadOut, cubicOut, cubicInOut, expoOut, backOut.',
    },
  },
  {
    name: 'renderer',
    type: "'svg' | 'canvas' | 'auto'",
    description: { en: 'Default renderer.', ru: 'Рендерер по умолчанию.', kk: 'Әдепкі рендерер.' },
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: {
      en: 'Text overrides, merged with parent providers.',
      ru: 'Переопределения текстов; объединяются с переопределениями родительских провайдеров.',
      kk: 'Мәтіндерді қайта анықтау; сыртқы провайдерлердің мәндерімен біріктіріледі.',
    },
  },
  {
    name: 'injectStyles',
    type: 'boolean',
    default: 'true',
    description: {
      en: 'Inject the stylesheet automatically. Disable when importing `@startupjafari/charts/styles.css`.',
      ru: 'Автоматически внедрять таблицу стилей. Отключите, если импортируете `@startupjafari/charts/styles.css`.',
      kk: 'Стильдер кестесін автоматты түрде енгізу. `@startupjafari/charts/styles.css` импорттасаңыз, өшіріңіз.',
    },
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: { en: 'Your app.', ru: 'Ваше приложение.', kk: 'Сіздің қолданбаңыз.' },
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
      kk: 'Деректер болса, алдыңғы рендерингті күңгірттейді. Деректер болмаса — статикалық толтырғыш.',
    },
  },
  {
    name: 'error',
    type: 'boolean | ReactNode',
    description: {
      en: '`true` for the default message, or your own node.',
      ru: '`true` — стандартное сообщение; можно передать и собственный React-узел.',
      kk: '`true` — әдепкі хабарлама; өз React түйініңізді де беруге болады.',
    },
  },
  {
    name: 'onRetry',
    type: '() => void',
    description: {
      en: 'Adds a retry button to the error state.',
      ru: 'Добавляет в состояние ошибки кнопку «Повторить».',
      kk: 'Қате күйіне «Қайталау» түймесін қосады.',
    },
  },
  {
    name: 'emptyMessage',
    type: 'ReactNode',
    default: { en: "'No data'", ru: "'Нет данных' (для ru)", kk: "'Деректер жоқ' (kk үшін)" },
    description: {
      en: 'Text of the empty state.',
      ru: 'Текст состояния «нет данных».',
      kk: '«Деректер жоқ» күйінің мәтіні.',
    },
  },
  {
    name: 'messages',
    type: 'Partial<ChartMessages>',
    description: {
      en: 'noData, loading, error, retry, resetZoom and more.',
      ru: 'noData, loading, error, retry, resetZoom и другие.',
      kk: 'noData, loading, error, retry, resetZoom және басқалары.',
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
  kk: {
    lead: 'Диаграммалар примитивтерден құралады. Олардың көбі автоматты түрде салынады, ал төменде сипатталғандарын кез келген декарттық диаграмманың ішіне орналастыруға, диаграмма пропстары арқылы баптауға немесе бөлек пайдалануға болады.',
    toc: {
      reference: 'Тірек сызықтар, аймақтар, нүктелер',
      annotations: 'Аннотациялар, жазулар, маркерлер',
      gradient: 'Градиенттер',
      axes: 'Осьтер мен тор',
      tooltip: 'Қалқымалы кеңес',
      legend: 'Шартты белгілер',
      crosshair: 'Айқас сызық және курсор',
      states: 'Күйлер',
      'chart-provider': 'ChartProvider',
    },
    reference: {
      title: 'Тірек сызықтар, аймақтар және нүктелер',
      body: (
        <p>
          <code>ChartReferenceLine</code>, <code>ChartReferenceArea</code> және{' '}
          <code>ChartReferenceDot</code> <em>деректер мәндерін</em> қабылдайды және кез келген
          орналасуда диаграмма шкалаларын пайдаланады (<code>y</code> әрқашан мәндер осін
          білдіреді). Оларды декарттық диаграмманың еншілес элементтері ретінде орналастырыңыз.
        </p>
      ),
    },
    annotations: {
      title: 'Аннотациялар, жазулар және маркерлер',
      body: (
        <p>
          <code>ChartAnnotation</code>, <code>ChartLabel</code> және <code>ChartMarker</code>{' '}
          диаграмманың <em>пиксельдерімен</em> жұмыс істейді. Диаграмма ішінде{' '}
          <code>useChart()</code> шкалаларды (<code>frame.x</code>, <code>frame.y</code>), салу
          аймағының тіктөртбұрышын, өзара әрекеттесу қоймасын және қатарларды қайтарады, сондықтан
          шағын компонент деректерді пиксельге айналдыра алады — өз примитивтеріңіз осылай жасалады.
        </p>
      ),
      example: 'useChart() негізіндегі өз примитивіңіз',
    },
    gradient: {
      title: 'Градиенттер',
      body: (
        <p>
          <code>ChartGradient</code> өз белгілеріңізге арналған <code>&lt;linearGradient&gt;</code>{' '}
          анықтамасын жасайды. Екі диаграммада бірдей id болмауы үшін id-ді <code>useId</code>{' '}
          арқылы жасаңыз.
        </p>
      ),
    },
    axes: {
      title: 'Осьтер мен тор',
      body: (
        <p>
          Диаграммалар осьтер мен торды өздері салады — оларды <code>xAxis</code>,{' '}
          <code>yAxis</code>, <code>y2Axis</code> және <code>grid</code> пропстарымен баптаңыз (кез
          келген{' '}
          <Link to="/charts/line-chart" section="props">
            декарттық диаграмманы
          </Link>{' '}
          қараңыз). <code>XAxis</code>, <code>YAxis</code>, <code>ChartAxis</code> және{' '}
          <code>ChartGrid</code> — олардың негізіндегі примитивтер; диаграммадан тыс оларға{' '}
          <code>ticks</code> пен <code>plot</code> мәндерін анық беру керек.
        </p>
      ),
      example: 'Диаграммадан тыс примитивтер',
    },
    tooltip: {
      title: 'Қалқымалы кеңес',
      body: (
        <p>
          HTML қалқымалы кеңес (tooltip) тек белсенді элемент ауысқанда қайта рендерленеді;
          меңзердің соңынан ол стильдерді тікелей жаңарту арқылы жүреді, сондықтан тінтуірдің
          қозғалысы React рендерингін ешқашан іске қоспайды. Ол <code>tooltip</code> пропымен
          бапталады (<code>false</code> оны жасырады). Қалқымалы кеңес — деректерге жетудің жалғыз
          жолы емес, тек ыңғайлылық: әр мән деректер кестесінде де, пернетақтамен шарлағанда
          берілетін хабарландыруларда да бар.
        </p>
      ),
      example: 'Қалқымалы кеңестің өз мазмұны',
    },
    legend: {
      title: 'Шартты белгілер',
      body: (
        <p>
          Шартты белгілер екі не одан көп қатар болғанда пайда болады және тар экрандарда бірнеше
          жолға тасымалданады. Олардың элементтері — <code>aria-pressed</code> бар түймелер;
          элементке меңзерді апарғанда немесе фокус бергенде сәйкес қатар ерекшеленеді.
        </p>
      ),
      example: 'Өз шартты белгілеріңіз',
    },
    crosshair: {
      title: 'Айқас сызық және курсор',
      body: (
        <p>
          <code>ChartCrosshair</code> — X бойынша белсенді нүктеге тартылатын жіңішке сызық;{' '}
          <code>ChartCursor</code> — бағаналы диаграммалардағы белсенді санаттың артындағы бозғылт
          жолақ. Екеуі де автоматты түрде салынады және <code>crosshair</code> пропымен басқарылады.
        </p>
      ),
      example: 'Айқас сызық және курсор',
    },
    states: {
      title: 'Күйлер',
      body: (
        <p>
          «Деректер жоқ», жүктелу және қате күйлері диаграмманың өлшемін сақтайды. Жүктелу кезінде
          деректер бұрыннан болса, алдыңғы рендеринг күңгірттеліп көрініп тұрады — скелетон
          жыпылықтамайды. Күй компоненттері (<code>ChartEmptyState</code>,{' '}
          <code>ChartLoadingState</code>, <code>ChartErrorState</code>) өз диаграммаларыңыз үшін
          экспортталады.
        </p>
      ),
      example: 'Барлық күйлер',
      caption: 'Күй пропстары (барлық диаграммада)',
    },
    provider: {
      body: (
        <p>
          Ішіндегі барлық диаграммаға әдепкі мәндерді орнатады. Провайдерлерді бір-біріне салуға
          болады: ішкісі сыртқысын қайта анықтайды, ал <code>messages</code> біріктіріледі.
        </p>
      ),
      example: 'Фирмалық тақырып, локаль және анимация',
      calloutTitle: 'Конфигурацияны оқу',
      calloutBody: (
        <>
          <code>useChartConfig()</code> провайдерлердің біріктірілген конфигурациясын қайтарады — өз
          компонентіңіз сол локальді пайдалануы керек болғанда пайдалы.
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
          code={`import { formatNumber, useChartConfig } from '@startupjafari/charts';

function Total({ value }: { value: number }) {
  const { locale = 'en' } = useChartConfig();
  return <strong>{formatNumber(value, { locale })}</strong>;
}`}
        />
      </Section>
    </article>
  );
}

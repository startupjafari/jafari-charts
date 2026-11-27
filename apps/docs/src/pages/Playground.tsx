import { formatNumber, type CurveType, type Renderer, type ThemeMode } from '@startupjafari/charts';
import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLang, useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import {
  BASE_COLORS,
  DEFAULT_CONFIG,
  DEMO_TEXT,
  effectiveSeries,
  generateCode,
  kindInfo,
  KINDS,
  makeData,
  PALETTES,
  type ChartKind,
  type KindInfo,
  type PaletteName,
  type PlaygroundConfig,
} from '../playground/model';
import { Preview } from '../playground/Preview';
import { useHoverFps, useRenderMetrics } from '../playground/useMetrics';
import { Callout, PageHeader } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/segmented-tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ToggleSwitch } from '../ui/toggle-switch';

const CURVES: CurveType[] = ['monotone', 'linear', 'step', 'stepBefore', 'stepAfter'];
const PALETTE_NAMES: readonly PaletteName[] = ['default', 'ocean', 'sunset', 'forest', 'custom'];

interface PlaygroundText {
  lead: string;
  form: string;
  chartType: string;
  kindLabel: (info: KindInfo) => string;
  dataPoints: string;
  rings: string;
  categories: string;
  downsampleHint: string;
  scatterHint: string;
  value: (v: number) => string;
  series: string;
  colours: string;
  palettes: Record<PaletteName, string>;
  seriesColours: string;
  colour: (n: number) => string;
  themePaletteHint: string;
  theme: string;
  auto: string;
  light: string;
  dark: string;
  renderer: string;
  fillWidth: string;
  width: (px: number) => string;
  height: (px: number) => string;
  animation: string;
  tooltip: string;
  legend: string;
  zoom: string;
  tooltipMode: string;
  shared: string;
  item: string;
  legendPosition: string;
  bottom: string;
  top: string;
  curve: string;
  reset: string;
  preview: string;
  metricsTitle: string;
  renderPaint: string;
  changeToMeasure: string;
  afterLastChange: string;
  domNodes: string;
  insideChart: string;
  hoverFps: string;
  measuring: (worst: string) => string;
  movePointer: string;
  lastHover: (worst: string) => string;
  chosenByAuto: string;
  asConfigured: string;
  ms: string;
  measuredNote: (dev: boolean) => ReactNode;
  code: string;
  dataNote: ReactNode;
}

const RU_KINDS: Record<ChartKind, string> = {
  line: 'Линейная',
  area: 'С областями',
  'stacked-area': 'С областями и накоплением',
  bar: 'Столбчатая',
  'grouped-bar': 'Сгруппированная столбчатая',
  'stacked-bar': 'Столбчатая с накоплением',
  'horizontal-bar': 'Горизонтальная столбчатая',
  combo: 'Комбинированная',
  sparkline: 'Спарклайн',
  pie: 'Круговая',
  donut: 'Кольцевая',
  radial: 'Радиальный прогресс',
  gauge: 'Шкала-индикатор',
  scatter: 'Точечная',
};

const KK_KINDS: Record<ChartKind, string> = {
  line: 'Сызықтық',
  area: 'Аймақтық',
  'stacked-area': 'Жинақталған аймақтық',
  bar: 'Бағаналы',
  'grouped-bar': 'Топтастырылған бағаналы',
  'stacked-bar': 'Жинақталған бағаналы',
  'horizontal-bar': 'Көлденең бағаналы',
  combo: 'Аралас',
  sparkline: 'Шағын график',
  pie: 'Дөңгелек',
  donut: 'Сақиналы',
  radial: 'Сақиналы прогресс',
  gauge: 'Шкала көрсеткіші',
  scatter: 'Нүктелік',
};

const TEXT: L<PlaygroundText> = {
  en: {
    lead: 'Configure a chart, watch it update, copy the code — and see how fast it renders on your device.',
    form: 'Chart configuration',
    chartType: 'Chart type',
    kindLabel: (k) => `${k.label} (${k.component})`,
    dataPoints: 'Data points',
    rings: 'Rings',
    categories: 'Categories',
    downsampleHint: 'Lines and areas are downsampled to about 2 points per pixel.',
    scatterHint: 'renderer="auto" switches scatter plots to Canvas above 75 000 points.',
    value: (v) => `Value: ${v}`,
    series: 'Series',
    colours: 'Colours',
    palettes: {
      default: 'Theme',
      ocean: 'Ocean',
      sunset: 'Sunset',
      forest: 'Forest',
      custom: 'Custom',
    },
    seriesColours: 'Series colours',
    colour: (n) => `Colour ${n}`,
    themePaletteHint: 'Theme palette (adapts to dark mode)',
    theme: 'Theme',
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark',
    renderer: 'Renderer',
    fillWidth: 'Fill container width',
    width: (px) => `Width: ${px} px`,
    height: (px) => `Height: ${px} px`,
    animation: 'Animation',
    tooltip: 'Tooltip',
    legend: 'Legend',
    zoom: 'Zoom & pan (Ctrl/⌘ + wheel, drag)',
    tooltipMode: 'Tooltip mode',
    shared: 'Shared',
    item: 'Item',
    legendPosition: 'Legend position',
    bottom: 'Bottom',
    top: 'Top',
    curve: 'Curve',
    reset: 'Reset',
    preview: 'Preview',
    metricsTitle: 'Performance in your browser',
    renderPaint: 'Render + paint',
    changeToMeasure: 'change any option to measure',
    afterLastChange: 'after the last change',
    domNodes: 'DOM nodes',
    insideChart: 'inside the chart',
    hoverFps: 'Hover FPS',
    measuring: (worst) => `measuring · longest frame ${worst}`,
    movePointer: 'move the pointer over the chart',
    lastHover: (worst) => `last hover · longest frame ${worst}`,
    chosenByAuto: 'chosen by renderer="auto"',
    asConfigured: 'as configured',
    ms: 'ms',
    measuredNote: (dev) => (
      <>
        Measured live with <code>performance.now()</code> and <code>requestAnimationFrame</code> in{' '}
        <strong>your</strong> browser, on this device,
        {dev ? ' in a development build (slower than production),' : ''} including generating the
        demo data. Numbers vary with hardware, browser, extensions and other tabs; FPS is capped by
        your display’s refresh rate. See <Link to="/performance">Performance</Link> for the
        controlled benchmark.
      </>
    ),
    code: 'Code',
    dataNote: (
      <>
        Data is generated deterministically by the formula in the code, so the copied code renders
        exactly this chart. Replace <code>data</code> with your own rows; keys are type-checked.
      </>
    ),
  },
  ru: {
    lead: 'Настройте диаграмму, посмотрите, как она обновляется, скопируйте код — и узнайте, как быстро она отрисовывается на вашем устройстве.',
    form: 'Настройки диаграммы',
    chartType: 'Тип диаграммы',
    kindLabel: (k) => `${RU_KINDS[k.kind]} (${k.component})`,
    dataPoints: 'Точки данных',
    rings: 'Кольца',
    categories: 'Категории',
    downsampleHint: 'Линии и области прореживаются примерно до 2 точек на пиксель.',
    scatterHint:
      'renderer="auto" переводит точечные диаграммы на Canvas, если точек больше 75 000.',
    value: (v) => `Значение: ${v}`,
    series: 'Ряды',
    colours: 'Цвета',
    palettes: {
      default: 'Тема',
      ocean: 'Океан',
      sunset: 'Закат',
      forest: 'Лес',
      custom: 'Свои',
    },
    seriesColours: 'Цвета рядов',
    colour: (n) => `Цвет ${n}`,
    themePaletteHint: 'Палитра темы (подстраивается под тёмный режим)',
    theme: 'Тема',
    auto: 'Авто',
    light: 'Светлая',
    dark: 'Тёмная',
    renderer: 'Рендерер',
    fillWidth: 'На всю ширину контейнера',
    width: (px) => `Ширина: ${px} px`,
    height: (px) => `Высота: ${px} px`,
    animation: 'Анимация',
    tooltip: 'Подсказка',
    legend: 'Легенда',
    zoom: 'Масштабирование и панорамирование (Ctrl/⌘ + колесо, перетаскивание)',
    tooltipMode: 'Режим подсказки',
    shared: 'Общая',
    item: 'Элемент',
    legendPosition: 'Положение легенды',
    bottom: 'Снизу',
    top: 'Сверху',
    curve: 'Кривая',
    reset: 'Сбросить',
    preview: 'Превью',
    metricsTitle: 'Производительность в вашем браузере',
    renderPaint: 'Рендер и отрисовка',
    changeToMeasure: 'измените любой параметр, чтобы измерить',
    afterLastChange: 'после последнего изменения',
    domNodes: 'DOM-узлы',
    insideChart: 'внутри диаграммы',
    hoverFps: 'FPS при наведении',
    measuring: (worst) => `идёт замер · самый долгий кадр ${worst}`,
    movePointer: 'наведите указатель на диаграмму',
    lastHover: (worst) => `последнее наведение · самый долгий кадр ${worst}`,
    chosenByAuto: 'выбран через renderer="auto"',
    asConfigured: 'как настроено',
    ms: 'мс',
    measuredNote: (dev) => (
      <>
        Измеряется в реальном времени через <code>performance.now()</code> и{' '}
        <code>requestAnimationFrame</code> в <strong>вашем</strong> браузере, на этом устройстве
        {dev ? ', в сборке для разработки (она медленнее продакшен-сборки)' : ''}, включая генерацию
        демонстрационных данных. Результаты зависят от железа, браузера, расширений и других
        вкладок; FPS ограничен частотой обновления дисплея. Контролируемый бенчмарк — на странице{' '}
        <Link to="/performance">Производительность</Link>.
      </>
    ),
    code: 'Код',
    dataNote: (
      <>
        Данные генерируются детерминированно по формуле из кода, поэтому скопированный код отрисует
        ровно эту диаграмму. Замените <code>data</code> своими строками — ключи проверяются по
        типам. На русской версии сайта превью использует русскую локаль, поэтому код содержит{' '}
        <code>locale="ru"</code>.
      </>
    ),
  },
  kk: {
    lead: 'Диаграмманы баптаңыз, оның қалай жаңаратынын көріңіз, кодты көшіріңіз — және құрылғыңызда қаншалықты жылдам рендерленетінін біліңіз.',
    form: 'Диаграмма баптаулары',
    chartType: 'Диаграмма түрі',
    kindLabel: (k) => `${KK_KINDS[k.kind]} (${k.component})`,
    dataPoints: 'Деректер нүктелері',
    rings: 'Сақиналар',
    categories: 'Санаттар',
    downsampleHint: 'Сызықтар мен аймақтар пиксельге шамамен 2 нүктеге дейін сиретіледі.',
    scatterHint:
      'Нүктелер саны 75 000-нан асқанда renderer="auto" нүктелік диаграмманы Canvas-қа ауыстырады.',
    value: (v) => `Мәні: ${v}`,
    series: 'Қатарлар',
    colours: 'Түстер',
    palettes: {
      default: 'Тақырып',
      ocean: 'Мұхит',
      sunset: 'Күн батуы',
      forest: 'Орман',
      custom: 'Өз түстеріңіз',
    },
    seriesColours: 'Қатарлардың түстері',
    colour: (n) => `${n}-түс`,
    themePaletteHint: 'Тақырып палитрасы (күңгірт режимге бейімделеді)',
    theme: 'Тақырып',
    auto: 'Авто',
    light: 'Ашық',
    dark: 'Күңгірт',
    renderer: 'Рендерер',
    fillWidth: 'Контейнер енін толтыру',
    width: (px) => `Ені: ${px} px`,
    height: (px) => `Биіктігі: ${px} px`,
    animation: 'Анимация',
    tooltip: 'Қалқымалы кеңес',
    legend: 'Шартты белгілер',
    zoom: 'Масштабтау және жылжыту (Ctrl/⌘ + дөңгелек, сүйреу)',
    tooltipMode: 'Қалқымалы кеңес режимі',
    shared: 'Ортақ',
    item: 'Элемент',
    legendPosition: 'Шартты белгілердің орны',
    bottom: 'Төменде',
    top: 'Жоғарыда',
    curve: 'Қисық',
    reset: 'Қалпына келтіру',
    preview: 'Алдын ала көру',
    metricsTitle: 'Браузеріңіздегі өнімділік',
    renderPaint: 'Рендеринг және салу',
    changeToMeasure: 'өлшеу үшін кез келген параметрді өзгертіңіз',
    afterLastChange: 'соңғы өзгерістен кейін',
    domNodes: 'DOM түйіндері',
    insideChart: 'диаграмма ішінде',
    hoverFps: 'Меңзерді апарғандағы FPS',
    measuring: (worst) => `өлшенуде · ең ұзақ кадр ${worst}`,
    movePointer: 'меңзерді диаграммаға апарыңыз',
    lastHover: (worst) => `соңғы апару · ең ұзақ кадр ${worst}`,
    chosenByAuto: 'renderer="auto" арқылы таңдалған',
    asConfigured: 'баптау бойынша',
    ms: 'мс',
    measuredNote: (dev) => (
      <>
        <strong>Сіздің</strong> браузеріңізде, осы құрылғыда <code>performance.now()</code> және{' '}
        <code>requestAnimationFrame</code> арқылы нақты уақытта өлшенеді
        {dev ? ' (әзірлеуге арналған жинақта — ол продакшен жинағынан баяу)' : ''}, демо деректерді
        жасау уақыты да кіреді. Нәтижелер құрылғыға, браузерге, кеңейтімдерге және басқа
        қойындыларға байланысты; FPS дисплейдің жаңару жиілігімен шектеледі. Бақыланатын жағдайда
        жүргізілген бенчмарк — <Link to="/performance">Өнімділік</Link> бетінде.
      </>
    ),
    code: 'Код',
    dataNote: (
      <>
        Деректер кодтағы формула бойынша детерминирленген түрде жасалады, сондықтан көшірілген код
        дәл осы диаграмманы салады. <code>data</code> орнына өз жолдарыңызды қойыңыз — кілттер
        типтер бойынша тексеріледі. Сайттың қазақша нұсқасында алдын ала көру қазақ локалін
        пайдаланады, сондықтан кодта <code>locale="kk"</code> бар.
      </>
    ),
  },
};

/** A labelled field: StudentHub's `Label` over the control, an optional hint under it. */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

/** A single choice from a few options: StudentHub's SegmentedTabs named by a visible label. */
function Choice<V extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: readonly SegmentedTabItem<V>[];
  value: V;
  onChange: (value: V) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <Label id={id}>{label}</Label>
      <SegmentedTabs aria-labelledby={id} items={items} value={value} onChange={onChange} stretch />
    </div>
  );
}

/** A select over a fixed list: StudentHub's Select with a visible label. */
function SelectField<V extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: V;
  onChange: (value: V) => void;
  options: readonly { value: V; label: string }[];
}) {
  return (
    <Field label={label} {...(hint ? { hint } : {})}>
      {(id) => (
        <Select value={value} onValueChange={(next) => onChange(next as V)}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}

/** An option that applies at once: a settings row with StudentHub's ToggleSwitch. */
function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <Label htmlFor={id} className="leading-snug font-normal">
        {label}
      </Label>
      <ToggleSwitch id={id} checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {note ? <span className="metric-note">{note}</span> : null}
    </div>
  );
}

export function Playground() {
  const lang = useLang();
  const ui = useT();
  const t = useText(TEXT);
  const fmtMs = (v: number | null) =>
    v === null
      ? '—'
      : `${formatNumber(v, { locale: lang, maximumFractionDigits: v < 10 ? 1 : 0 })} ${t.ms}`;
  const [config, setConfigState] = useState<PlaygroundConfig>(DEFAULT_CONFIG);
  const previewRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => makeData(config, lang), [config, lang]);
  const code = useMemo(() => generateCode(config, lang), [config, lang]);
  const { metrics, start } = useRenderMetrics(previewRef, config);
  const { fps, onPointerEnter, onPointerLeave } = useHoverFps();
  const info = kindInfo(config.kind);

  const update = (patch: Partial<PlaygroundConfig>) => {
    start();
    setConfigState((c) => ({ ...c, ...patch }));
  };

  const setKind = (kind: ChartKind) => {
    const next = kindInfo(kind);
    const points = next.points.includes(config.points) ? config.points : next.defaultPoints;
    update({ kind, points });
  };

  const setColor = (index: number, color: string) => {
    const base =
      config.palette === 'custom' ? config.colors : (PALETTES[config.palette] ?? BASE_COLORS);
    const colors = [...base];
    colors[index] = color;
    update({ palette: 'custom', colors });
  };

  const seriesCount = effectiveSeries(config);
  const colorSlots =
    info.kind === 'pie' || info.kind === 'donut' || info.kind === 'radial'
      ? Math.min(4, config.points)
      : seriesCount;
  const shownColors =
    config.palette === 'custom' ? config.colors : (PALETTES[config.palette] ?? BASE_COLORS);
  const previewClass = config.theme === 'auto' ? '' : ` ${config.theme}`;

  return (
    <article className="playground">
      <PageHeader eyebrow={ui.nav.tools} title={ui.pages.playground} lead={t.lead} />
      <div className="pg-layout">
        <form className="pg-controls" aria-label={t.form} onSubmit={(e) => e.preventDefault()}>
          <SelectField
            label={t.chartType}
            value={config.kind}
            onChange={setKind}
            options={KINDS.map((k) => ({ value: k.kind, label: t.kindLabel(k) }))}
          />

          {info.points.length > 1 ? (
            <SelectField
              label={
                info.x === 'time' || info.x === 'number'
                  ? t.dataPoints
                  : info.kind === 'radial'
                    ? t.rings
                    : t.categories
              }
              {...(info.x === 'time' && config.points >= 10000
                ? { hint: t.downsampleHint }
                : info.x === 'number' && config.points >= 10000
                  ? { hint: t.scatterHint }
                  : {})}
              value={String(config.points)}
              onChange={(v) => update({ points: Number(v) })}
              options={info.points.map((p) => ({
                value: String(p),
                label: formatNumber(p, { locale: lang }),
              }))}
            />
          ) : null}

          {info.kind === 'gauge' ? (
            <Field label={t.value(config.gaugeValue)}>
              {(id) => (
                <input
                  id={id}
                  type="range"
                  min={0}
                  max={100}
                  value={config.gaugeValue}
                  onChange={(e) => update({ gaugeValue: Number(e.target.value) })}
                />
              )}
            </Field>
          ) : null}

          {info.maxSeries > 1 ? (
            <Choice
              label={t.series}
              items={[1, 2, 3, 4]
                .filter((n) => n <= info.maxSeries)
                .map((n) => ({ value: String(n), label: String(n) }))}
              value={String(seriesCount)}
              onChange={(n) => update({ series: Number(n) })}
            />
          ) : null}

          <SelectField
            label={t.colours}
            options={PALETTE_NAMES.map((value) => ({ value, label: t.palettes[value] }))}
            value={config.palette}
            onChange={(palette) => update({ palette })}
          />
          <div className="color-row" role="group" aria-label={t.seriesColours}>
            {Array.from({ length: colorSlots }, (_, i) => (
              <label
                key={i}
                className="color-input"
                title={DEMO_TEXT[lang].series[i] ?? t.colour(i + 1)}
              >
                <input
                  type="color"
                  value={shownColors[i] ?? BASE_COLORS[i % BASE_COLORS.length]}
                  onChange={(e) => setColor(i, e.target.value)}
                  aria-label={t.colour(i + 1)}
                />
              </label>
            ))}
            {config.palette === 'default' ? (
              <span className="field-hint">{t.themePaletteHint}</span>
            ) : null}
          </div>

          <Choice
            label={t.theme}
            items={[
              { value: 'auto', label: t.auto },
              { value: 'light', label: t.light },
              { value: 'dark', label: t.dark },
            ]}
            value={config.theme}
            onChange={(theme: ThemeMode) => update({ theme })}
          />

          <Choice
            label={t.renderer}
            items={[
              { value: 'svg', label: 'SVG' },
              { value: 'canvas', label: 'Canvas' },
              { value: 'auto', label: t.auto },
            ]}
            value={config.renderer}
            onChange={(renderer: Renderer) => update({ renderer })}
          />

          <div className="field">
            <Toggle
              label={t.fillWidth}
              checked={config.fillWidth}
              onChange={(fillWidth) => update({ fillWidth })}
            />
            {!config.fillWidth ? (
              <label className="range">
                <span>{t.width(config.width)}</span>
                <input
                  type="range"
                  min={240}
                  max={1200}
                  step={20}
                  value={config.width}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                />
              </label>
            ) : null}
            <label className="range">
              <span>{t.height(config.height)}</span>
              <input
                type="range"
                min={info.kind === 'sparkline' ? 24 : 120}
                max={600}
                step={8}
                value={config.height}
                onChange={(e) => update({ height: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="field">
            <Toggle
              label={t.animation}
              checked={config.animation}
              onChange={(animation) => update({ animation })}
            />
            {info.tooltip ? (
              <Toggle
                label={t.tooltip}
                checked={config.tooltip}
                onChange={(tooltip) => update({ tooltip })}
              />
            ) : null}
            {info.legend ? (
              <Toggle
                label={t.legend}
                checked={config.legend}
                onChange={(legend) => update({ legend })}
              />
            ) : null}
            {info.zoom ? (
              <Toggle label={t.zoom} checked={config.zoom} onChange={(zoom) => update({ zoom })} />
            ) : null}
          </div>

          {info.tooltip && info.axes && info.x === 'time' && config.tooltip ? (
            <Choice
              label={t.tooltipMode}
              items={[
                { value: 'shared', label: t.shared },
                { value: 'item', label: t.item },
              ]}
              value={config.tooltipMode}
              onChange={(tooltipMode) => update({ tooltipMode })}
            />
          ) : null}

          {info.legend && config.legend ? (
            <Choice
              label={t.legendPosition}
              items={[
                { value: 'bottom', label: t.bottom },
                { value: 'top', label: t.top },
              ]}
              value={config.legendPosition}
              onChange={(legendPosition) => update({ legendPosition })}
            />
          ) : null}

          {info.curve ? (
            <SelectField
              label={t.curve}
              value={config.curve}
              onChange={(curve) => update({ curve })}
              options={CURVES.map((c) => ({ value: c, label: c }))}
            />
          ) : null}

          <Button type="button" variant="outline" size="md" onClick={() => update(DEFAULT_CONFIG)}>
            {t.reset}
          </Button>
        </form>

        <div className="pg-main">
          <section className="pg-preview-frame" aria-label={t.preview}>
            <div
              className={`pg-preview${previewClass}`}
              ref={previewRef}
              onPointerEnter={onPointerEnter}
              onPointerLeave={onPointerLeave}
            >
              <ErrorBoundary resetKey={JSON.stringify(config)} label={ui.errors.chart}>
                <Preview config={config} data={data} lang={lang} />
              </ErrorBoundary>
            </div>
          </section>

          <section className="pg-metrics" aria-labelledby="pg-metrics-title">
            <h2 id="pg-metrics-title" className="pg-subtitle">
              {t.metricsTitle}
            </h2>
            <div className="metric-grid" aria-live="polite">
              <Metric
                label={t.renderPaint}
                value={fmtMs(metrics.renderMs)}
                note={metrics.renderMs === null ? t.changeToMeasure : t.afterLastChange}
              />
              <Metric
                label={t.domNodes}
                value={
                  metrics.domNodes === null ? '—' : formatNumber(metrics.domNodes, { locale: lang })
                }
                note={t.insideChart}
              />
              <Metric
                label={t.hoverFps}
                value={
                  fps.fps === null
                    ? '—'
                    : formatNumber(fps.fps, { locale: lang, maximumFractionDigits: 0 })
                }
                note={
                  fps.active
                    ? t.measuring(fmtMs(fps.worstFrameMs))
                    : fps.fps === null
                      ? t.movePointer
                      : t.lastHover(fmtMs(fps.worstFrameMs))
                }
              />
              <Metric
                label={t.renderer}
                value={metrics.renderer ?? '—'}
                note={config.renderer === 'auto' ? t.chosenByAuto : t.asConfigured}
              />
            </div>
            <p className="field-hint">{t.measuredNote(import.meta.env.DEV)}</p>
          </section>

          <section aria-labelledby="pg-code-title">
            <h2 id="pg-code-title" className="pg-subtitle">
              {t.code}
            </h2>
            <CodeBlock code={code} title="Chart.tsx" />
          </section>
        </div>
      </div>
      <Callout>{t.dataNote}</Callout>
    </article>
  );
}

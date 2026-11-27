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
import { Segmented } from '../ui/Segmented';

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
};

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
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children(id)}
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

function Check({
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
  return (
    <label className={`check${disabled ? ' check-disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
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
          <Field label={t.chartType}>
            {(id) => (
              <select
                id={id}
                value={config.kind}
                onChange={(e) => setKind(e.target.value as ChartKind)}
              >
                {KINDS.map((k) => (
                  <option key={k.kind} value={k.kind}>
                    {t.kindLabel(k)}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {info.points.length > 1 ? (
            <Field
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
            >
              {(id) => (
                <select
                  id={id}
                  value={config.points}
                  onChange={(e) => update({ points: Number(e.target.value) })}
                >
                  {info.points.map((p) => (
                    <option key={p} value={p}>
                      {formatNumber(p, { locale: lang })}
                    </option>
                  ))}
                </select>
              )}
            </Field>
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
            <Segmented
              label={t.series}
              options={[1, 2, 3, 4]
                .filter((n) => n <= info.maxSeries)
                .map((n) => ({ value: n, label: String(n) }))}
              value={seriesCount}
              onChange={(n) => update({ series: n })}
            />
          ) : null}

          <Segmented
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

          <Segmented
            label={t.theme}
            options={[
              { value: 'auto', label: t.auto },
              { value: 'light', label: t.light },
              { value: 'dark', label: t.dark },
            ]}
            value={config.theme}
            onChange={(theme: ThemeMode) => update({ theme })}
          />

          <Segmented
            label={t.renderer}
            options={[
              { value: 'svg', label: 'SVG' },
              { value: 'canvas', label: 'Canvas' },
              { value: 'auto', label: t.auto },
            ]}
            value={config.renderer}
            onChange={(renderer: Renderer) => update({ renderer })}
          />

          <div className="field">
            <Check
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
            <Check
              label={t.animation}
              checked={config.animation}
              onChange={(animation) => update({ animation })}
            />
            {info.tooltip ? (
              <Check
                label={t.tooltip}
                checked={config.tooltip}
                onChange={(tooltip) => update({ tooltip })}
              />
            ) : null}
            {info.legend ? (
              <Check
                label={t.legend}
                checked={config.legend}
                onChange={(legend) => update({ legend })}
              />
            ) : null}
            {info.zoom ? (
              <Check label={t.zoom} checked={config.zoom} onChange={(zoom) => update({ zoom })} />
            ) : null}
          </div>

          {info.tooltip && info.axes && info.x === 'time' && config.tooltip ? (
            <Segmented
              label={t.tooltipMode}
              options={[
                { value: 'shared', label: t.shared },
                { value: 'item', label: t.item },
              ]}
              value={config.tooltipMode}
              onChange={(tooltipMode) => update({ tooltipMode })}
            />
          ) : null}

          {info.legend && config.legend ? (
            <Segmented
              label={t.legendPosition}
              options={[
                { value: 'bottom', label: t.bottom },
                { value: 'top', label: t.top },
              ]}
              value={config.legendPosition}
              onChange={(legendPosition) => update({ legendPosition })}
            />
          ) : null}

          {info.curve ? (
            <Field label={t.curve}>
              {(id) => (
                <select
                  id={id}
                  value={config.curve}
                  onChange={(e) => update({ curve: e.target.value as CurveType })}
                >
                  {CURVES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          ) : null}

          <button type="button" className="btn btn-sm" onClick={() => update(DEFAULT_CONFIG)}>
            {t.reset}
          </button>
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

import { formatNumber, type CurveType, type Renderer, type ThemeMode } from '@jafari/charts';
import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BASE_COLORS,
  DEFAULT_CONFIG,
  effectiveSeries,
  generateCode,
  kindInfo,
  KINDS,
  makeData,
  PALETTES,
  SERIES_LABELS,
  type ChartKind,
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
const PALETTE_OPTIONS: { value: PaletteName; label: string }[] = [
  { value: 'default', label: 'Theme' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'forest', label: 'Forest' },
  { value: 'custom', label: 'Custom' },
];

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

const fmtMs = (v: number | null) =>
  v === null ? '—' : `${formatNumber(v, { maximumFractionDigits: v < 10 ? 1 : 0 })} ms`;

export function Playground() {
  const [config, setConfigState] = useState<PlaygroundConfig>(DEFAULT_CONFIG);
  const previewRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => makeData(config), [config]);
  const code = useMemo(() => generateCode(config), [config]);
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
      <PageHeader
        eyebrow="Tools"
        title="Playground"
        lead="Configure a chart, watch it update, copy the code — and see how fast it renders on your device."
      />
      <div className="pg-layout">
        <form
          className="pg-controls"
          aria-label="Chart configuration"
          onSubmit={(e) => e.preventDefault()}
        >
          <Field label="Chart type">
            {(id) => (
              <select
                id={id}
                value={config.kind}
                onChange={(e) => setKind(e.target.value as ChartKind)}
              >
                {KINDS.map((k) => (
                  <option key={k.kind} value={k.kind}>
                    {k.label} ({k.component})
                  </option>
                ))}
              </select>
            )}
          </Field>

          {info.points.length > 1 ? (
            <Field
              label={
                info.x === 'time' || info.x === 'number'
                  ? 'Data points'
                  : info.kind === 'radial'
                    ? 'Rings'
                    : 'Categories'
              }
              {...(info.x === 'time' && config.points >= 10000
                ? { hint: 'Lines and areas are downsampled to about 2 points per pixel.' }
                : info.x === 'number' && config.points >= 10000
                  ? {
                      hint: 'renderer="auto" switches scatter plots to Canvas above 75 000 points.',
                    }
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
                      {formatNumber(p)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          ) : null}

          {info.kind === 'gauge' ? (
            <Field label={`Value: ${config.gaugeValue}`}>
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
              label="Series"
              options={[1, 2, 3, 4]
                .filter((n) => n <= info.maxSeries)
                .map((n) => ({ value: n, label: String(n) }))}
              value={seriesCount}
              onChange={(n) => update({ series: n })}
            />
          ) : null}

          <Segmented
            label="Colours"
            options={PALETTE_OPTIONS}
            value={config.palette}
            onChange={(palette) => update({ palette })}
          />
          <div className="color-row" role="group" aria-label="Series colours">
            {Array.from({ length: colorSlots }, (_, i) => (
              <label key={i} className="color-input" title={SERIES_LABELS[i] ?? `Colour ${i + 1}`}>
                <input
                  type="color"
                  value={shownColors[i] ?? BASE_COLORS[i % BASE_COLORS.length]}
                  onChange={(e) => setColor(i, e.target.value)}
                  aria-label={`Colour ${i + 1}`}
                />
              </label>
            ))}
            {config.palette === 'default' ? (
              <span className="field-hint">Theme palette (adapts to dark mode)</span>
            ) : null}
          </div>

          <Segmented
            label="Theme"
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={config.theme}
            onChange={(theme: ThemeMode) => update({ theme })}
          />

          <Segmented
            label="Renderer"
            options={[
              { value: 'svg', label: 'SVG' },
              { value: 'canvas', label: 'Canvas' },
              { value: 'auto', label: 'Auto' },
            ]}
            value={config.renderer}
            onChange={(renderer: Renderer) => update({ renderer })}
          />

          <div className="field">
            <Check
              label="Fill container width"
              checked={config.fillWidth}
              onChange={(fillWidth) => update({ fillWidth })}
            />
            {!config.fillWidth ? (
              <label className="range">
                <span>Width: {config.width} px</span>
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
              <span>Height: {config.height} px</span>
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
              label="Animation"
              checked={config.animation}
              onChange={(animation) => update({ animation })}
            />
            {info.tooltip ? (
              <Check
                label="Tooltip"
                checked={config.tooltip}
                onChange={(tooltip) => update({ tooltip })}
              />
            ) : null}
            {info.legend ? (
              <Check
                label="Legend"
                checked={config.legend}
                onChange={(legend) => update({ legend })}
              />
            ) : null}
            {info.zoom ? (
              <Check
                label="Zoom & pan (Ctrl/⌘ + wheel, drag)"
                checked={config.zoom}
                onChange={(zoom) => update({ zoom })}
              />
            ) : null}
          </div>

          {info.tooltip && info.axes && info.x === 'time' && config.tooltip ? (
            <Segmented
              label="Tooltip mode"
              options={[
                { value: 'shared', label: 'Shared' },
                { value: 'item', label: 'Item' },
              ]}
              value={config.tooltipMode}
              onChange={(tooltipMode) => update({ tooltipMode })}
            />
          ) : null}

          {info.legend && config.legend ? (
            <Segmented
              label="Legend position"
              options={[
                { value: 'bottom', label: 'Bottom' },
                { value: 'top', label: 'Top' },
              ]}
              value={config.legendPosition}
              onChange={(legendPosition) => update({ legendPosition })}
            />
          ) : null}

          {info.curve ? (
            <Field label="Curve">
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
            Reset
          </button>
        </form>

        <div className="pg-main">
          <section className="pg-preview-frame" aria-label="Preview">
            <div
              className={`pg-preview${previewClass}`}
              ref={previewRef}
              onPointerEnter={onPointerEnter}
              onPointerLeave={onPointerLeave}
            >
              <ErrorBoundary resetKey={JSON.stringify(config)} label="The chart">
                <Preview config={config} data={data} />
              </ErrorBoundary>
            </div>
          </section>

          <section className="pg-metrics" aria-labelledby="pg-metrics-title">
            <h2 id="pg-metrics-title" className="pg-subtitle">
              Performance in your browser
            </h2>
            <div className="metric-grid" aria-live="polite">
              <Metric
                label="Render + paint"
                value={fmtMs(metrics.renderMs)}
                note={
                  metrics.renderMs === null
                    ? 'change any option to measure'
                    : 'after the last change'
                }
              />
              <Metric
                label="DOM nodes"
                value={metrics.domNodes === null ? '—' : formatNumber(metrics.domNodes)}
                note="inside the chart"
              />
              <Metric
                label="Hover FPS"
                value={fps.fps === null ? '—' : formatNumber(fps.fps, { maximumFractionDigits: 0 })}
                note={
                  fps.active
                    ? `measuring · longest frame ${fmtMs(fps.worstFrameMs)}`
                    : fps.fps === null
                      ? 'move the pointer over the chart'
                      : `last hover · longest frame ${fmtMs(fps.worstFrameMs)}`
                }
              />
              <Metric
                label="Renderer"
                value={metrics.renderer ?? '—'}
                note={config.renderer === 'auto' ? 'chosen by renderer="auto"' : 'as configured'}
              />
            </div>
            <p className="field-hint">
              Measured live with <code>performance.now()</code> and{' '}
              <code>requestAnimationFrame</code> in <strong>your</strong> browser, on this device,
              {import.meta.env.DEV ? ' in a development build (slower than production),' : ''}{' '}
              including generating the demo data. Numbers vary with hardware, browser, extensions
              and other tabs; FPS is capped by your display’s refresh rate. See{' '}
              <a href="#/performance">Performance</a> for the controlled benchmark.
            </p>
          </section>

          <section aria-labelledby="pg-code-title">
            <h2 id="pg-code-title" className="pg-subtitle">
              Code
            </h2>
            <CodeBlock code={code} title="Chart.tsx" />
          </section>
        </div>
      </div>
      <Callout>
        Data is generated deterministically by the formula in the code, so the copied code renders
        exactly this chart. Replace <code>data</code> with your own rows; keys are type-checked.
      </Callout>
    </article>
  );
}

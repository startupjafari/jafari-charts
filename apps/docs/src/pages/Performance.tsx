import { ChartReferenceLine, formatDate, formatNumber, GroupedBarChart } from '@jafari/charts';
import bench from '../../../../benchmarks/results/latest.json';
import sizes from '../../../../benchmarks/size.json';
import { Link, useLocation } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';

/**
 * Benchmark and bundle-size results, imported from the repository at build time
 * (`benchmarks/results/latest.json`, `benchmarks/size.json`) and drawn with
 * Jafari Charts. Nothing here is hand-entered.
 */

type ScalingRow = (typeof bench.scaling)[number];

const pointsLabel = (n: number) =>
  n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1000 ? `${n / 1000}k` : String(n);

const labelOf = (r: ScalingRow) => `${r.chart} · ${pointsLabel(r.points)}`;

/** The slowest update when it is more than 5× the next slowest (it would flatten the chart). */
function findOutlier(rows: readonly ScalingRow[]): ScalingRow | null {
  const sorted = [...rows].sort((a, b) => b.updateMs - a.updateMs);
  const [first, second] = sorted;
  return first && second && first.updateMs > second.updateMs * 5 ? first : null;
}

/** One row per (chart, points) with SVG and Canvas side by side. */
function pivot(metric: (r: ScalingRow) => number) {
  const rows = new Map<string, { label: string; svg: number | null; canvas: number | null }>();
  for (const r of bench.scaling) {
    const label = labelOf(r);
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

const ms = (v: number) => `${formatNumber(v, { maximumFractionDigits: 1 })} ms`;

function ScalingTable() {
  return (
    <div className="table-wrap">
      <table>
        <caption>Single chart (benchmarks/results/latest.json → scaling)</caption>
        <thead>
          <tr>
            <th scope="col">Chart</th>
            <th scope="col">Renderer</th>
            <th scope="col" className="num">
              Points
            </th>
            <th scope="col" className="num">
              Mount
            </th>
            <th scope="col" className="num">
              Update
            </th>
            <th scope="col" className="num">
              Hover p50
            </th>
            <th scope="col" className="num">
              Hover p95
            </th>
            <th scope="col" className="num">
              Long tasks
            </th>
            <th scope="col" className="num">
              DOM nodes
            </th>
            <th scope="col" className="num">
              Heap
            </th>
          </tr>
        </thead>
        <tbody>
          {bench.scaling.map((r) => (
            <tr key={`${r.chart}-${r.renderer}-${r.points}`}>
              <th scope="row">{r.chart}</th>
              <td>{r.renderer}</td>
              <td className="num">{formatNumber(r.points)}</td>
              <td className="num">{ms(r.mountMs)}</td>
              <td className="num">{ms(r.updateMs)}</td>
              <td className="num">{ms(r.hoverP50Ms)}</td>
              <td className="num">{ms(r.hoverP95Ms)}</td>
              <td className="num">{r.longTasksDuringHover}</td>
              <td className="num">{r.domNodes}</td>
              <td className="num">{formatNumber(r.heapMB, { maximumFractionDigits: 1 })} MB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MultiTable() {
  return (
    <div className="table-wrap">
      <table>
        <caption>Many line charts on one page, 365 points each (→ multi)</caption>
        <thead>
          <tr>
            <th scope="col" className="num">
              Charts
            </th>
            <th scope="col" className="num">
              Mount
            </th>
            <th scope="col" className="num">
              Filter switch
            </th>
            <th scope="col" className="num">
              Resize
            </th>
            <th scope="col" className="num">
              Hover p95
            </th>
            <th scope="col" className="num">
              Long tasks
            </th>
            <th scope="col" className="num">
              Longest task
            </th>
            <th scope="col" className="num">
              DOM nodes
            </th>
            <th scope="col" className="num">
              Heap
            </th>
          </tr>
        </thead>
        <tbody>
          {bench.multi.map((r) => (
            <tr key={r.charts}>
              <th scope="row" className="num">
                {r.charts}
              </th>
              <td className="num">{ms(r.mountMs)}</td>
              <td className="num">{ms(r.filterSwitchMs)}</td>
              <td className="num">{ms(r.resizeMs)}</td>
              <td className="num">{ms(r.hoverP95Ms)}</td>
              <td className="num">{r.longTasks}</td>
              <td className="num">{ms(r.longestTaskMs)}</td>
              <td className="num">{formatNumber(r.domNodes)}</td>
              <td className="num">{formatNumber(r.heapMB, { maximumFractionDigits: 1 })} MB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioList() {
  return (
    <ul>
      {bench.scenarios.map((s) => (
        <li key={s.name}>
          <strong>{s.name}</strong>:{' '}
          {'p50Ms' in s && typeof s.p50Ms === 'number'
            ? `p50 ${ms(s.p50Ms)}, p95 ${'p95Ms' in s && typeof s.p95Ms === 'number' ? ms(s.p95Ms) : '—'} per update (render + next frame)`
            : null}
          {'heapDeltaMB' in s && typeof s.heapDeltaMB === 'number'
            ? `heap ${s.heapStartMB} MB → ${s.heapEndMB} MB (Δ ${s.heapDeltaMB} MB), ${s.domNodesAfter} DOM nodes left behind`
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
  const meta = bench.meta;
  const mount = pivot((r) => r.mountMs);
  const updateOutlier = findOutlier(bench.scaling);
  const update = pivot((r) => r.updateMs).map((row) => ({
    ...row,
    ...(updateOutlier && row.label === labelOf(updateOutlier)
      ? { [updateOutlier.renderer === 'svg' ? 'svg' : 'canvas']: null }
      : {}),
  }));
  const dom = pivot((r) => r.domNodes);
  const hover = pivot((r) => r.hoverP95Ms);
  const multi = bench.multi.map((r) => ({
    label: `${r.charts} charts`,
    mount: r.mountMs,
    filter: r.filterSwitchMs,
    resize: r.resizeMs,
  }));
  return (
    <article>
      <PageHeader
        eyebrow="Guides"
        title="Performance"
        lead="Results of the repository’s benchmark suite and bundle-size check, drawn with Jafari Charts. Every number on this page comes from files committed to the repository."
      >
        <nav aria-label="On this page">
          <ul className="page-toc">
            {[
              ['run', 'This run'],
              ['single', 'Single chart'],
              ['many', 'Many charts'],
              ['scenarios', 'Scenarios'],
              ['bundle', 'Bundle size'],
              ['methodology', 'Methodology'],
              ['renderer', 'SVG or Canvas'],
            ].map(([id, title]) => (
              <li key={id}>
                <Link to={path} section={id}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="run" title="This run">
        <dl className="meta-grid">
          <div>
            <dt>Date</dt>
            <dd>
              {formatDate(Date.parse(meta.date), { dateStyle: 'medium', timeStyle: 'short' })}
            </dd>
          </div>
          <div>
            <dt>CPU</dt>
            <dd>
              {meta.cpu} ({meta.cores} cores, {meta.memoryGB} GB)
            </dd>
          </div>
          <div>
            <dt>Browser</dt>
            <dd>Chromium {meta.browser} (Playwright, headless)</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{meta.quick ? 'Quick run (fewer sizes and repetitions)' : 'Full run'}</dd>
          </div>
        </dl>
        <Callout tone="warning" title="Absolute numbers depend on the machine">
          Compare runs made on the same machine. These results describe Jafari Charts only; no other
          libraries were measured, so this page makes no comparisons.
        </Callout>
      </Section>

      <Section id="single" title="Single chart">
        <h3>Mount time</h3>
        <p className="section-lead">
          Median time from mounting the chart to the next painted frame, by chart type and input
          size.
        </p>
        <GroupedBarChart
          data={mount}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={ms}
          yAxis={{ title: 'ms' }}
          animation={false}
          height={280}
          title="Mount time by chart, size and renderer"
        />

        <h3>Update time</h3>
        <p className="section-lead">
          Median time to replace the whole dataset (filter switching) and paint.
          {updateOutlier ? (
            <>
              {' '}
              One result is far outside the others and is left out of the chart so the rest stay
              readable: the {updateOutlier.renderer} {updateOutlier.chart} chart with{' '}
              {formatNumber(updateOutlier.points)} points took {ms(updateOutlier.updateMs)} (it is
              in the table below). ARCHITECTURE.md §7 describes the Canvas batching fix for this
              case (flushing every 256 subpaths); re-running <code>pnpm bench</code> refreshes these
              results.
            </>
          ) : null}
        </p>
        <GroupedBarChart
          data={update}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={ms}
          yAxis={{ title: 'ms' }}
          animation={false}
          height={280}
          title="Update time by chart, size and renderer"
        />

        <h3>DOM size</h3>
        <p className="section-lead">
          Elements inside the benchmark container. Mark batching and downsampling keep the DOM
          almost constant from 365 to 100 000 points.
        </p>
        <GroupedBarChart
          data={dom}
          xKey="label"
          series={RENDERER_SERIES}
          animation={false}
          height={240}
          title="DOM nodes by chart, size and renderer"
        />

        <h3>Hover latency (p95)</h3>
        <p className="section-lead">
          Time from a pointer move to the next frame, 95th percentile of 40 moves. The dashed line
          is one frame at 60 Hz (16.7 ms): values around it mean the hover update fits in a single
          frame.
        </p>
        <GroupedBarChart
          data={hover}
          xKey="label"
          series={RENDERER_SERIES}
          valueFormatter={ms}
          animation={false}
          height={240}
          title="Hover latency p95"
        >
          <ChartReferenceLine y={16.7} />
        </GroupedBarChart>
        <ScalingTable />
      </Section>

      <Section id="many" title="Many charts on one page">
        <p className="section-lead">
          Line charts with 365 points each. Filter switch replaces every chart’s data; resize
          changes the container width. All charts share one ResizeObserver.
        </p>
        <GroupedBarChart
          data={multi}
          xKey="label"
          series={[
            { key: 'mount', label: 'Mount' },
            { key: 'filter', label: 'Filter switch' },
            { key: 'resize', label: 'Resize' },
          ]}
          valueFormatter={ms}
          animation={false}
          height={240}
          title="Many charts: mount, filter switch and resize"
        />
        <MultiTable />
      </Section>

      <Section id="scenarios" title="Scenarios">
        <ScenarioList />
      </Section>

      <Section id="bundle" title="Bundle size">
        <p className="section-lead">
          From <code>pnpm size</code> (benchmarks/size.json): a consumer build with Vite, minified
          and gzipped, React external. Each scenario has a budget that fails the check when
          exceeded.
        </p>
        <GroupedBarChart
          layout="horizontal"
          data={sizeRows}
          xKey="scenario"
          series={[
            { key: 'gzip', label: 'gzip KB' },
            { key: 'budget', label: 'Budget KB', color: 'var(--jc-neutral)' },
          ]}
          valueFormatter={(v) => `${v} KB`}
          animation={false}
          height={Math.max(260, sizeRows.length * 46)}
          title="Bundle size against budget"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Scenario</th>
                <th scope="col" className="num">
                  Minified
                </th>
                <th scope="col" className="num">
                  gzip
                </th>
                <th scope="col" className="num">
                  Budget
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.scenario}>
                  <th scope="row">{s.scenario}</th>
                  <td className="num">{s['min KB']} KB</td>
                  <td className="num">{s['gzip KB']} KB</td>
                  <td className="num">{s['budget KB']} KB</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="methodology" title="Methodology">
        <ul>
          <li>
            <strong>Production build.</strong> <code>pnpm bench</code> builds the playground app
            with Vite and serves it with <code>vite preview</code>; nothing runs in development
            mode.
          </li>
          <li>
            <strong>Chromium.</strong> Pages are driven by Playwright’s Chromium (version above) in
            a 1000 × 800 viewport, with animations off.
          </li>
          <li>
            <strong>Medians.</strong> Mount is the median of 3 fresh page loads, update the median
            of 5 dataset replacements; multi-chart filter switch and resize are medians of 4.
          </li>
          <li>
            <strong>Mount / update / resize</strong>: from a synchronous React commit (
            <code>flushSync</code>) to the next frame (<code>requestAnimationFrame</code> +{' '}
            <code>setTimeout</code>), so layout and paint are included.
          </li>
          <li>
            <strong>Hover p50/p95</strong>: synthetic pointer moves across the chart; time from
            dispatch to the next frame. <strong>Long tasks</strong> are counted with a{' '}
            <code>PerformanceObserver</code> (tasks over 50 ms) during hovering.
          </li>
          <li>
            <strong>DOM nodes</strong>: all elements inside the benchmark container.{' '}
            <strong>Heap</strong>: <code>performance.memory.usedJSHeapSize</code> after a forced
            garbage collection.
          </li>
          <li>
            <strong>Leak check</strong>: repeated mount/unmount of 10 charts; heap and DOM must
            return to the baseline.
          </li>
          <li>
            <strong>Bundle size</strong>: <code>pnpm size</code> builds small consumer entry points
            and reports minified and gzip sizes against budgets.
          </li>
        </ul>
        <CodeBlock
          language="bash"
          code={`pnpm bench          # full run → benchmarks/results/latest.json + REPORT.md
pnpm bench --quick  # fewer sizes and repetitions
pnpm size           # bundle sizes → benchmarks/size.json`}
        />
        <p>
          Want numbers for your own device? The <Link to="/playground">Playground</Link> measures
          render time, DOM size and FPS live in your browser.
        </p>
      </Section>

      <Section id="renderer" title="SVG or Canvas?">
        <p>
          With mark batching, SVG is as fast as or faster than Canvas for bar charts up to 10 000
          bars and for line and area charts at any input size — downsampling keeps the drawn points
          at about two per pixel, so the DOM stays small. Canvas has no per-element cost but pays
          for re-rasterising the whole surface, and its text and hit testing are separate anyway.
        </p>
        <p>
          Therefore <code>renderer="auto"</code> keeps line, area and bar charts on SVG. Chart types
          whose marks cannot be reduced — large scatter plots — set their own{' '}
          <code>canvasThreshold</code> from their benchmarks and switch to Canvas above it. You can
          always force <code>renderer="canvas"</code> or <code>"svg"</code>.
        </p>
        <p>
          One finding from the benchmarks: Chromium’s <code>closePath()</code> slows down
          quadratically on paths with thousands of closed subpaths, so the Canvas renderer flushes
          its batches every 256 subpaths (about 1 s → 70 ms for 10 000 bars, per ARCHITECTURE.md).
        </p>
      </Section>
    </article>
  );
}

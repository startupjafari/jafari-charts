import { BarChart, LineChart } from '@startupjafari/charts';
import * as exporter from '@startupjafari/charts/export';
import type { ExportBackground, ExportFormat } from '@startupjafari/charts/export';
import { Check, Download, FileCode, FileImage, FileSpreadsheet, Info } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { registrations, timeSeries } from '../data';
import { Hint, ScenePage } from '../shell/scene-page';
import { Button } from '../ui/button';
import { ChartCard, CardGrid } from '../ui/card';
import { Field } from '../ui/field';
import { Segmented } from '../ui/segmented';

const series = timeSeries(30);

declare global {
  interface Window {
    __export?: typeof exporter;
  }
}
// Exposed for tests/e2e/export.spec.ts (exercises the real browser APIs).
window.__export = exporter;

type Scale = '1' | '2' | '3';
type Background = Extract<ExportBackground, 'auto' | 'light' | 'dark' | 'transparent'>;

const SCALES = [
  { value: '1', label: '1×' },
  { value: '2', label: '2×' },
  { value: '3', label: '3×' },
] as const;

const BACKGROUNDS = [
  { value: 'auto', label: 'Theme' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'transparent', label: 'None' },
] as const;

const FORMATS: ReadonlyArray<{ format: ExportFormat; label: string; icon: typeof FileCode }> = [
  { format: 'svg', label: 'SVG', icon: FileCode },
  { format: 'png', label: 'PNG', icon: FileImage },
  { format: 'webp', label: 'WebP', icon: FileImage },
  { format: 'csv', label: 'CSV', icon: FileSpreadsheet },
];

function formatBytes(n: number) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

/** One card: a chart plus download buttons for every format. */
function ExportCard<T extends object>({
  id,
  title,
  description,
  filename,
  data,
  scale,
  background,
  children,
}: {
  id: string;
  title: string;
  description: string;
  filename: string;
  data: readonly T[];
  scale: number;
  background: Background;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (format: ExportFormat) => {
    const el = ref.current?.querySelector('.jc-root');
    if (!el) return;
    setError(null);
    try {
      const blob = await exporter.exportChart(el, { format, filename, data, scale, background });
      setLast(`${filename}.${format} · ${formatBytes(blob.size)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ChartCard
      id={id}
      title={title}
      description={description}
      footer={
        <>
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Download</span>
            {FORMATS.map(({ format, label, icon: Icon }) => (
              <Button
                key={format}
                variant="outline"
                size="sm"
                onClick={() => void run(format)}
                disabled={format === 'webp' && !exporter.isWebpSupported()}
              >
                <Icon aria-hidden />
                {label}
              </Button>
            ))}
          </span>
          <span role="status" className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : last ? (
              <>
                <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                <span className="truncate">Saved {last}</span>
              </>
            ) : null}
          </span>
        </>
      }
    >
      <div ref={ref}>{children}</div>
    </ChartCard>
  );
}

/** Fixture for export tests: one SVG chart and one canvas chart. */
export function Export() {
  const [scale, setScale] = useState<Scale>('2');
  const [background, setBackground] = useState<Background>('auto');
  return (
    <ScenePage
      scene="export"
      actions={
        <>
          <Field label="Raster scale" inline>
            {(id) => <Segmented items={SCALES} value={scale} onChange={setScale} labelledBy={id} />}
          </Field>
          <Field label="Background" inline>
            {(id) => (
              <Segmented
                items={BACKGROUNDS}
                value={background}
                onChange={setBackground}
                labelledBy={id}
              />
            )}
          </Field>
        </>
      }
      hints={
        <>
          <Hint icon={Download}>Each button downloads the chart above it</Hint>
          <Hint icon={Info}>Scale applies to PNG and WebP; CSV exports the source rows</Hint>
        </>
      }
    >
      <CardGrid>
        <ExportCard
          id="svg-chart"
          title="SVG chart"
          description="Vector output with inline styles, resolved colours and the legend."
          filename="students"
          data={series}
          scale={Number(scale)}
          background={background}
        >
          <LineChart
            data={series}
            xKey="date"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'teachers', label: 'Teachers' },
            ]}
            animation={false}
            height={240}
          />
        </ExportCard>
        <ExportCard
          id="canvas-chart"
          title="Canvas chart"
          description="Drawn on canvas; exports embed the bitmap inside the file."
          filename="registrations"
          data={registrations}
          scale={Number(scale)}
          background={background}
        >
          <BarChart
            data={registrations}
            xKey="month"
            yKey="students"
            renderer="canvas"
            animation={false}
            height={240}
          />
        </ExportCard>
      </CardGrid>
    </ScenePage>
  );
}

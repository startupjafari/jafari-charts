import { BarChart, LineChart } from '@startupjafari/charts';
import * as exporter from '@startupjafari/charts/export';
import type { ExportBackground, ExportFormat } from '@startupjafari/charts/export';
import { Check, Download, FileCode, FileImage, FileSpreadsheet, Info } from '../ui/icons';
import { useRef, useState, type ReactNode } from 'react';
import { registrations, timeSeries } from '../data';
import { defineCards, formatNum, useCards, useLang, useText, type L, type Lang } from '../i18n';
import { Hint, ScenePage } from '../shell/scene-page';
import { Button } from '../ui/button';
import { ChartCard, CardGrid } from '../ui/card';
import { Field } from '../ui/field';
import { SegmentedTabs } from '../ui/segmented-tabs';

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

const CARDS = defineCards({
  en: {
    svg: {
      title: 'SVG chart',
      description: 'Vector output with inline styles, resolved colours and the legend.',
    },
    canvas: {
      title: 'Canvas chart',
      description: 'Drawn on canvas; exports embed the bitmap inside the file.',
    },
  },
  ru: {
    svg: {
      title: 'Диаграмма SVG',
      description: 'Векторный файл со встроенными стилями, вычисленными цветами и легендой.',
    },
    canvas: {
      title: 'Диаграмма на Canvas',
      description: 'Отрисована на canvas; при экспорте растр встраивается в файл.',
    },
  },
  kk: {
    svg: {
      title: 'SVG диаграммасы',
      description:
        'Кірістірілген стильдері, есептелген түстері және шартты белгілері бар векторлық файл.',
    },
    canvas: {
      title: 'Canvas диаграммасы',
      description: 'Canvas-та салынған; экспорт кезінде растр файлдың ішіне енгізіледі.',
    },
  },
});

interface ExportText {
  scale: string;
  background: string;
  backgrounds: Record<Background, string>;
  download: string;
  saved: (file: string) => string;
  bytes: string;
  kilobytes: string;
  hintButtons: string;
  hintScale: string;
}

const TEXT: L<ExportText> = {
  en: {
    scale: 'Raster scale',
    background: 'Background',
    backgrounds: { auto: 'Theme', light: 'Light', dark: 'Dark', transparent: 'None' },
    download: 'Download',
    saved: (file) => `Saved ${file}`,
    bytes: 'B',
    kilobytes: 'KB',
    hintButtons: 'Each button downloads the chart above it',
    hintScale: 'Scale applies to PNG and WebP; CSV exports the source rows',
  },
  ru: {
    scale: 'Масштаб растра',
    background: 'Фон',
    backgrounds: { auto: 'Тема', light: 'Светлый', dark: 'Тёмный', transparent: 'Нет' },
    download: 'Скачать',
    saved: (file) => `Сохранено: ${file}`,
    bytes: 'Б',
    kilobytes: 'КБ',
    hintButtons: 'Каждая кнопка скачивает диаграмму над ней',
    hintScale: 'Масштаб действует на PNG и WebP; CSV выгружает исходные строки',
  },
  kk: {
    scale: 'Растр масштабы',
    background: 'Фон',
    backgrounds: { auto: 'Тақырып', light: 'Ашық', dark: 'Күңгірт', transparent: 'Жоқ' },
    download: 'Жүктеп алу',
    saved: (file) => `Сақталды: ${file}`,
    bytes: 'Б',
    kilobytes: 'КБ',
    hintButtons: 'Әр түйме өзінің үстіндегі диаграмманы жүктеп алады',
    hintScale: 'Масштаб PNG мен WebP-ке қолданылады; CSV бастапқы жолдарды экспорттайды',
  },
};

const BACKGROUNDS: readonly Background[] = ['auto', 'light', 'dark', 'transparent'];

const FORMATS: ReadonlyArray<{ format: ExportFormat; label: string; icon: typeof FileCode }> = [
  { format: 'svg', label: 'SVG', icon: FileCode },
  { format: 'png', label: 'PNG', icon: FileImage },
  { format: 'webp', label: 'WebP', icon: FileImage },
  { format: 'csv', label: 'CSV', icon: FileSpreadsheet },
];

function formatBytes(n: number, lang: Lang, text: ExportText) {
  return n < 1024
    ? `${formatNum(lang, n)} ${text.bytes}`
    : `${formatNum(lang, n / 1024, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${text.kilobytes}`;
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
  description: ReactNode;
  filename: string;
  data: readonly T[];
  scale: number;
  background: Background;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const text = useText(TEXT);
  const ref = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState<{ file: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (format: ExportFormat) => {
    const el = ref.current?.querySelector('.jc-root');
    if (!el) return;
    setError(null);
    try {
      const blob = await exporter.exportChart(el, { format, filename, data, scale, background });
      setLast({ file: `${filename}.${format}`, size: blob.size });
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
            <span className="text-muted-foreground">{text.download}</span>
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
                <span className="truncate">
                  {text.saved(`${last.file} · ${formatBytes(last.size, lang, text)}`)}
                </span>
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
  const text = useText(TEXT);
  const card = useCards(CARDS);
  const backgrounds = BACKGROUNDS.map((value) => ({ value, label: text.backgrounds[value] }));
  return (
    <ScenePage
      scene="export"
      actions={
        <>
          <Field label={text.scale} group inline>
            {() => (
              <SegmentedTabs
                items={SCALES}
                value={scale}
                onChange={setScale}
                aria-label={text.scale}
              />
            )}
          </Field>
          <Field label={text.background} group inline>
            {() => (
              <SegmentedTabs
                items={backgrounds}
                value={background}
                onChange={setBackground}
                aria-label={text.background}
              />
            )}
          </Field>
        </>
      }
      hints={
        <>
          <Hint icon={Download}>{text.hintButtons}</Hint>
          <Hint icon={Info}>{text.hintScale}</Hint>
        </>
      }
    >
      <CardGrid>
        <ExportCard
          {...card('svg')}
          id="svg-chart"
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
          {...card('canvas')}
          id="canvas-chart"
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

import { AreaChart, BarChart, LineChart } from '@startupjafari/charts';
import {
  Hand,
  MousePointer2,
  MousePointerClick,
  SquareDashedMousePointer,
  ZoomIn,
} from '../ui/icons';
import { useState } from 'react';
import { registrations, timeSeries } from '../data';
import { Hint, ScenePage } from '../shell/scene-page';
import { ChartCard, CardGrid, Readout } from '../ui/card';
import { Kbd } from '../ui/kbd';

const big = timeSeries(2000, { keys: ['value'] as const, step: 36e5 });
const series = timeSeries(60);

const placeholder = "empty:before:text-muted-foreground empty:before:content-['—']";

/** Deterministic fixture for e2e interaction tests (zoom, brush, controlled state, touch). */
export function Interactions() {
  const [brush, setBrush] = useState('');
  const [clicked, setClicked] = useState('');
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  return (
    <ScenePage
      scene="interactions"
      hints={
        <>
          <Hint icon={ZoomIn}>
            <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + wheel zooms
          </Hint>
          <Hint icon={Hand}>Drag pans a zoomed chart</Hint>
          <Hint icon={MousePointerClick}>Double-click resets</Hint>
          <Hint icon={SquareDashedMousePointer}>Drag across a brush chart to select</Hint>
        </>
      }
    >
      <CardGrid>
        <ChartCard
          id="zoom"
          title="Zoom & pan"
          description="2,000 hourly points. A plain wheel still scrolls the page."
          footer={
            <span className="flex flex-wrap items-center gap-1 text-muted-foreground">
              <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + wheel to zoom · drag to pan · double-click to reset
            </span>
          }
        >
          <LineChart data={big} xKey="date" yKey="value" zoom animation={false} height={240} />
        </ChartCard>
        <ChartCard
          id="brush"
          title="Brush"
          description="Drag across the chart to select a range of days."
          footer={
            <Readout label="Selected indices">
              <output data-testid="brush-result" className={placeholder}>
                {brush}
              </output>
            </Readout>
          }
        >
          <AreaChart
            data={series}
            xKey="date"
            yKey="students"
            brush
            animation={false}
            height={220}
            onBrush={(r) => setBrush(`${r.startIndex}-${r.endIndex}`)}
          />
        </ChartCard>
        <ChartCard
          id="controlled"
          title="Controlled legend + active index"
          description="Hidden series, the active bar and clicks live in React state."
          footer={
            <>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MousePointer2 className="size-3.5" aria-hidden />
                Toggle the legend, hover or click a bar
              </span>
              <Readout label="State">
                <output data-testid="state">{`hidden=${hidden.join(',')};active=${active ?? ''};clicked=${clicked}`}</output>
              </Readout>
            </>
          }
        >
          <BarChart
            data={registrations}
            xKey="month"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'teachers', label: 'Teachers' },
            ]}
            hiddenSeries={hidden}
            onHiddenSeriesChange={setHidden}
            activeIndex={active}
            onActiveIndexChange={setActive}
            onClick={(e) => setClicked(`${e.index}:${String(e.datum.month)}`)}
            animation={false}
            height={220}
          />
        </ChartCard>
      </CardGrid>
    </ScenePage>
  );
}

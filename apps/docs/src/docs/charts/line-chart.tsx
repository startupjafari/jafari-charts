import { LineChart } from '@jafari/charts';
import { activity } from '../../examples/data';
import { Link } from '../../lib/router';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { CARTESIAN_KEYS, ZOOM_KEYS } from '../keyboard';
import type { ChartDoc } from '../types';

export const lineChart: ChartDoc = {
  slug: 'line-chart',
  component: 'LineChart',
  title: 'Line chart',
  group: 'Core',
  summary: 'One or more series over time, numbers or categories — the workhorse for trends.',
  description: (
    <>
      <p>
        Lines use a monotone curve by default, which never overshoots the data, and break into gaps
        at missing values instead of inventing them. The value axis includes zero when the data is
        close to it (counts) and zooms to the range otherwise (prices, temperatures).
      </p>
      <p>
        With two or more series you get a legend whose items toggle series, a crosshair and a shared
        tooltip. Large inputs are downsampled with LTTB to about two points per pixel, so the drawn
        path — and the DOM — stays the same size whether you pass 1 000 or 100 000 points (see{' '}
        <Link to="/performance">Performance</Link>).
      </p>
    </>
  ),
  thumbnail: () => (
    <LineChart
      data={activity}
      xKey="date"
      series={[{ key: 'students' }, { key: 'teachers' }]}
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      crosshair={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'line-chart/Basic',
        title: 'Basic',
        description: (
          <p>
            Pass rows, the x field and the value field. <code>Date</code> objects and ISO date
            strings are detected as time; for numeric timestamps add{' '}
            <code>
              xAxis={'{{'} type: 'time' {'}}'}
            </code>
            .
          </p>
        ),
      },
      {
        id: 'line-chart/MultiSeries',
        title: 'Several series with a reference line',
        description: (
          <p>
            <code>series</code> takes one entry per line. Primitives such as{' '}
            <code>ChartReferenceLine</code> go in <code>children</code>.
          </p>
        ),
      },
      {
        id: 'line-chart/MissingValues',
        title: 'Missing and negative values',
        description: <p>Null values leave gaps; the axis adapts to negative ranges.</p>,
      },
    ],
    styling: [
      {
        id: 'line-chart/Curves',
        title: 'Curves and markers',
        description: (
          <p>
            <code>curve</code> switches the interpolation; <code>dots</code> adds markers.
          </p>
        ),
      },
      {
        id: 'line-chart/Styling',
        title: 'Colours, dashes, axes and formatting',
        description: (
          <p>
            Per-series <code>color</code> and <code>dashed</code>, vertical gridlines, axis title,
            value formatting and a top-aligned legend.
          </p>
        ),
      },
      {
        id: 'line-chart/Differentiate',
        title: 'Identity without colour',
        description: (
          <p>
            <code>differentiate</code> gives each series its own marker shape and dash pattern, for
            print, colour-vision deficiency and forced-colours mode.
          </p>
        ),
      },
    ],
    interaction: [
      {
        id: 'line-chart/ZoomBrush',
        title: 'Zoom, pan and brush',
        description: (
          <p>
            Ctrl/⌘ + wheel or pinch zooms, dragging pans when zoomed, dragging on the full view
            selects a range (brush) that zooms in. Double-click or press 0 to reset. The visible
            range is controlled here through <code>xDomain</code>.
          </p>
        ),
      },
      {
        id: 'line-chart/Controlled',
        title: 'Controlled legend, active point and clicks',
        description: (
          <p>
            Toggle series in the legend, step through points with the buttons (or arrow keys when
            the chart is focused) and click a point.
          </p>
        ),
      },
      {
        id: 'line-chart/Sync',
        title: 'Synchronised charts',
        description: (
          <p>
            Charts with the same <code>syncId</code> share the crosshair and tooltip.
          </p>
        ),
      },
    ],
    responsive: [{ id: 'line-chart/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'line-chart/States', title: 'Empty, loading and error' }],
  },
  keyboard: [...CARTESIAN_KEYS, ...ZOOM_KEYS],
  props: [cartesianGroup, seriesGroup, baseGroup],
};

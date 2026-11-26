import {
  AreaChart,
  BarChart,
  ComboChart,
  DonutChart,
  GaugeChart,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  PieChart,
  RadialProgressChart,
  ScatterChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
} from '@jafari/charts';
import { memo } from 'react';
import {
  activeColors,
  kindInfo,
  legendValue,
  seriesSpec,
  tooltipValue,
  type PlaygroundConfig,
  type PlaygroundData,
} from './model';

/**
 * Renders the configured chart. Memoised: metric updates in the page never
 * re-render the chart, so they do not distort the measurements.
 */
export const Preview = memo(function Preview({
  config,
  data,
}: {
  config: PlaygroundConfig;
  data: PlaygroundData;
}) {
  const info = kindInfo(config.kind);
  const colors = activeColors(config);
  const t = tooltipValue(config);
  const tooltip = t === 'item' ? { mode: 'item' as const } : t;
  const l = legendValue(config);
  const legend = l === 'top' ? { position: 'top' as const } : l;
  const base = {
    height: config.height,
    theme: config.theme,
    animation: config.animation,
    renderer: config.renderer,
    ...(config.fillWidth ? {} : { width: config.width }),
  };

  if (data.type === 'gauge') {
    return (
      <GaugeChart
        {...base}
        value={data.value}
        label="Score"
        {...(colors?.[0] ? { color: colors[0] } : {})}
      />
    );
  }
  if (data.type === 'rings') {
    return <RadialProgressChart {...base} data={data.rows} tooltip={tooltip} />;
  }
  if (data.type === 'category') {
    if (info.kind === 'pie' || info.kind === 'donut') {
      const Pie = info.kind === 'pie' ? PieChart : DonutChart;
      return (
        <Pie
          {...base}
          data={data.rows}
          labelKey="label"
          valueKey="value"
          tooltip={tooltip}
          legend={legend}
          {...(colors ? { colors } : {})}
        />
      );
    }
    return (
      <HorizontalBarChart
        {...base}
        data={data.rows}
        xKey="label"
        yKey="value"
        tooltip={tooltip}
        {...(colors?.[0] ? { color: colors[0] } : {})}
      />
    );
  }

  const spec = seriesSpec(config);
  if (data.type === 'points') {
    const points =
      spec.mode === 'single'
        ? { yKey: 'a' as const, ...(spec.color ? { color: spec.color } : {}) }
        : { series: spec.series.map(({ type: _type, ...s }) => s) };
    return (
      <ScatterChart
        {...base}
        {...points}
        data={data.rows}
        xKey="x"
        tooltip={tooltip}
        legend={legend}
      />
    );
  }
  const series =
    spec.mode === 'single'
      ? { yKey: 'a' as const, ...(spec.color ? { color: spec.color } : {}) }
      : { series: spec.series };
  const cartesian = {
    ...base,
    ...series,
    data: data.rows,
    xKey: 'time' as const,
    tooltip,
    legend,
    ...(info.curve ? { curve: config.curve } : {}),
    ...(info.zoom && config.zoom ? { zoom: true } : {}),
  };
  switch (info.kind) {
    case 'line':
      return <LineChart {...cartesian} />;
    case 'area':
      return <AreaChart {...cartesian} />;
    case 'stacked-area':
      return <StackedAreaChart {...cartesian} />;
    case 'bar':
      return <BarChart {...cartesian} />;
    case 'grouped-bar':
      return <GroupedBarChart {...cartesian} />;
    case 'stacked-bar':
      return <StackedBarChart {...cartesian} />;
    case 'combo':
      return <ComboChart {...cartesian} />;
    case 'sparkline': {
      const { legend: _legend, ...spark } = cartesian;
      return <Sparkline {...spark} />;
    }
    default:
      return null;
  }
});

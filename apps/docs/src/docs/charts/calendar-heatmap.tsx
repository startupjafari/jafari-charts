import { CalendarHeatmap } from '@jafari/charts';
import { dailyLogins } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const calendarHeatmap: ChartDoc = {
  slug: 'calendar-heatmap',
  component: 'CalendarHeatmap',
  title: 'Calendar heatmap',
  group: 'Professional',
  summary: 'Daily activity over months or years, one cell per day.',
  description: (
    <>
      <p>
        Weeks are columns and weekdays rows, with month labels and quantised colour steps. Several
        rows on the same day are summed. The first weekday follows the locale (Sunday for{' '}
        <code>en</code>, Monday for <code>ru</code> and <code>kk</code>) and month and weekday names
        are localised.
      </p>
      <p>
        Cells size themselves to the width, up to 14 px; when a narrow container cannot fit the
        range, the most recent weeks are kept. Ranges longer than a year stack one block per year.
        Unlike cartesian charts, <code>dateKey</code> accepts numeric timestamps directly.
      </p>
    </>
  ),
  thumbnail: () => (
    <div style={{ paddingTop: 12 }}>
      <CalendarHeatmap
        data={dailyLogins.slice(-182)}
        dateKey="date"
        valueKey="logins"
        legend={false}
        tooltip={false}
        monthLabels={false}
        weekdayLabels={false}
        animation={false}
        accessibilityTable={false}
      />
    </div>
  ),
  sections: {
    usage: [
      { id: 'calendar-heatmap/Basic', title: 'A year of activity' },
      { id: 'calendar-heatmap/Localized', title: 'Localised (Russian)' },
    ],
    styling: [
      { id: 'calendar-heatmap/Styling', title: 'Hue, thresholds, month gaps and cell size' },
    ],
    interaction: [{ id: 'calendar-heatmap/Interaction', title: 'Click a day' }],
    responsive: [{ id: 'calendar-heatmap/Responsive', title: 'Narrow container', width: 320 }],
    empty: [{ id: 'calendar-heatmap/States', title: 'Empty state' }],
  },
  keyboard: [
    ['← →', 'Previous / next week'],
    ['↑ ↓', 'Previous / next day'],
    ['Home End', 'First / last day with data'],
    ['Enter', 'Click the active day (onClick)'],
    ['Esc', 'Clear the active day'],
  ],
  props: [
    {
      title: 'CalendarHeatmap props',
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: 'Rows with a date and a value.',
        },
        {
          name: 'dateKey',
          type: 'DimensionKey<T>',
          required: true,
          description: 'Day: `Date`, timestamp or ISO string ("2025-03-01" is local midnight).',
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: 'Value; several rows on one day are summed.',
        },
        {
          name: 'from / to',
          type: 'Date | string | number',
          default: 'data extent',
          description: 'First and last day shown.',
        },
        {
          name: 'weekStartsOn',
          type: 'number',
          default: 'from locale',
          description: 'First weekday row: 0 = Sunday, 1 = Monday…',
        },
        {
          name: 'buckets',
          type: 'number',
          default: '4',
          description: 'Colour steps above the empty level.',
        },
        {
          name: 'thresholds',
          type: 'readonly number[]',
          description: 'Explicit ascending step boundaries.',
        },
        { name: 'color', type: 'string', default: 'series 1', description: 'Hue of the steps.' },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: 'Concrete colour ramp, low → high.',
        },
        {
          name: 'emptyColor',
          type: 'string',
          default: 'track token',
          description: 'Fill of days without activity.',
        },
        {
          name: 'layout',
          type: "'auto' | 'continuous' | 'years'",
          default: "'auto'",
          description:
            'Continuous weeks or one block per year (auto: years for ranges over a year).',
        },
        {
          name: 'monthGap',
          type: 'boolean | number',
          default: 'false',
          description: 'Visual gap between months (`true` or px).',
        },
        { name: 'cellSize', type: 'number', default: '14', description: 'Largest cell size, px.' },
        {
          name: 'weekdayLabels',
          type: "boolean | 'all'",
          default: 'Mon/Wed/Fri',
          description: 'Weekday labels.',
        },
        { name: 'monthLabels', type: 'boolean', default: 'true', description: 'Month labels.' },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats values.',
        },
        {
          name: 'dateFormatter',
          type: '(date: Date) => string',
          description: 'Formats dates in tooltips and the table.',
        },
        {
          name: 'valueLabel',
          type: 'string',
          default: "'Value'",
          description: 'Name of the value in tooltips.',
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: 'Day tooltip.',
        },
        {
          name: 'legend',
          type: 'boolean | CalendarLegendOptions',
          default: 'true',
          description: 'Less → More scale; `lessLabel`, `moreLabel`, `position`, `align`.',
        },
        {
          name: 'onHover / onClick',
          type: '(event: CalendarDayEvent<T>) => void',
          description: 'Event with `date`, `value`, `datum`, `index`.',
        },
        { name: 'children', type: 'ReactNode', description: 'Extra primitives.' },
      ],
    },
    baseGroup,
  ],
};

import { CalendarHeatmap } from '@jafari/charts';
import { dailyLogins } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const calendarHeatmap: ChartDoc = {
  slug: 'calendar-heatmap',
  component: 'CalendarHeatmap',
  title: { en: 'Calendar heatmap', ru: 'Календарная тепловая карта' },
  group: 'Professional',
  summary: {
    en: 'Daily activity over months or years, one cell per day.',
    ru: 'Ежедневная активность за месяцы или годы — по одной ячейке на день.',
  },
  description: {
    en: (
      <>
        <p>
          Weeks are columns and weekdays rows, with month labels and quantised colour steps. Several
          rows on the same day are summed. The first weekday follows the locale (Sunday for{' '}
          <code>en</code>, Monday for <code>ru</code> and <code>kk</code>) and month and weekday
          names are localised.
        </p>
        <p>
          Cells size themselves to the width, up to 14 px; when a narrow container cannot fit the
          range, the most recent weeks are kept. Ranges longer than a year stack one block per year.
          Unlike cartesian charts, <code>dateKey</code> accepts numeric timestamps directly.
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          Недели — это столбцы, дни недели — строки; над ними подписи месяцев, а цвет меняется
          дискретными ступенями. Несколько строк данных за один день суммируются. Первый день недели
          зависит от локали (воскресенье для <code>en</code>, понедельник для <code>ru</code> и{' '}
          <code>kk</code>), названия месяцев и дней недели тоже локализуются.
        </p>
        <p>
          Размер ячеек подстраивается под ширину, но не превышает 14 px; если узкий контейнер не
          вмещает весь диапазон, остаются самые последние недели. Диапазоны длиннее года выводятся
          блоками по году, один под другим. В отличие от декартовых диаграмм, <code>dateKey</code>{' '}
          принимает числовые временные метки напрямую.
        </p>
      </>
    ),
  },
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
      {
        id: 'calendar-heatmap/Basic',
        title: { en: 'A year of activity', ru: 'Активность за год' },
      },
      {
        id: 'calendar-heatmap/Localized',
        title: { en: 'Localised (Russian)', ru: 'Локализация (русский язык)' },
      },
    ],
    styling: [
      {
        id: 'calendar-heatmap/Styling',
        title: {
          en: 'Hue, thresholds, month gaps and cell size',
          ru: 'Оттенок, пороги, промежутки между месяцами и размер ячеек',
        },
      },
    ],
    interaction: [
      {
        id: 'calendar-heatmap/Interaction',
        title: { en: 'Click a day', ru: 'Нажатие на день' },
      },
    ],
    responsive: [
      {
        id: 'calendar-heatmap/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'calendar-heatmap/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: [
    ['← →', { en: 'Previous / next week', ru: 'Предыдущая / следующая неделя' }],
    ['↑ ↓', { en: 'Previous / next day', ru: 'Предыдущий / следующий день' }],
    ['Home End', { en: 'First / last day with data', ru: 'Первый / последний день с данными' }],
    ['Enter', { en: 'Click the active day (onClick)', ru: 'Нажатие на активный день (onClick)' }],
    ['Esc', { en: 'Clear the active day', ru: 'Сбросить активный день' }],
  ],
  props: [
    {
      title: { en: 'CalendarHeatmap props', ru: 'Пропсы CalendarHeatmap' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: { en: 'Rows with a date and a value.', ru: 'Строки с датой и значением.' },
        },
        {
          name: 'dateKey',
          type: 'DimensionKey<T>',
          required: true,
          description: {
            en: 'Day: `Date`, timestamp or ISO string ("2025-03-01" is local midnight).',
            ru: 'День: `Date`, временная метка или ISO-строка ("2025-03-01" — полночь по местному времени).',
          },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: {
            en: 'Value; several rows on one day are summed.',
            ru: 'Значение; несколько строк за один день суммируются.',
          },
        },
        {
          name: 'from / to',
          type: 'Date | string | number',
          default: { en: 'data extent', ru: 'диапазон данных' },
          description: {
            en: 'First and last day shown.',
            ru: 'Первый и последний показываемые дни.',
          },
        },
        {
          name: 'weekStartsOn',
          type: 'number',
          default: { en: 'from locale', ru: 'по локали' },
          description: {
            en: 'First weekday row: 0 = Sunday, 1 = Monday…',
            ru: 'День недели в первой строке: 0 — воскресенье, 1 — понедельник…',
          },
        },
        {
          name: 'buckets',
          type: 'number',
          default: '4',
          description: {
            en: 'Colour steps above the empty level.',
            ru: 'Число цветовых ступеней сверх пустого уровня.',
          },
        },
        {
          name: 'thresholds',
          type: 'readonly number[]',
          description: {
            en: 'Explicit ascending step boundaries.',
            ru: 'Явные границы ступеней по возрастанию.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1' },
          description: { en: 'Hue of the steps.', ru: 'Оттенок ступеней.' },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Concrete colour ramp, low → high.',
            ru: 'Готовая цветовая шкала, от низких значений к высоким.',
          },
        },
        {
          name: 'emptyColor',
          type: 'string',
          default: { en: 'track token', ru: 'токен track' },
          description: {
            en: 'Fill of days without activity.',
            ru: 'Заливка дней без активности.',
          },
        },
        {
          name: 'layout',
          type: "'auto' | 'continuous' | 'years'",
          default: "'auto'",
          description: {
            en: 'Continuous weeks or one block per year (auto: years for ranges over a year).',
            ru: 'Сплошная лента недель или по блоку на год (auto: блоки по годам для диапазонов длиннее года).',
          },
        },
        {
          name: 'monthGap',
          type: 'boolean | number',
          default: 'false',
          description: {
            en: 'Visual gap between months (`true` or px).',
            ru: 'Визуальный промежуток между месяцами (`true` или px).',
          },
        },
        {
          name: 'cellSize',
          type: 'number',
          default: '14',
          description: { en: 'Largest cell size, px.', ru: 'Максимальный размер ячейки, px.' },
        },
        {
          name: 'weekdayLabels',
          type: "boolean | 'all'",
          default: { en: 'Mon/Wed/Fri', ru: 'Пн/Ср/Пт' },
          description: { en: 'Weekday labels.', ru: 'Подписи дней недели.' },
        },
        {
          name: 'monthLabels',
          type: 'boolean',
          default: 'true',
          description: { en: 'Month labels.', ru: 'Подписи месяцев.' },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: { en: 'Formats values.', ru: 'Форматирует значения.' },
        },
        {
          name: 'dateFormatter',
          type: '(date: Date) => string',
          description: {
            en: 'Formats dates in tooltips and the table.',
            ru: 'Форматирует даты в подсказках и таблице.',
          },
        },
        {
          name: 'valueLabel',
          type: 'string',
          default: { en: "'Value'", ru: "'Значение' (для ru)" },
          description: {
            en: 'Name of the value in tooltips.',
            ru: 'Название значения в подсказках.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: { en: 'Day tooltip.', ru: 'Подсказка для дня.' },
        },
        {
          name: 'legend',
          type: 'boolean | CalendarLegendOptions',
          default: 'true',
          description: {
            en: 'Less → More scale; `lessLabel`, `moreLabel`, `position`, `align`.',
            ru: 'Шкала «Меньше → Больше»; `lessLabel`, `moreLabel`, `position`, `align`.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: CalendarDayEvent<T>) => void',
          description: {
            en: 'Event with `date`, `value`, `datum`, `index`.',
            ru: 'Событие с полями `date`, `value`, `datum`, `index`.',
          },
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: { en: 'Extra primitives.', ru: 'Дополнительные примитивы.' },
        },
      ],
    },
    baseGroup,
  ],
};

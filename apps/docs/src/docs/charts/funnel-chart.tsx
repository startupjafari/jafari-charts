import { FunnelChart } from '@startupjafari/charts';
import { admissions } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const funnelChart: ChartDoc = {
  slug: 'funnel-chart',
  component: 'FunnelChart',
  title: { en: 'Funnel chart', ru: 'Воронка' },
  group: 'Advanced',
  summary: {
    en: 'Conversion through ordered stages, with percentages and drop-off.',
    ru: 'Конверсия по последовательным этапам — с процентами и потерями.',
  },
  description: {
    en: (
      <p>
        One row per stage, in funnel order. Each stage shows its value and its share of the first
        stage (or of the previous one with <code>percentBase="previous"</code>); the loss between
        stages is labelled where there is room. The default <code>bars</code> variant keeps values
        readable; <code>trapezoid</code> draws a continuous funnel. Default height grows with the
        number of stages (52 px each, 160–440 px).
      </p>
    ),
    ru: (
      <p>
        Одна строка данных на этап, в порядке воронки. Для каждого этапа показываются значение и
        доля от первого этапа (или от предыдущего при <code>percentBase="previous"</code>); потери
        между этапами подписываются, если хватает места. Вариант по умолчанию, <code>bars</code>,
        сохраняет значения читаемыми; <code>trapezoid</code> рисует сплошную воронку. Высота по
        умолчанию растёт с числом этапов (по 52 px на этап, в пределах 160–440 px).
      </p>
    ),
  },
  thumbnail: () => (
    <FunnelChart
      data={admissions}
      labelKey="stage"
      valueKey="count"
      height={120}
      labels={false}
      dropOff={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      { id: 'funnel-chart/Basic', title: { en: 'Bars (default)', ru: 'Полосы (по умолчанию)' } },
      { id: 'funnel-chart/Trapezoid', title: { en: 'Trapezoid', ru: 'Трапеция' } },
      {
        id: 'funnel-chart/Horizontal',
        title: {
          en: 'Horizontal, step conversion',
          ru: 'Горизонтальная ориентация, конверсия от предыдущего этапа',
        },
      },
    ],
    styling: [
      {
        id: 'funnel-chart/Styling',
        title: {
          en: 'Colours by stage and formatting',
          ru: 'Цвета по этапам и форматирование',
        },
      },
    ],
    interaction: [
      { id: 'funnel-chart/Interaction', title: { en: 'Click a stage', ru: 'Нажатие на этап' } },
    ],
    responsive: [
      {
        id: 'funnel-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'funnel-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: { en: 'FunnelChart props', ru: 'Пропсы FunnelChart' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per stage, in funnel order.',
            ru: 'Одна строка на этап, в порядке воронки.',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: { en: 'Field naming each stage.', ru: 'Поле с названием этапа.' },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: { en: "Each stage's value.", ru: 'Поле со значением этапа.' },
        },
        {
          name: 'variant',
          type: "'bars' | 'trapezoid'",
          default: "'bars'",
          description: {
            en: 'Centred bars with soft connectors, or a continuous funnel.',
            ru: 'Полосы по центру с мягкими соединителями или сплошная воронка.',
          },
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: {
            en: 'Stages top → bottom or left → right.',
            ru: 'Этапы сверху вниз или слева направо.',
          },
        },
        {
          name: 'percentBase',
          type: "'first' | 'previous'",
          default: "'first'",
          description: {
            en: 'Percentages relative to the first or the previous stage.',
            ru: 'Проценты относительно первого или предыдущего этапа.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1' },
          description: { en: 'Colour of every stage.', ru: 'Цвет всех этапов.' },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Colours by stage position (overrides `color`).',
            ru: 'Цвета по порядку этапов (заменяют `color`).',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Stage names and values on the chart.',
            ru: 'Названия и значения этапов на диаграмме.',
          },
        },
        {
          name: 'dropOff',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Loss labels between stages when there is room.',
            ru: 'Подписи потерь между этапами, если хватает места.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: { en: 'Formats values.', ru: 'Форматирует значения.' },
        },
        {
          name: 'percentFormatter',
          type: '(ratio: number) => string',
          description: {
            en: 'Formats ratios (0.25 → "25%").',
            ru: 'Форматирует доли (0.25 → "25%").',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Stage tooltip with conversion and drop-off.',
            ru: 'Подсказка этапа с конверсией и потерями.',
          },
        },
        {
          name: 'texts',
          type: 'Partial<FunnelTexts>',
          description: {
            en: 'Overrides for `stage`, `ofFirst`, `ofPrevious`, `dropOff` (built in for en, ru, kk).',
            ru: 'Переопределения текстов `stage`, `ofFirst`, `ofPrevious`, `dropOff` (встроены для en, ru, kk).',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: { en: 'Controlled active stage.', ru: 'Контролируемый активный этап.' },
        },
        {
          name: 'onHover / onClick',
          type: '(event: FunnelStageEvent<T>) => void',
          description: {
            en: 'Event with `value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate`.',
            ru: 'Событие с полями `value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate`.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

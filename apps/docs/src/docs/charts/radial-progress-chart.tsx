import { RadialProgressChart } from '@startupjafari/charts';
import { completion } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const radialProgressChart: ChartDoc = {
  slug: 'radial-progress-chart',
  component: 'RadialProgressChart',
  title: { en: 'Radial progress chart', ru: 'Радиальный индикатор прогресса' },
  group: 'Core',
  summary: {
    en: 'Progress towards one or more targets as concentric rings.',
    ru: 'Прогресс к одной или нескольким целям в виде концентрических колец.',
  },
  description: {
    en: (
      <p>
        Use <code>value</code>/<code>max</code>/<code>label</code> for a single ring or{' '}
        <code>data</code> for several (outermost first). The centre shows the first ring’s
        percentage. Several rings get a legend and a tooltip automatically.
      </p>
    ),
    ru: (
      <p>
        Для одного кольца используйте <code>value</code>/<code>max</code>/<code>label</code>, для
        нескольких — <code>data</code> (начиная с внешнего). В центре показывается процент первого
        кольца. При нескольких кольцах легенда и подсказка появляются автоматически.
      </p>
    ),
  },
  thumbnail: () => <RadialProgressChart data={completion} {...THUMB_POLAR} centerValue={null} />,
  sections: {
    usage: [
      {
        id: 'radial-progress-chart/Basic',
        title: { en: 'Single ring', ru: 'Одно кольцо' },
      },
      {
        id: 'radial-progress-chart/Rings',
        title: { en: 'Several rings', ru: 'Несколько колец' },
      },
    ],
    styling: [
      {
        id: 'radial-progress-chart/Styling',
        title: {
          en: 'Arc variant, thickness, colours, centre',
          ru: 'Вариант с дугой, толщина, цвета, центр',
        },
      },
    ],
    interaction: [
      {
        id: 'radial-progress-chart/Interaction',
        title: { en: 'Animated updates', ru: 'Анимированные обновления' },
      },
    ],
    responsive: [
      {
        id: 'radial-progress-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'radial-progress-chart/States',
        title: { en: 'Loading and error', ru: 'Загрузка и ошибка' },
      },
    ],
  },
  sectionNotes: {
    empty: {
      en: (
        <p>
          A radial progress chart always draws at least one ring (an empty <code>data</code> array
          falls back to the single-ring props), so there is no “no data” state — show{' '}
          <code>loading</code> while the value is unknown.
        </p>
      ),
      ru: (
        <p>
          Радиальный индикатор прогресса всегда рисует хотя бы одно кольцо (при пустом массиве{' '}
          <code>data</code> используются пропсы одиночного кольца), поэтому состояния «нет данных» у
          него нет — пока значение неизвестно, показывайте <code>loading</code>.
        </p>
      ),
    },
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: { en: 'RadialProgressChart props', ru: 'Пропсы RadialProgressChart' },
      props: [
        {
          name: 'value',
          type: 'number',
          default: '0',
          description: {
            en: 'Single ring shortcut: current value.',
            ru: 'Сокращение для одного кольца: текущее значение.',
          },
        },
        {
          name: 'max',
          type: 'number',
          default: '100',
          description: {
            en: 'Target of the single ring.',
            ru: 'Целевое значение одиночного кольца.',
          },
        },
        {
          name: 'label',
          type: 'string',
          default: { en: "'Value'", ru: "'Значение' (для ru)" },
          description: { en: 'Label of the single ring.', ru: 'Название одиночного кольца.' },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1' },
          description: { en: 'Colour of the single ring.', ru: 'Цвет одиночного кольца.' },
        },
        {
          name: 'data',
          type: 'readonly ProgressItem[]',
          description: {
            en: 'Several rings, outermost first: `{ label, value, max?, color? }`.',
            ru: 'Несколько колец, начиная с внешнего: `{ label, value, max?, color? }`.',
          },
        },
        {
          name: 'thickness',
          type: 'number',
          default: { en: 'auto', ru: 'авто' },
          description: { en: 'Ring thickness, px.', ru: 'Толщина кольца, px.' },
        },
        {
          name: 'gap',
          type: 'number',
          default: { en: '4 (several rings)', ru: '4 (несколько колец)' },
          description: { en: 'Gap between rings, px.', ru: 'Зазор между кольцами, px.' },
        },
        {
          name: 'variant',
          type: "'full' | 'arc'",
          default: "'full'",
          description: { en: 'Full circle or a 270° arc.', ru: 'Полное кольцо или дуга в 270°.' },
        },
        {
          name: 'centerValue',
          type: 'ReactNode',
          default: { en: "first ring's %", ru: '% первого кольца' },
          description: {
            en: 'Centre text. `null` hides it.',
            ru: 'Текст в центре. `null` скрывает его.',
          },
        },
        {
          name: 'centerLabel',
          type: 'ReactNode',
          description: {
            en: 'Caption under the centre value.',
            ru: 'Подпись под значением в центре.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number, max: number) => string',
          default: { en: 'percent', ru: 'проценты' },
          description: {
            en: 'Formats the centre, legend and table values.',
            ru: 'Форматирует значения в центре, в легенде и в таблице данных.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: { en: '2+ rings', ru: 'от 2 колец' },
          description: { en: 'Tooltip per ring.', ru: 'Подсказка для каждого кольца.' },
        },
        {
          name: 'legend',
          type: 'boolean',
          default: { en: '2+ rings', ru: 'от 2 колец' },
          description: {
            en: 'Non-interactive legend with values.',
            ru: 'Неинтерактивная легенда со значениями.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

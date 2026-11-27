import { RadarChart } from '@startupjafari/charts';
import { profiles } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const radarChart: ChartDoc = {
  slug: 'radar-chart',
  component: 'RadarChart',
  title: { en: 'Radar chart', ru: 'Лепестковая диаграмма', kk: 'Радар диаграммасы' },
  group: 'Advanced',
  summary: {
    en: 'Compare a few profiles across several metrics on radial spokes.',
    ru: 'Сравнение нескольких профилей по нескольким метрикам, отложенным на радиальных лучах.',
    kk: 'Радиалды сәулелерге салынған бірнеше метрика бойынша бірнеше профильді салыстыру.',
  },
  description: {
    en: (
      <p>
        Each data row is a metric (a spoke); each entry of <code>series</code> is a dataset drawn as
        a polygon. Rings sit at nice values; the scale starts at zero unless values are negative.
        Hovering a spoke shows every dataset’s value for that metric.
      </p>
    ),
    ru: (
      <p>
        Каждая строка данных — это метрика (луч), а каждая запись <code>series</code> — набор
        данных, который рисуется многоугольником. Кольца сетки проходят по круглым значениям; шкала
        начинается с нуля, если среди значений нет отрицательных. При наведении на луч показываются
        значения всех наборов данных для этой метрики.
      </p>
    ),
    kk: (
      <p>
        Деректердің әр жолы — метрика (сәуле), ал <code>series</code> ішіндегі әр жазба — көпбұрыш
        болып салынатын деректер жиыны. Тор сақиналары дөңгелек мәндерден өтеді; мәндер арасында
        теріс сан болмаса, шкала нөлден басталады. Сәулеге меңзерді апарғанда осы метрика бойынша
        барлық деректер жиынының мәндері көрсетіледі.
      </p>
    ),
  },
  thumbnail: () => (
    <RadarChart
      data={profiles}
      labelKey="metric"
      series={[{ key: 'north' }, { key: 'south' }]}
      height={120}
      ticks={false}
      dots={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'radar-chart/Basic',
        title: { en: 'One dataset', ru: 'Один набор данных', kk: 'Бір деректер жиыны' },
      },
      {
        id: 'radar-chart/Compare',
        title: {
          en: 'Comparing datasets',
          ru: 'Сравнение наборов данных',
          kk: 'Деректер жиындарын салыстыру',
        },
      },
    ],
    styling: [
      {
        id: 'radar-chart/Styling',
        title: {
          en: 'Circular grid, fills, shapes and start angle',
          ru: 'Круглая сетка, заливки, формы и начальный угол',
          kk: 'Дөңгелек тор, бояу, пішіндер және бастапқы бұрыш',
        },
      },
    ],
    interaction: [
      {
        id: 'radar-chart/Interaction',
        title: {
          en: 'Controlled active metric',
          ru: 'Контролируемая активная метрика',
          kk: 'Басқарылатын белсенді метрика',
        },
      },
    ],
    responsive: [
      {
        id: 'radar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'radar-chart/States', title: { en: 'Loading', ru: 'Загрузка', kk: 'Жүктелу' } }],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next metric (spoke)',
        ru: 'Предыдущая / следующая метрика (луч)',
        kk: 'Алдыңғы / келесі метрика (сәуле)',
      },
    ],
    [
      '↑ ↓',
      {
        en: 'Focus one dataset at the metric',
        ru: 'Фокус на одном наборе данных в этой метрике',
        kk: 'Осы метрикадағы бір деректер жиынына фокус қою',
      },
    ],
    [
      'Home End',
      {
        en: 'First / last metric',
        ru: 'Первая / последняя метрика',
        kk: 'Бірінші / соңғы метрика',
      },
    ],
    ['Enter', { en: 'Click (onClick)', ru: 'Нажатие (onClick)', kk: 'Басу (onClick)' }],
    ['Esc', { en: 'Clear', ru: 'Сбросить', kk: 'Тазалау' }],
  ],
  props: [
    {
      title: { en: 'RadarChart props', ru: 'Пропсы RadarChart', kk: 'RadarChart пропстары' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per metric (spoke).',
            ru: 'Одна строка на метрику (луч).',
            kk: 'Әр метрикаға (сәулеге) бір жол.',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: {
            en: 'Field naming each metric.',
            ru: 'Поле с названием метрики.',
            kk: 'Метрика атауы бар өріс.',
          },
        },
        {
          name: 'series',
          type: 'readonly { key; label?; color?; symbol?; format? }[]',
          required: true,
          description: {
            en: 'Datasets drawn as polygons.',
            ru: 'Наборы данных, которые рисуются многоугольниками.',
            kk: 'Көпбұрыш болып салынатын деректер жиындары.',
          },
        },
        {
          name: 'min',
          type: 'number',
          default: '0',
          description: {
            en: 'Value at the centre (a nice minimum for negative data).',
            ru: 'Значение в центре (для отрицательных данных — округлённый минимум).',
            kk: 'Ортадағы мән (теріс деректерде — дөңгелектенген ең аз мән).',
          },
        },
        {
          name: 'max',
          type: 'number',
          default: {
            en: 'nice maximum',
            ru: 'округлённый максимум',
            kk: 'дөңгелектенген ең көп мән',
          },
          description: {
            en: 'Value at the outer ring.',
            ru: 'Значение на внешнем кольце.',
            kk: 'Сыртқы сақинадағы мән.',
          },
        },
        {
          name: 'levels',
          type: 'number',
          default: {
            en: '4–5 nice rings',
            ru: '4–5 колец по круглым значениям',
            kk: 'дөңгелек мәндер бойынша 4–5 сақина',
          },
          description: {
            en: 'Number of grid rings.',
            ru: 'Количество колец сетки.',
            kk: 'Тор сақиналарының саны.',
          },
        },
        {
          name: 'shape',
          type: "'polygon' | 'circle'",
          default: "'polygon'",
          description: {
            en: 'Grid ring shape.',
            ru: 'Форма колец сетки.',
            kk: 'Тор сақиналарының пішіні.',
          },
        },
        {
          name: 'dots',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Markers on every vertex.',
            ru: 'Маркеры в каждой вершине.',
            kk: 'Әр төбедегі маркерлер.',
          },
        },
        {
          name: 'fillOpacity',
          type: 'number',
          default: '0.14',
          description: {
            en: 'Polygon fill opacity.',
            ru: 'Непрозрачность заливки многоугольников.',
            kk: 'Көпбұрыштар бояуының мөлдірсіздігі.',
          },
        },
        {
          name: 'startAngle',
          type: 'number',
          default: '0',
          description: {
            en: "Angle of the first spoke, degrees clockwise from 12 o'clock.",
            ru: 'Угол первого луча в градусах, по часовой стрелке от отметки «12 часов».',
            kk: 'Бірінші сәуленің бұрышы, градуспен, «сағат 12» белгісінен сағат тілі бағытымен.',
          },
        },
        {
          name: 'ticks',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Value labels along the first spoke.',
            ru: 'Подписи значений вдоль первого луча.',
            kk: 'Бірінші сәуле бойындағы мән жазулары.',
          },
        },
        {
          name: 'tickFormatter',
          type: '(value: number) => string',
          description: {
            en: 'Formats ring labels.',
            ru: 'Форматирует подписи колец.',
            kk: 'Сақина жазуларын пішімдейді.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number, series: string) => string',
          description: {
            en: 'Formats values in tooltips and the table.',
            ru: 'Форматирует значения в подсказках и таблице данных.',
            kk: 'Қалқымалы кеңестер мен деректер кестесіндегі мәндерді пішімдейді.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Tooltip per metric.',
            ru: 'Подсказка для каждой метрики.',
            kk: 'Әр метрикаға арналған қалқымалы кеңес.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: {
            en: '2+ datasets',
            ru: 'от 2 наборов данных',
            kk: '2 деректер жиынынан бастап',
          },
          description: {
            en: 'Legend; items toggle datasets.',
            ru: 'Легенда; её элементы скрывают и показывают наборы данных.',
            kk: 'Шартты белгілер; олардың элементтері деректер жиындарын жасырады және көрсетеді.',
          },
        },
        {
          name: 'differentiate',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Marker shapes and dash patterns per dataset.',
            ru: 'Свои формы маркеров и типы штриховки для каждого набора данных.',
            kk: 'Әр деректер жиынына маркерлердің өз пішіні мен пунктир түрі.',
          },
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: {
            en: 'Controlled or initial hidden datasets.',
            ru: 'Скрытые наборы данных: контролируемый или начальный список.',
            kk: 'Жасырылған деректер жиындары: басқарылатын немесе бастапқы тізім.',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active metric index.',
            ru: 'Контролируемый индекс активной метрики.',
            kk: 'Белсенді метриканың басқарылатын индексі.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: RadarEvent<T>) => void',
          description: {
            en: 'Event with `datum`, `index`, `label`, `series`, `value`.',
            ru: 'Событие с `datum`, `index`, `label`, `series`, `value`.',
            kk: '`datum`, `index`, `label`, `series`, `value` өрістері бар оқиға.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

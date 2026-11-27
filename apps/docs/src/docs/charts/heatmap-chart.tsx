import { HeatmapChart } from '@startupjafari/charts';
import { sessionsByHour } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const heatmapChart: ChartDoc = {
  slug: 'heatmap-chart',
  component: 'HeatmapChart',
  title: { en: 'Heatmap', ru: 'Тепловая карта', kk: 'Жылу картасы' },
  group: 'Advanced',
  summary: {
    en: 'A value for every pair of two categories, as a grid of coloured cells.',
    ru: 'Значение для каждого сочетания двух категорий в виде сетки цветных ячеек.',
    kk: 'Екі санаттың әр жұбына арналған мән — түсті ұяшықтар торы түрінде.',
  },
  description: {
    en: (
      <p>
        Columns come from <code>xKey</code>, rows from <code>yKey</code>; several rows for the same
        cell are summed and missing cells use the track colour. Values are quantised into colour
        steps (5 by default) on a sequential scale, or a diverging scale for signed data. All cells
        of a colour step are drawn as one path, so a large grid stays a handful of DOM nodes.
      </p>
    ),
    ru: (
      <p>
        Столбцы берутся из <code>xKey</code>, строки — из <code>yKey</code>; несколько строк данных
        для одной ячейки суммируются, а отсутствующие ячейки закрашиваются цветом подложки (track).
        Значения разбиваются на цветовые ступени (по умолчанию 5) последовательной шкалы, а для
        данных со знаком — расходящейся. Все ячейки одной цветовой ступени рисуются одним путём,
        поэтому даже большая сетка состоит всего из нескольких DOM-узлов.
      </p>
    ),
    kk: (
      <p>
        Бағандар <code>xKey</code> өрісінен, жолдар <code>yKey</code> өрісінен алынады; бір ұяшыққа
        келетін бірнеше деректер жолы қосылады, ал жоқ ұяшықтар астар (track) түсімен боялады.
        Мәндер бірізді шкаланың түс сатыларына (әдепкі 5) бөлінеді, ал оң және теріс мәндері бар
        деректер үшін екі бағытты шкала қолданылады. Бір түс сатысындағы барлық ұяшық бір контурмен
        (path) салынады, сондықтан үлкен тордың өзі бірнеше DOM түйінінен ғана тұрады.
      </p>
    ),
  },
  thumbnail: () => (
    <HeatmapChart
      data={sessionsByHour}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'heatmap-chart/Basic',
        title: { en: 'Sequential scale', ru: 'Последовательная шкала', kk: 'Бірізді шкала' },
      },
      {
        id: 'heatmap-chart/Diverging',
        title: {
          en: 'Diverging scale with labels',
          ru: 'Расходящаяся шкала с подписями',
          kk: 'Жазулары бар екі бағытты шкала',
        },
      },
    ],
    styling: [
      {
        id: 'heatmap-chart/Styling',
        title: {
          en: 'Colour ramp, thresholds, gaps and radius',
          ru: 'Цветовая шкала, пороги, зазоры и скругление',
          kk: 'Түс шкаласы, шектер, аралықтар және бұрыштарды дөңгелектеу',
        },
      },
    ],
    interaction: [
      {
        id: 'heatmap-chart/Interaction',
        title: { en: 'Click a cell', ru: 'Нажатие на ячейку', kk: 'Ұяшықты басу' },
      },
    ],
    responsive: [
      {
        id: 'heatmap-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'heatmap-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next column',
        ru: 'Предыдущий / следующий столбец',
        kk: 'Алдыңғы / келесі баған',
      },
    ],
    [
      '↑ ↓',
      {
        en: 'Previous / next row',
        ru: 'Предыдущая / следующая строка',
        kk: 'Алдыңғы / келесі жол',
      },
    ],
    [
      'Home End',
      { en: 'First / last cell', ru: 'Первая / последняя ячейка', kk: 'Бірінші / соңғы ұяшық' },
    ],
    [
      'Enter',
      {
        en: 'Click the active cell (onClick)',
        ru: 'Нажатие на активную ячейку (onClick)',
        kk: 'Белсенді ұяшықты басу (onClick)',
      },
    ],
    [
      'Esc',
      {
        en: 'Clear the active cell',
        ru: 'Сбросить активную ячейку',
        kk: 'Белсенді ұяшықты алып тастау',
      },
    ],
  ],
  props: [
    {
      title: { en: 'HeatmapChart props', ru: 'Пропсы HeatmapChart', kk: 'HeatmapChart пропстары' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per cell (duplicates are summed).',
            ru: 'Одна строка на ячейку (повторы суммируются).',
            kk: 'Әр ұяшыққа бір жол (қайталанатындары қосылады).',
          },
        },
        {
          name: 'xKey',
          type: 'DimensionKey<T>',
          required: true,
          description: {
            en: 'Column category (strings, numbers or dates).',
            ru: 'Категория столбца (строки, числа или даты).',
            kk: 'Баған санаты (мәтін, сандар немесе күндер).',
          },
        },
        {
          name: 'yKey',
          type: 'DimensionKey<T>',
          required: true,
          description: { en: 'Row category.', ru: 'Категория строки.', kk: 'Жол санаты.' },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: { en: 'Cell value.', ru: 'Значение ячейки.', kk: 'Ұяшық мәні.' },
        },
        {
          name: 'xCategories / yCategories',
          type: 'readonly AxisValue[]',
          description: {
            en: 'Column/row order and empty columns/rows (default: first appearance; numbers and dates sort).',
            ru: 'Порядок столбцов/строк и пустые столбцы/строки (по умолчанию — в порядке первого появления; числа и даты сортируются).',
            kk: 'Бағандар/жолдар реті және бос бағандар/жолдар (әдепкі — алғаш пайда болу реті; сандар мен күндер сұрыпталады).',
          },
        },
        {
          name: 'colorScale',
          type: "'sequential' | 'diverging'",
          default: "'sequential'",
          description: {
            en: 'One hue, or two hues around `midpoint`.',
            ru: 'Один оттенок или два оттенка по обе стороны от `midpoint`.',
            kk: 'Бір реңк немесе `midpoint` мәнінің екі жағында екі реңк.',
          },
        },
        {
          name: 'buckets',
          type: 'number',
          default: '5',
          description: {
            en: 'Number of colour steps.',
            ru: 'Количество цветовых ступеней.',
            kk: 'Түс сатыларының саны.',
          },
        },
        {
          name: 'thresholds',
          type: 'readonly number[]',
          description: {
            en: 'Explicit ascending step boundaries (n thresholds → n + 1 steps).',
            ru: 'Явные границы ступеней по возрастанию (n порогов → n + 1 ступеней).',
            kk: 'Өсу ретімен берілген сатылардың нақты шекаралары (n шек → n + 1 саты).',
          },
        },
        {
          name: 'domain',
          type: 'readonly [number, number]',
          default: { en: 'data extent', ru: 'диапазон данных', kk: 'деректер диапазоны' },
          description: {
            en: 'Value domain of the colour scale.',
            ru: 'Область значений цветовой шкалы.',
            kk: 'Түс шкаласының мәндер ауқымы.',
          },
        },
        {
          name: 'midpoint',
          type: 'number',
          default: '0',
          description: {
            en: 'Neutral value of the diverging scale.',
            ru: 'Нейтральная точка расходящейся шкалы.',
            kk: 'Екі бағытты шкаланың бейтарап нүктесі.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1', kk: '1-қатардың түсі' },
          description: {
            en: 'Sequential hue.',
            ru: 'Оттенок последовательной шкалы.',
            kk: 'Бірізді шкаланың реңкі.',
          },
        },
        {
          name: 'negativeColor / positiveColor',
          type: 'string',
          description: {
            en: 'Diverging hues.',
            ru: 'Оттенки расходящейся шкалы.',
            kk: 'Екі бағытты шкаланың реңктері.',
          },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Concrete colour ramp, low → high.',
            ru: 'Явная цветовая шкала, от меньших значений к большим.',
            kk: 'Дайын түс шкаласы, кіші мәндерден үлкеніне қарай.',
          },
        },
        {
          name: 'emptyColor',
          type: 'string',
          default: { en: 'track token', ru: 'токен track', kk: 'track токені' },
          description: {
            en: 'Fill of missing cells.',
            ru: 'Заливка отсутствующих ячеек.',
            kk: 'Деректері жоқ ұяшықтардың бояуы.',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Value labels inside cells where they fit.',
            ru: 'Подписи значений внутри ячеек, если они помещаются.',
            kk: 'Сыйған жағдайда ұяшық ішіндегі мән жазулары.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: {
            en: 'Formats values.',
            ru: 'Форматирует значения.',
            kk: 'Мәндерді пішімдейді.',
          },
        },
        {
          name: 'xFormatter / yFormatter',
          type: '(value: AxisValue) => string',
          description: {
            en: 'Formats category labels.',
            ru: 'Форматирует подписи категорий.',
            kk: 'Санат жазуларын пішімдейді.',
          },
        },
        {
          name: 'valueLabel',
          type: 'string',
          default: { en: "'Value'", ru: "'Значение' (для ru)", kk: "'Мән' (kk үшін)" },
          description: {
            en: 'Name of the value in tooltips.',
            ru: 'Название значения в подсказках.',
            kk: 'Қалқымалы кеңестердегі мәннің атауы.',
          },
        },
        {
          name: 'gap',
          type: 'number',
          default: '2',
          description: {
            en: 'Gap between cells, px.',
            ru: 'Зазор между ячейками, px.',
            kk: 'Ұяшықтар арасындағы аралық, px.',
          },
        },
        {
          name: 'cornerRadius',
          type: 'number',
          description: {
            en: 'Cell corner radius, px.',
            ru: 'Радиус скругления углов ячеек, px.',
            kk: 'Ұяшық бұрыштарын дөңгелектеу радиусы, px.',
          },
        },
        {
          name: 'xAxis / yAxis',
          type: 'boolean | { hidden?; maxLabelWidth?; title? }',
          default: 'true',
          description: {
            en: 'Category axes; long labels are truncated.',
            ru: 'Оси категорий; длинные подписи обрезаются.',
            kk: 'Санат осьтері; ұзын жазулар қысқартылады.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Cell tooltip.',
            ru: 'Подсказка для ячейки.',
            kk: 'Ұяшыққа арналған қалқымалы кеңес.',
          },
        },
        {
          name: 'legend',
          type: "boolean | Omit<LegendOptions, 'render' | 'interactive'>",
          default: 'true',
          description: {
            en: 'Colour-scale legend.',
            ru: 'Легенда цветовой шкалы.',
            kk: 'Түс шкаласының шартты белгілері.',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active datum index.',
            ru: 'Контролируемый индекс активной строки данных.',
            kk: 'Белсенді деректер жолының басқарылатын индексі.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: HeatmapCellEvent<T>) => void',
          description: {
            en: 'Event with `datum`, `x`, `y`, labels, indices and `value`.',
            ru: 'Событие с `datum`, `x`, `y`, подписями, индексами и `value`.',
            kk: '`datum`, `x`, `y`, жазулар, индекстер және `value` өрістері бар оқиға.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

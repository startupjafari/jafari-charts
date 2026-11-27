import { ScatterChart } from '@startupjafari/charts';
import { cohort } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const scatterChart: ChartDoc = {
  slug: 'scatter-chart',
  component: 'ScatterChart',
  title: { en: 'Scatter chart', ru: 'Точечная диаграмма', kk: 'Нүктелік диаграмма' },
  group: 'Advanced',
  summary: {
    en: 'Relationships between two numeric measures, with groups and bubble sizes.',
    ru: 'Связь между двумя числовыми показателями — с группами и размером пузырьков.',
    kk: 'Екі сандық көрсеткіш арасындағы байланыс — топтармен және көпіршік өлшемімен.',
  },
  description: {
    en: (
      <>
        <p>
          Both axes are continuous. Points can be split into groups by a field (
          <code>groupKey</code>, long data) or by several y fields (<code>series</code>, wide data);{' '}
          <code>sizeKey</code> turns the chart into a bubble chart whose bubble <em>area</em> is
          proportional to the value.
        </p>
        <p>
          Hit testing uses a k-d tree, so hovering stays fast with 100 000 points. With{' '}
          <code>renderer="auto"</code> the chart draws on a canvas above 75 000 points — the
          crossover measured for scatter plots.
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          Обе оси непрерывные. Точки можно разбить на группы по полю (<code>groupKey</code>,
          «длинный» формат данных) или по нескольким полям Y (<code>series</code>, «широкий»
          формат); <code>sizeKey</code> превращает диаграмму в пузырьковую, где <em>площадь</em>{' '}
          пузырька пропорциональна значению.
        </p>
        <p>
          Для поиска элемента под указателем используется k-d-дерево, поэтому наведение остаётся
          быстрым даже на 100 000 точек. С <code>renderer="auto"</code> диаграмма переходит на
          canvas, когда точек больше 75 000, — это порог, измеренный для точечных диаграмм.
        </p>
      </>
    ),
    kk: (
      <>
        <p>
          Екі ось те үздіксіз. Нүктелерді өріс бойынша (<code>groupKey</code>, «ұзын» деректер
          пішімі) немесе бірнеше Y өрісі бойынша (<code>series</code>, «кең» пішім) топтарға бөлуге
          болады; <code>sizeKey</code> диаграмманы көпіршікті диаграммаға айналдырады, онда
          көпіршіктің <em>ауданы</em> мәнге пропорционал.
        </p>
        <p>
          Меңзер астындағы элементті табу үшін k-d ағашы қолданылады, сондықтан 100 000 нүктеде де
          меңзерді апару жылдам жұмыс істейді. <code>renderer="auto"</code> болғанда нүкте саны 75
          000-нан асса, диаграмма canvas-қа ауысады — бұл нүктелік диаграммалар үшін өлшенген шек.
        </p>
      </>
    ),
  },
  thumbnail: () => (
    <ScatterChart
      data={cohort}
      xKey="hours"
      yKey="grade"
      groupKey="faculty"
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
      pointSize={5}
    />
  ),
  sections: {
    usage: [
      {
        id: 'scatter-chart/Basic',
        title: { en: 'Basic', ru: 'Базовый пример', kk: 'Негізгі мысал' },
      },
      {
        id: 'scatter-chart/Groups',
        title: { en: 'Groups from a field', ru: 'Группы по полю', kk: 'Өріс бойынша топтар' },
      },
      { id: 'scatter-chart/Bubbles', title: { en: 'Bubbles', ru: 'Пузырьки', kk: 'Көпіршіктер' } },
      {
        id: 'scatter-chart/ManyPoints',
        title: { en: '100 000 points', ru: '100 000 точек', kk: '100 000 нүкте' },
      },
    ],
    styling: [
      {
        id: 'scatter-chart/Styling',
        title: {
          en: 'Shapes, colours, opacity, axes and a reference line',
          ru: 'Формы, цвета, прозрачность, оси и опорная линия',
          kk: 'Пішіндер, түстер, мөлдірсіздік, осьтер және тірек сызық',
        },
      },
    ],
    interaction: [
      {
        id: 'scatter-chart/Interaction',
        title: {
          en: 'Clicks and legend toggling',
          ru: 'Нажатия и переключение рядов в легенде',
          kk: 'Басу және шартты белгілерде топтарды ауыстыру',
        },
      },
    ],
    responsive: [
      {
        id: 'scatter-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'scatter-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next point (in x order) within the group',
        ru: 'Предыдущая / следующая точка группы (в порядке X)',
        kk: 'Топтағы алдыңғы / келесі нүкте (X реті бойынша)',
      },
    ],
    [
      '↑ ↓',
      {
        en: 'Previous / next group',
        ru: 'Предыдущая / следующая группа',
        kk: 'Алдыңғы / келесі топ',
      },
    ],
    [
      'Home End',
      {
        en: 'First / last point of the group',
        ru: 'Первая / последняя точка группы',
        kk: 'Топтың бірінші / соңғы нүктесі',
      },
    ],
    [
      'Enter',
      {
        en: 'Click the active point (onClick)',
        ru: 'Нажатие на активную точку (onClick)',
        kk: 'Белсенді нүктені басу (onClick)',
      },
    ],
    [
      'Esc',
      {
        en: 'Clear the active point',
        ru: 'Сбросить активную точку',
        kk: 'Белсенді нүктені алып тастау',
      },
    ],
  ],
  props: [
    {
      title: { en: 'ScatterChart props', ru: 'Пропсы ScatterChart', kk: 'ScatterChart пропстары' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per point.',
            ru: 'Одна строка на точку.',
            kk: 'Әр нүктеге бір жол.',
          },
        },
        {
          name: 'xKey',
          type: 'NumericKey<T>',
          required: true,
          description: {
            en: 'Numeric field for the horizontal axis.',
            ru: 'Числовое поле для горизонтальной оси.',
            kk: 'Көлденең оське арналған сандық өріс.',
          },
        },
        {
          name: 'yKey',
          type: 'NumericKey<T>',
          description: {
            en: 'Numeric field for the vertical axis (single group, or split by `groupKey`).',
            ru: 'Числовое поле для вертикальной оси (одна группа или разбиение по `groupKey`).',
            kk: 'Тік оське арналған сандық өріс (бір топ немесе `groupKey` бойынша бөлу).',
          },
        },
        {
          name: 'groupKey',
          type: 'KeysMatching<T, string | number | boolean>',
          description: {
            en: 'Field whose distinct values split the points into groups (long data).',
            ru: 'Поле, по уникальным значениям которого точки разбиваются на группы («длинный» формат).',
            kk: 'Нүктелерді бірегей мәндері бойынша топтарға бөлетін өріс («ұзын» пішім).',
          },
        },
        {
          name: 'series',
          type: 'readonly { key; label?; color?; symbol? }[]',
          description: {
            en: 'Several y fields, each drawn as a group (wide data). Overrides `yKey`/`groupKey`.',
            ru: 'Несколько полей Y, каждое рисуется отдельной группой («широкий» формат). Имеет приоритет над `yKey`/`groupKey`.',
            kk: 'Бірнеше Y өрісі, әрқайсысы жеке топ болып салынады («кең» пішім). `yKey`/`groupKey` пропстарынан басым.',
          },
        },
        {
          name: 'sizeKey',
          type: 'NumericKey<T>',
          description: {
            en: 'Bubble size; bubble area is proportional to the value.',
            ru: 'Размер пузырька; его площадь пропорциональна значению.',
            kk: 'Көпіршік өлшемі; оның ауданы мәнге пропорционал.',
          },
        },
        {
          name: 'colorKey',
          type: 'KeysMatching<T, string>',
          description: {
            en: 'CSS colour per point (overrides the group colour).',
            ru: 'CSS-цвет для каждой точки (заменяет цвет группы).',
            kk: 'Әр нүктенің CSS түсі (топ түсінің орнына қолданылады).',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: 'Names each point (tooltip title, data table).',
            ru: 'Название каждой точки (заголовок подсказки, таблица данных).',
            kk: 'Әр нүктенің атауы (қалқымалы кеңестің тақырыбы, деректер кестесі).',
          },
        },
        {
          name: 'color',
          type: 'string',
          description: {
            en: 'Colour of the single group.',
            ru: 'Цвет единственной группы.',
            kk: 'Жалғыз топтың түсі.',
          },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Colours by group order.',
            ru: 'Цвета по порядку групп.',
            kk: 'Топтар реті бойынша түстер.',
          },
        },
        {
          name: 'label',
          type: 'string',
          description: {
            en: 'Name of the single group.',
            ru: 'Название единственной группы.',
            kk: 'Жалғыз топтың атауы.',
          },
        },
        {
          name: 'xLabel / yLabel / sizeLabel',
          type: 'string',
          description: {
            en: 'Names of the fields in tooltips and the data table.',
            ru: 'Названия полей в подсказках и таблице данных.',
            kk: 'Қалқымалы кеңестер мен деректер кестесіндегі өріс атаулары.',
          },
        },
        {
          name: 'pointSize',
          type: 'number',
          default: {
            en: '8 (smaller for thousands)',
            ru: '8 (меньше для тысяч точек)',
            kk: '8 (мыңдаған нүктеде кішірек)',
          },
          description: {
            en: 'Marker diameter, px.',
            ru: 'Диаметр маркера, px.',
            kk: 'Маркер диаметрі, px.',
          },
        },
        {
          name: 'minRadius / maxRadius',
          type: 'number',
          default: { en: '3 / auto (10–26)', ru: '3 / авто (10–26)', kk: '3 / авто (10–26)' },
          description: {
            en: 'Bubble radius range, px.',
            ru: 'Диапазон радиусов пузырьков, px.',
            kk: 'Көпіршік радиустарының диапазоны, px.',
          },
        },
        {
          name: 'opacity',
          type: 'number',
          default: {
            en: '1 (bubbles 0.78)',
            ru: '1 (у пузырьков 0.78)',
            kk: '1 (көпіршіктерде 0.78)',
          },
          description: {
            en: 'Marker fill opacity.',
            ru: 'Непрозрачность заливки маркеров.',
            kk: 'Маркер бояуының мөлдірсіздігі.',
          },
        },
        {
          name: 'hitRadius',
          type: 'number',
          default: '24',
          description: {
            en: 'Hover target radius around a point, px (bubbles: their area).',
            ru: 'Радиус зоны наведения вокруг точки, px (у пузырьков — их площадь).',
            kk: 'Нүкте айналасындағы меңзерді апару аймағының радиусы, px (көпіршіктерде — олардың ауданы).',
          },
        },
        {
          name: 'xAxis / yAxis',
          type: 'boolean | ScatterChartAxisOptions',
          default: 'true',
          description: {
            en: 'YAxisOptions (`min`, `max`, `scale`, `format`, `title`…) plus `line`. `integer: true` keeps whole-number ticks only (counts, scores).',
            ru: 'YAxisOptions (`min`, `max`, `scale`, `format`, `title`…) и `line`. `integer: true` оставляет только целые деления (количества, баллы).',
            kk: 'YAxisOptions (`min`, `max`, `scale`, `format`, `title`…) және `line`. `integer: true` тек бүтін бөліктерді қалдырады (санақ мәндері, ұпайлар).',
          },
        },
        {
          name: 'grid',
          type: 'boolean | { horizontal?; vertical? }',
          default: 'true',
          description: { en: 'Gridlines.', ru: 'Линии сетки.', kk: 'Тор сызықтары.' },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Item tooltip with x, y (and size).',
            ru: 'Подсказка для точки с x, y (и размером).',
            kk: 'x, y (және өлшемі) көрсетілетін нүктенің қалқымалы кеңесі.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: { en: '2+ groups', ru: 'от 2 групп', kk: '2 топтан бастап' },
          description: {
            en: 'Legend; items toggle groups.',
            ru: 'Легенда; её элементы скрывают и показывают группы.',
            kk: 'Шартты белгілер; олардың элементтері топтарды жасырады және көрсетеді.',
          },
        },
        {
          name: 'differentiate',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Distinct marker shapes per group.',
            ru: 'Своя форма маркеров для каждой группы.',
            kk: 'Әр топқа маркерлердің өз пішіні.',
          },
        },
        {
          name: 'xFormatter / yFormatter / sizeFormatter',
          type: '(value: number) => string',
          description: {
            en: 'Value formatting.',
            ru: 'Форматирование значений.',
            kk: 'Мәндерді пішімдеу.',
          },
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: {
            en: 'Controlled or initial hidden groups.',
            ru: 'Скрытые группы: контролируемый или начальный список.',
            kk: 'Жасырылған топтар: басқарылатын немесе бастапқы тізім.',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active data index.',
            ru: 'Контролируемый индекс активной точки.',
            kk: 'Белсенді нүктенің басқарылатын индексі.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: ScatterPointEvent<T>) => void',
          description: {
            en: 'Event with `datum`, `index`, `series`, `x`, `y`, `size`.',
            ru: 'Событие с `datum`, `index`, `series`, `x`, `y`, `size`.',
            kk: '`datum`, `index`, `series`, `x`, `y`, `size` өрістері бар оқиға.',
          },
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: {
            en: 'Primitives such as `ChartReferenceLine`.',
            ru: 'Примитивы, например `ChartReferenceLine`.',
            kk: 'Примитивтер, мысалы `ChartReferenceLine`.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

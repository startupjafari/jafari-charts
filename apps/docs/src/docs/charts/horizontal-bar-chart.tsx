import { HorizontalBarChart } from '@startupjafari/charts';
import { universities } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const horizontalBarChart: ChartDoc = {
  slug: 'horizontal-bar-chart',
  component: 'HorizontalBarChart',
  title: {
    en: 'Horizontal bar chart',
    ru: 'Горизонтальная столбчатая диаграмма',
    kk: 'Көлденең бағаналы диаграмма',
  },
  group: 'Core',
  summary: {
    en: 'Rankings and comparisons with long category names, value labels included.',
    ru: 'Рейтинги и сравнения с длинными названиями категорий — сразу с подписями значений.',
    kk: 'Санат атаулары ұзын рейтингтер мен салыстырулар — мән жазулары бірден қосулы.',
  },
  description: {
    en: (
      <>
        <p>
          Categories run down the left axis, so long names stay readable: they wrap at word
          boundaries onto two lines instead of being truncated. Only a name that does not fit even
          in two lines ends with an ellipsis; the tooltip always shows it in full. Value labels are
          on by default. The height grows with the number of rows — 32 px per row, between 160 and
          560 px — unless you pass <code>height</code>.
        </p>
        <p>
          As in every cartesian chart, <code>xAxis</code> configures the categories and{' '}
          <code>yAxis</code> the values, whichever side they are drawn on:{' '}
          <code>
            xAxis={'{'}false{'}'}
          </code>{' '}
          hides the names,{' '}
          <code>
            yAxis={'{'}false{'}'}
          </code>{' '}
          the value axis at the bottom.
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          Категории идут сверху вниз по левой оси, поэтому длинные названия остаются читаемыми: они
          переносятся по словам на две строки, а не обрезаются. Многоточием заканчивается только
          название, которое не помещается и в две строки; в подсказке оно всегда видно целиком.
          Подписи значений включены по умолчанию. Высота растёт с числом строк — 32 px на строку, от
          160 до 560 px, — если вы не передали <code>height</code>.
        </p>
        <p>
          Как и в любой декартовой диаграмме, <code>xAxis</code> настраивает категории, а{' '}
          <code>yAxis</code> — значения, на какой бы стороне они ни были:{' '}
          <code>
            xAxis={'{'}false{'}'}
          </code>{' '}
          скрывает названия,{' '}
          <code>
            yAxis={'{'}false{'}'}
          </code>{' '}
          — ось значений внизу.
        </p>
      </>
    ),
    kk: (
      <>
        <p>
          Санаттар сол жақ ось бойымен жоғарыдан төмен орналасады, сондықтан ұзын атаулар оқылатын
          күйде қалады: олар қиылмай, сөз шекарасында екі жолға тасымалданады. Екі жолға да
          сыймайтын атау ғана көп нүктемен аяқталады; қалқымалы кеңесте ол әрқашан толық көрінеді.
          Мән жазулары әдепкіде қосулы. Егер <code>height</code> бермесеңіз, биіктік жол санымен
          бірге өседі — әр жолға 32 px, 160-тан 560 px-ке дейін.
        </p>
        <p>
          Кез келген декарттық диаграммадағыдай, қай жақта салынса да, <code>xAxis</code>{' '}
          санаттарды, ал <code>yAxis</code> мәндерді баптайды:{' '}
          <code>
            xAxis={'{'}false{'}'}
          </code>{' '}
          атауларды,{' '}
          <code>
            yAxis={'{'}false{'}'}
          </code>{' '}
          төменгі мәндер осін жасырады.
        </p>
      </>
    ),
  },
  thumbnail: () => (
    <HorizontalBarChart data={universities} xKey="name" yKey="score" {...THUMB} labels={false} />
  ),
  sections: {
    usage: [
      {
        id: 'horizontal-bar-chart/Basic',
        title: { en: 'Basic', ru: 'Базовый пример', kk: 'Негізгі мысал' },
      },
      {
        id: 'horizontal-bar-chart/LongNames',
        title: {
          en: 'Long names and a highlighted bar',
          ru: 'Длинные названия и выделенный столбец',
          kk: 'Ұзын атаулар және ерекшеленген бағана',
        },
        description: {
          en: (
            <p>
              Long university names wrap onto two lines at word boundaries, so names with the same
              beginning stay distinguishable. <code>colorBy</code> on the series colours one bar by
              its datum; the tooltip shows that colour, the legend keeps the series colour.
            </p>
          ),
          ru: (
            <p>
              Длинные названия университетов переносятся по словам на две строки, поэтому названия с
              одинаковым началом не сливаются. <code>colorBy</code> в настройках ряда задаёт цвет
              столбца по его строке данных; подсказка показывает этот цвет, легенда — цвет ряда.
            </p>
          ),
          kk: (
            <p>
              Университеттердің ұзын атаулары сөз шекарасында екі жолға тасымалданады, сондықтан
              басы бірдей атаулар араласып кетпейді. Қатар баптауларындағы <code>colorBy</code>{' '}
              бағананың түсін оның деректер жолы бойынша анықтайды; қалқымалы кеңес осы түсті, ал
              шартты белгілер қатардың түсін көрсетеді.
            </p>
          ),
        },
      },
    ],
    styling: [
      {
        id: 'horizontal-bar-chart/Styling',
        title: {
          en: 'Compact bars with formatted labels',
          ru: 'Компактные столбцы с форматированными подписями',
          kk: 'Пішімделген жазулары бар ықшам бағаналар',
        },
      },
      {
        id: 'horizontal-bar-chart/NoLabels',
        title: {
          en: 'Without labels, vertical grid',
          ru: 'Без подписей, с вертикальной сеткой',
          kk: 'Жазуларсыз, тік тормен',
        },
      },
    ],
    interaction: [
      {
        id: 'horizontal-bar-chart/Interaction',
        title: { en: 'Hover events', ru: 'События наведения', kk: 'Меңзерді апару оқиғалары' },
      },
    ],
    responsive: [
      {
        id: 'horizontal-bar-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'horizontal-bar-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: {
        en: 'HorizontalBarChart props',
        ru: 'Пропсы HorizontalBarChart',
        kk: 'HorizontalBarChart пропстары',
      },
      note: {
        en: 'All BarChart props except `layout`.',
        ru: 'Все пропсы BarChart, кроме `layout`.',
        kk: 'BarChart-тың `layout` пропынан басқа барлық пропстары.',
      },
      props: [
        {
          name: 'height',
          type: 'number',
          default: {
            en: 'rows × 32 + 40 (160–560)',
            ru: 'число строк × 32 + 40 (160–560)',
            kk: 'жол саны × 32 + 40 (160–560)',
          },
          description: {
            en: 'Grows with the number of rows unless set.',
            ru: 'Если не задана, растёт с числом строк.',
            kk: 'Берілмесе, жол санымен бірге өседі.',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Value labels at bar ends.',
            ru: 'Подписи значений на концах столбцов.',
            kk: 'Бағаналардың ұшындағы мән жазулары.',
          },
        },
        {
          name: 'stacked',
          type: "boolean | 'absolute' | 'percent'",
          default: 'false',
          description: {
            en: 'Stack series horizontally.',
            ru: 'Складывает ряды в стек по горизонтали.',
            kk: 'Қатарларды көлденеңінен жинақтайды.',
          },
        },
      ],
    },
    barGroup,
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};

import { ComboChart } from '@startupjafari/charts';
import { revenue } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const comboChart: ChartDoc = {
  slug: 'combo-chart',
  component: 'ComboChart',
  title: { en: 'Combo chart', ru: 'Комбинированная диаграмма', kk: 'Аралас диаграмма' },
  group: 'Professional',
  summary: {
    en: 'Bars, lines and areas on one plot, with an optional secondary axis.',
    ru: 'Столбцы, линии и области на одном графике — при необходимости со второй осью значений.',
    kk: 'Бағаналар, сызықтар мен аймақтар бір графикте — қажет болса, екінші мәндер осімен.',
  },
  description: {
    en: (
      <p>
        Each series picks its mark with <code>type</code> (series without a type are bars). A series
        with <code>axis: 'right'</code> gets a secondary value axis; there is no dual axis unless a
        series opts in, because two scales on one plot are easy to misread.
      </p>
    ),
    ru: (
      <p>
        Каждый ряд выбирает тип меток через <code>type</code> (ряды без типа рисуются столбцами).
        Ряд с <code>axis: 'right'</code> получает вторую ось значений; пока ни один ряд не запросил
        её явно, второй оси нет — две шкалы на одном графике легко прочитать неверно.
      </p>
    ),
    kk: (
      <p>
        Әр қатар өзінің белгі түрін <code>type</code> арқылы таңдайды (түрі берілмеген қатарлар
        бағана ретінде салынады). <code>axis: 'right'</code> бар қатар екінші мәндер осін алады;
        қатарлардың бірі оны өзі қоспайынша, екінші ось болмайды — бір графиктегі екі шкаланы қате
        оқу оңай.
      </p>
    ),
  },
  thumbnail: () => (
    <ComboChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'revenue', type: 'bar' },
        { key: 'margin', type: 'line', axis: 'right' },
      ]}
      {...THUMB}
      y2Axis={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'combo-chart/Basic',
        title: {
          en: 'Bars with a line on a secondary axis',
          ru: 'Столбцы и линия на второй оси',
          kk: 'Бағаналар және екінші осьтегі сызық',
        },
      },
      {
        id: 'combo-chart/Mixed',
        title: {
          en: 'Area, bar and line together',
          ru: 'Область, столбцы и линия вместе',
          kk: 'Аймақ, бағаналар және сызық бірге',
        },
      },
    ],
    styling: [
      {
        id: 'combo-chart/Styling',
        title: {
          en: 'Colours, bar shape and a reference line',
          ru: 'Цвета, форма столбцов и опорная линия',
          kk: 'Түстер, бағана пішіні және тірек сызық',
        },
      },
      {
        id: 'combo-chart/Stacked',
        title: {
          en: 'Stacked bars with a line',
          ru: 'Столбцы с накоплением и линия',
          kk: 'Жинақталған бағаналар және сызық',
        },
      },
    ],
    interaction: [
      {
        id: 'combo-chart/Interaction',
        title: {
          en: 'Item tooltip and clicks',
          ru: 'Подсказка по элементу и нажатия',
          kk: 'Элемент бойынша қалқымалы кеңес және басу',
        },
      },
    ],
    responsive: [
      {
        id: 'combo-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'combo-chart/States',
        title: {
          en: 'Loading with data',
          ru: 'Загрузка при наличии данных',
          kk: 'Деректер бар кездегі жүктелу',
        },
        description: {
          en: (
            <p>
              With data present, <code>loading</code> dims the previous render instead of flashing a
              skeleton.
            </p>
          ),
          ru: (
            <p>
              Если данные уже есть, <code>loading</code> приглушает предыдущую отрисовку, а не
              показывает мигающий скелетон.
            </p>
          ),
          kk: (
            <p>
              Деректер бұрыннан болса, <code>loading</code> жыпылықтайтын скелетонды көрсетпей,
              алдыңғы суретті күңгірттейді.
            </p>
          ),
        },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: { en: 'ComboChart props', ru: 'Пропсы ComboChart', kk: 'ComboChart пропстары' },
      note: {
        en: 'ComboChart takes the cartesian props plus bar options. Series-level `type` and `axis` do the work.',
        ru: 'ComboChart принимает пропсы декартовых диаграмм и параметры столбцов. Всю работу делают `type` и `axis` на уровне рядов.',
        kk: 'ComboChart декарттық диаграммалардың пропстары мен бағана параметрлерін қабылдайды. Негізгі жұмысты қатар деңгейіндегі `type` пен `axis` атқарады.',
      },
      props: [
        {
          name: 'series[].type',
          type: "'line' | 'area' | 'bar'",
          default: "'bar'",
          description: {
            en: 'Mark type of each series.',
            ru: 'Тип меток каждого ряда.',
            kk: 'Әр қатардың белгі түрі.',
          },
        },
        {
          name: 'series[].axis',
          type: "'left' | 'right'",
          default: "'left'",
          description: {
            en: '`right` plots the series on the secondary axis.',
            ru: '`right` строит ряд по второй оси значений.',
            kk: '`right` қатарды екінші мәндер осі бойынша салады.',
          },
        },
        {
          name: 'y2Axis',
          type: 'boolean | YAxisOptions',
          description: {
            en: 'Options of the secondary axis (`format`, `min`, `max`, `title`, `integer`…).',
            ru: 'Параметры второй оси значений (`format`, `min`, `max`, `title`, `integer`…).',
            kk: 'Екінші мәндер осінің параметрлері (`format`, `min`, `max`, `title`, `integer`…).',
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

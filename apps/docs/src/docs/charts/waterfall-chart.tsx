import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { barGroup, baseGroup, cartesianGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const waterfallChart: ChartDoc = {
  slug: 'waterfall-chart',
  component: 'WaterfallChart',
  title: { en: 'Waterfall chart', ru: 'Каскадная диаграмма', kk: 'Сарқырама диаграммасы' },
  group: 'Professional',
  summary: {
    en: 'How a starting value becomes a final value through increases and decreases.',
    ru: 'Как начальное значение становится итоговым через приросты и снижения.',
    kk: 'Бастапқы мән өсімдер мен кемулер арқылы қалай қорытынды мәнге айналатынын көрсетеді.',
  },
  description: {
    en: (
      <p>
        Each row is a change; the first row is the starting value (unless{' '}
        <code>firstIsStart={'{false}'}</code>) and rows marked by <code>isTotal</code> show the
        running total. Increases, decreases and totals use the theme’s positive, negative and first
        series colours, and dotted connectors link the bars. Labels show the change, not the level.
      </p>
    ),
    ru: (
      <p>
        Каждая строка — это изменение; первая строка задаёт начальное значение (если не указано{' '}
        <code>firstIsStart={'{false}'}</code>), а строки, отмеченные через <code>isTotal</code>,
        показывают накопленный итог. Приросты, снижения и итоги окрашиваются в цвета темы для
        положительных и отрицательных значений и в цвет первого ряда, а столбцы связаны пунктирными
        соединителями. Подписи показывают изменение, а не уровень.
      </p>
    ),
    kk: (
      <p>
        Әр жол — өзгеріс; бірінші жол бастапқы мәнді береді (егер{' '}
        <code>firstIsStart={'{false}'}</code> көрсетілмесе), ал <code>isTotal</code> арқылы
        белгіленген жолдар жинақталған қосындыны көрсетеді. Өсімдер, кемулер мен қосындылар
        тақырыптың оң және теріс мәндерге арналған түстерімен және бірінші қатардың түсімен боялады,
        ал бағаналарды нүктелі жалғағыштар байланыстырады. Жазулар деңгейді емес, өзгерісті
        көрсетеді.
      </p>
    ),
  },
  thumbnail: () => (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      {...THUMB}
      labels={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'waterfall-chart/Basic',
        title: {
          en: 'Start, changes and totals',
          ru: 'Начало, изменения и итоги',
          kk: 'Басы, өзгерістер және қосындылар',
        },
      },
      {
        id: 'waterfall-chart/Deltas',
        title: { en: 'Changes only', ru: 'Только изменения', kk: 'Тек өзгерістер' },
      },
    ],
    styling: [
      {
        id: 'waterfall-chart/Colors',
        title: {
          en: 'Custom colours, no connectors',
          ru: 'Свои цвета, без соединителей',
          kk: 'Жеке түстер, жалғағыштарсыз',
        },
      },
      {
        id: 'waterfall-chart/Compact',
        title: {
          en: 'Compact, labels only',
          ru: 'Компактный вид, только подписи',
          kk: 'Ықшам түр, тек жазулар',
        },
      },
    ],
    interaction: [
      {
        id: 'waterfall-chart/Interaction',
        title: { en: 'Click a step', ru: 'Нажатие на шаг', kk: 'Қадамды басу' },
      },
    ],
    responsive: [
      {
        id: 'waterfall-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'waterfall-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: {
        en: 'WaterfallChart props',
        ru: 'Пропсы WaterfallChart',
        kk: 'WaterfallChart пропстары',
      },
      note: {
        en: 'All cartesian props except `series` (one value field via `yKey`), plus bar options.',
        ru: 'Все пропсы декартовых диаграмм, кроме `series` (одно поле значений через `yKey`), а также параметры столбцов.',
        kk: 'Декарттық диаграммалардың `series` пропынан басқа барлық пропстары (мәндер өрісі біреу, ол `yKey` арқылы беріледі), сондай-ақ бағана параметрлері.',
      },
      props: [
        {
          name: 'isTotal',
          type: '(datum: T, index: number) => boolean',
          description: {
            en: 'Marks a row as an intermediate or final total; its value is ignored.',
            ru: 'Помечает строку как промежуточный или окончательный итог; её значение игнорируется.',
            kk: 'Жолды аралық немесе қорытынды қосынды ретінде белгілейді; оның мәні ескерілмейді.',
          },
        },
        {
          name: 'firstIsStart',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Treat the first row as the starting value.',
            ru: 'Считать первую строку начальным значением.',
            kk: 'Бірінші жолды бастапқы мән деп есептеу.',
          },
        },
        {
          name: 'connectors',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Dotted connectors between consecutive bars.',
            ru: 'Пунктирные соединители между соседними столбцами.',
            kk: 'Көрші бағаналар арасындағы нүктелі жалғағыштар.',
          },
        },
        {
          name: 'colors',
          type: '{ increase?: string; decrease?: string; total?: string }',
          default: {
            en: 'positive / negative / series 1',
            ru: 'positive / negative / цвет ряда 1',
            kk: 'positive / negative / 1-қатардың түсі',
          },
          description: {
            en: 'Colours for increases, decreases and totals.',
            ru: 'Цвета приростов, снижений и итогов.',
            kk: 'Өсімдердің, кемулердің және қосындылардың түстері.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: 'false',
          description: {
            en: 'Off by default (one series).',
            ru: 'По умолчанию выключена (ряд всего один).',
            kk: 'Әдепкіде өшірулі (қатар біреу ғана).',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Change labels at the bar ends.',
            ru: 'Подписи изменений на концах столбцов.',
            kk: 'Бағаналардың ұшындағы өзгеріс жазулары.',
          },
        },
      ],
    },
    barGroup,
    cartesianGroup,
    baseGroup,
  ],
};

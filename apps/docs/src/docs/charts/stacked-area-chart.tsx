import { StackedAreaChart } from '@startupjafari/charts';
import { activity } from '../../examples/data';
import { CARTESIAN_KEYS } from '../keyboard';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { THUMB } from '../thumb';
import type { ChartDoc } from '../types';

export const stackedAreaChart: ChartDoc = {
  slug: 'stacked-area-chart',
  component: 'StackedAreaChart',
  title: {
    en: 'Stacked area chart',
    ru: 'Диаграмма с областями и накоплением',
    kk: 'Жинақталған аймақтық диаграмма',
  },
  group: 'Professional',
  summary: {
    en: 'Parts of a total over time, in absolute values or as a 100 % composition.',
    ru: 'Составные части целого во времени — в абсолютных значениях или в долях от 100 %.',
    kk: 'Уақыт бойынша тұтастың бөліктері — абсолютті мәндермен немесе 100 %-ға келтірілген құрам ретінде.',
  },
  description: {
    en: (
      <p>
        Series stack in order. When the input is large, all layers are downsampled with the same
        indices so their boundaries stay aligned. The tooltip lists every layer at the active date.
      </p>
    ),
    ru: (
      <p>
        Ряды складываются в стек по порядку. На больших объёмах данных все слои прореживаются по
        одним и тем же индексам, поэтому их границы остаются согласованными. Подсказка перечисляет
        все слои на активную дату.
      </p>
    ),
    kk: (
      <p>
        Қатарлар ретімен жинақталады. Деректер көп болғанда барлық қабат бірдей индекстер бойынша
        сиретіледі, сондықтан олардың шекаралары сәйкес қалады. Қалқымалы кеңес белсенді күндегі
        барлық қабатты тізіп көрсетеді.
      </p>
    ),
  },
  thumbnail: () => (
    <StackedAreaChart
      data={activity}
      xKey="date"
      series={[{ key: 'students' }, { key: 'teachers' }, { key: 'staff' }]}
      {...THUMB}
    />
  ),
  sections: {
    usage: [
      {
        id: 'stacked-area-chart/Basic',
        title: { en: 'Absolute', ru: 'Абсолютные значения', kk: 'Абсолютті мәндер' },
      },
      {
        id: 'stacked-area-chart/Percent',
        title: { en: 'Percent', ru: 'Проценты', kk: 'Пайыздар' },
        description: {
          en: (
            <p>
              <code>mode="percent"</code> normalises every x position to 100 %.
            </p>
          ),
          ru: (
            <p>
              <code>mode="percent"</code> нормирует каждую позицию по X к 100 %.
            </p>
          ),
          kk: (
            <p>
              <code>mode="percent"</code> X бойынша әр позицияны 100 %-ға нормалайды.
            </p>
          ),
        },
      },
    ],
    styling: [
      {
        id: 'stacked-area-chart/Styling',
        title: {
          en: 'Solid layers, colours, legend on top, sorted tooltip',
          ru: 'Сплошные слои, цвета, легенда сверху, сортировка в подсказке',
          kk: 'Тұтас қабаттар, түстер, жоғарыдағы шартты белгілер, қалқымалы кеңестегі сұрыптау',
        },
      },
      {
        id: 'stacked-area-chart/Stepped',
        title: {
          en: 'Step curve without axes',
          ru: 'Ступенчатая кривая без осей',
          kk: 'Осьтерсіз сатылы қисық',
        },
      },
    ],
    interaction: [
      {
        id: 'stacked-area-chart/Highlight',
        title: {
          en: 'Highlight and toggle series',
          ru: 'Выделение и переключение рядов',
          kk: 'Қатарларды ерекшелеу және ауыстыру',
        },
        description: {
          en: (
            <p>
              <code>highlightedSeries</code> fades the other layers; legend clicks update{' '}
              <code>hiddenSeries</code>.
            </p>
          ),
          ru: (
            <p>
              <code>highlightedSeries</code> приглушает остальные слои; нажатия в легенде обновляют{' '}
              <code>hiddenSeries</code>.
            </p>
          ),
          kk: (
            <p>
              <code>highlightedSeries</code> қалған қабаттарды күңгірттейді; шартты белгілерді басу{' '}
              <code>hiddenSeries</code> мәнін жаңартады.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'stacked-area-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'stacked-area-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: CARTESIAN_KEYS,
  props: [
    {
      title: {
        en: 'StackedAreaChart props',
        ru: 'Пропсы StackedAreaChart',
        kk: 'StackedAreaChart пропстары',
      },
      props: [
        {
          name: 'mode',
          type: "'absolute' | 'percent'",
          default: "'absolute'",
          description: {
            en: '`percent` normalises each x position to 100 %.',
            ru: '`percent` нормирует каждую позицию по X к 100 %.',
            kk: '`percent` X бойынша әр позицияны 100 %-ға нормалайды.',
          },
        },
        {
          name: 'gradient',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Gradient fill; `false` for flat layers.',
            ru: 'Градиентная заливка; `false` — сплошные слои.',
            kk: 'Градиентті бояу; `false` — тұтас қабаттар.',
          },
        },
      ],
    },
    cartesianGroup,
    seriesGroup,
    baseGroup,
  ],
};

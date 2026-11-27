import { PieChart } from '@startupjafari/charts';
import { devices } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup, PIE_PROPS } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const pieChart: ChartDoc = {
  slug: 'pie-chart',
  component: 'PieChart',
  title: { en: 'Pie chart', ru: 'Круговая диаграмма', kk: 'Дөңгелек диаграмма' },
  group: 'Core',
  summary: {
    en: 'Part-to-whole for a handful of categories, with percentage labels.',
    ru: 'Доли целого для нескольких категорий, с процентными подписями.',
    kk: 'Бірнеше санат үшін тұтастың бөліктері — пайыздық жазулармен.',
  },
  description: {
    en: (
      <p>
        Slices keep a small gap and rounded corners; percentage labels appear inside slices large
        enough to hold them, or outside with leader lines. Tiny shares read “&lt;1%” instead of
        “0%”. The legend shows each slice’s share and toggles slices. For more than five or six
        categories a bar chart is usually easier to read.
      </p>
    ),
    ru: (
      <p>
        Между секторами остаётся небольшой зазор, углы скруглены; процентные подписи появляются
        внутри секторов, в которые они помещаются, или снаружи с выносными линиями. Крошечные доли
        подписываются «&lt;1%», а не «0%». Легенда показывает долю каждого сектора и позволяет
        скрывать и показывать секторы. Если категорий больше пяти-шести, столбчатая диаграмма обычно
        читается легче.
      </p>
    ),
    kk: (
      <p>
        Секторлар арасында шағын саңылау қалады, бұрыштары дөңгеленген; пайыздық жазулар өздері
        сыятын секторлардың ішінде, ал сыймаса — сыртында сілтеме сызықтарымен шығады. Өте шағын
        үлестер «0%» емес, «&lt;1%» деп жазылады. Шартты белгілер әр сектордың үлесін көрсетеді және
        секторларды жасыруға және көрсетуге мүмкіндік береді. Санаттар бесеу-алтаудан көп болса,
        бағаналы диаграмманы оқу әдетте оңайырақ.
      </p>
    ),
  },
  thumbnail: () => (
    <PieChart data={devices} labelKey="device" valueKey="share" {...THUMB_POLAR} labels={false} />
  ),
  sections: {
    usage: [
      { id: 'pie-chart/Basic', title: { en: 'Basic', ru: 'Базовый пример', kk: 'Негізгі мысал' } },
      {
        id: 'pie-chart/Outside',
        title: { en: 'Outside labels', ru: 'Подписи снаружи', kk: 'Сырттағы жазулар' },
      },
    ],
    styling: [
      {
        id: 'pie-chart/Styling',
        title: {
          en: 'Half pie, custom colours, sorted',
          ru: 'Полукруг, свои цвета, сортировка',
          kk: 'Жарты дөңгелек, жеке түстер, сұрыпталған секторлар',
        },
      },
      {
        id: 'pie-chart/Classic',
        title: {
          en: 'Classic pie without gaps',
          ru: 'Классическая круговая без зазоров',
          kk: 'Саңылаусыз классикалық дөңгелек диаграмма',
        },
      },
    ],
    interaction: [
      {
        id: 'pie-chart/Interaction',
        title: {
          en: 'Controlled legend and clicks',
          ru: 'Контролируемая легенда и нажатия',
          kk: 'Басқарылатын шартты белгілер және басу',
        },
      },
    ],
    responsive: [
      {
        id: 'pie-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'pie-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: { en: 'PieChart props', ru: 'Пропсы PieChart', kk: 'PieChart пропстары' },
      props: PIE_PROPS,
    },
    baseGroup,
  ],
};

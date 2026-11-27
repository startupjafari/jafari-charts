import { DonutChart } from '@startupjafari/charts';
import { roles } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup, PIE_PROPS } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const donutChart: ChartDoc = {
  slug: 'donut-chart',
  component: 'DonutChart',
  title: { en: 'Donut chart', ru: 'Кольцевая диаграмма', kk: 'Сақиналы диаграмма' },
  group: 'Core',
  summary: {
    en: 'A ring with a centre readout: the total, or the hovered slice.',
    ru: 'Кольцо со значением в центре: общая сумма или сектор под указателем.',
    kk: 'Ортасында мәні бар сақина: жалпы қосынды немесе меңзер астындағы сектор.',
  },
  description: {
    en: (
      <p>
        The donut replaces the tooltip with its centre: it shows the total at rest and the hovered
        or focused slice otherwise. All PieChart props apply; slice labels are off by default.
      </p>
    ),
    ru: (
      <p>
        Вместо подсказки кольцевая диаграмма использует свой центр: в покое там показана общая
        сумма, а при наведении или фокусе — активный сектор. Работают все пропсы PieChart; подписи
        секторов по умолчанию выключены.
      </p>
    ),
    kk: (
      <p>
        Сақиналы диаграмма қалқымалы кеңестің орнына өз ортасын пайдаланады: әдеттегі күйде онда
        жалпы қосынды, ал меңзерді апарғанда немесе фокуста белсенді сектор көрсетіледі.
        PieChart-тың барлық пропстары жұмыс істейді; сектор жазулары әдепкіде өшірулі.
      </p>
    ),
  },
  thumbnail: () => (
    <DonutChart data={roles} labelKey="role" valueKey="count" {...THUMB_POLAR} centerValue={null} />
  ),
  sections: {
    usage: [
      {
        id: 'donut-chart/Basic',
        title: { en: 'Basic', ru: 'Базовый пример', kk: 'Негізгі мысал' },
      },
      {
        id: 'donut-chart/Center',
        title: {
          en: 'Custom centre content',
          ru: 'Своё содержимое в центре',
          kk: 'Ортадағы жеке мазмұн',
        },
        description: {
          en: (
            <p>
              <code>centerValue</code> and <code>centerLabel</code> accept nodes or functions of the
              active slice.
            </p>
          ),
          ru: (
            <p>
              <code>centerValue</code> и <code>centerLabel</code> принимают React-узлы или функции
              от активного сектора.
            </p>
          ),
          kk: (
            <p>
              <code>centerValue</code> және <code>centerLabel</code> React түйіндерін немесе
              белсенді сектор берілетін функцияларды қабылдайды.
            </p>
          ),
        },
      },
    ],
    styling: [
      {
        id: 'donut-chart/Styling',
        title: {
          en: 'Thin ring, colours from data',
          ru: 'Тонкое кольцо, цвета из данных',
          kk: 'Жіңішке сақина, түстер деректерден',
        },
      },
      {
        id: 'donut-chart/HalfDonut',
        title: { en: 'Half donut', ru: 'Полукольцо', kk: 'Жарты сақина' },
      },
    ],
    interaction: [
      {
        id: 'donut-chart/Interaction',
        title: {
          en: 'Controlled active slice',
          ru: 'Контролируемый активный сектор',
          kk: 'Басқарылатын белсенді сектор',
        },
      },
    ],
    responsive: [
      {
        id: 'donut-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'donut-chart/States',
        title: {
          en: 'Loading placeholder',
          ru: 'Заглушка при загрузке',
          kk: 'Жүктелу кезіндегі толтырғыш',
        },
      },
    ],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: { en: 'DonutChart props', ru: 'Пропсы DonutChart', kk: 'DonutChart пропстары' },
      note: {
        en: 'Everything from PieChart (below), plus:',
        ru: 'Всё из PieChart (см. ниже), а также:',
        kk: 'PieChart-тағы барлық пропстар (төменде), сондай-ақ:',
      },
      props: [
        {
          name: 'thickness',
          type: 'number',
          default: '0.32',
          description: {
            en: 'Ring thickness as a fraction of the radius (0.05–0.9).',
            ru: 'Толщина кольца как доля радиуса (0.05–0.9).',
            kk: 'Сақинаның қалыңдығы радиустың үлесі ретінде (0.05–0.9).',
          },
        },
        {
          name: 'centerValue',
          type: 'ReactNode | ((active: SliceEvent<T> | null) => ReactNode)',
          default: {
            en: 'total / hovered value',
            ru: 'сумма / значение под указателем',
            kk: 'қосынды / меңзер астындағы мән',
          },
          description: {
            en: 'Centre content. `null` hides the centre.',
            ru: 'Содержимое центра. `null` скрывает центр.',
            kk: 'Ортаның мазмұны. `null` ортаны жасырады.',
          },
        },
        {
          name: 'centerLabel',
          type: 'ReactNode | ((active: SliceEvent<T> | null) => ReactNode)',
          default: {
            en: "'Total' / slice label",
            ru: "'Итого' (для ru) / название сектора",
            kk: "'Барлығы' (kk үшін) / сектор атауы",
          },
          description: {
            en: 'Caption under the centre value.',
            ru: 'Подпись под значением в центре.',
            kk: 'Ортадағы мәннің астындағы жазу.',
          },
        },
      ],
    },
    {
      title: { en: 'PieChart props', ru: 'Пропсы PieChart', kk: 'PieChart пропстары' },
      props: PIE_PROPS,
      collapsed: true,
    },
    baseGroup,
  ],
};

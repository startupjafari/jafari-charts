import { RadialProgressChart } from '@startupjafari/charts';
import { completion } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import { THUMB_POLAR } from '../thumb';
import type { ChartDoc } from '../types';

export const radialProgressChart: ChartDoc = {
  slug: 'radial-progress-chart',
  component: 'RadialProgressChart',
  title: {
    en: 'Radial progress chart',
    ru: 'Радиальный индикатор прогресса',
    kk: 'Сақиналы прогресс көрсеткіші',
  },
  group: 'Core',
  summary: {
    en: 'Progress towards one or more targets as concentric rings.',
    ru: 'Прогресс к одной или нескольким целям в виде концентрических колец.',
    kk: 'Бір немесе бірнеше мақсатқа жету барысы — концентрлі сақиналар түрінде.',
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
    kk: (
      <p>
        Бір сақина үшін <code>value</code>/<code>max</code>/<code>label</code> пропстарын, бірнеше
        сақина үшін <code>data</code> пропын пайдаланыңыз (сыртқысынан бастап). Орталықта бірінші
        сақинаның пайызы көрсетіледі. Сақина бірнешеу болса, шартты белгілер мен қалқымалы кеңес
        автоматты түрде қосылады.
      </p>
    ),
  },
  thumbnail: () => <RadialProgressChart data={completion} {...THUMB_POLAR} centerValue={null} />,
  sections: {
    usage: [
      {
        id: 'radial-progress-chart/Basic',
        title: { en: 'Single ring', ru: 'Одно кольцо', kk: 'Бір сақина' },
      },
      {
        id: 'radial-progress-chart/Rings',
        title: { en: 'Several rings', ru: 'Несколько колец', kk: 'Бірнеше сақина' },
      },
    ],
    styling: [
      {
        id: 'radial-progress-chart/Styling',
        title: {
          en: 'Arc variant, thickness, colours, centre',
          ru: 'Вариант с дугой, толщина, цвета, центр',
          kk: 'Доға нұсқасы, қалыңдық, түстер, орталық',
        },
      },
    ],
    interaction: [
      {
        id: 'radial-progress-chart/Interaction',
        title: {
          en: 'Animated updates',
          ru: 'Анимированные обновления',
          kk: 'Анимациямен жаңарту',
        },
      },
    ],
    responsive: [
      {
        id: 'radial-progress-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'radial-progress-chart/States',
        title: { en: 'Loading and error', ru: 'Загрузка и ошибка', kk: 'Жүктелу және қате' },
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
      kk: (
        <p>
          Сақиналы прогресс көрсеткіші әрқашан кемінде бір сақина салады (<code>data</code> массиві
          бос болса, жалғыз сақина пропстары қолданылады), сондықтан онда «Деректер жоқ» күйі
          болмайды — мән әлі белгісіз кезде <code>loading</code> көрсетіңіз.
        </p>
      ),
    },
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: {
        en: 'RadialProgressChart props',
        ru: 'Пропсы RadialProgressChart',
        kk: 'RadialProgressChart пропстары',
      },
      props: [
        {
          name: 'value',
          type: 'number',
          default: '0',
          description: {
            en: 'Single ring shortcut: current value.',
            ru: 'Сокращение для одного кольца: текущее значение.',
            kk: 'Бір сақинаға арналған қысқа түр: ағымдағы мән.',
          },
        },
        {
          name: 'max',
          type: 'number',
          default: '100',
          description: {
            en: 'Target of the single ring.',
            ru: 'Целевое значение одиночного кольца.',
            kk: 'Жалғыз сақинаның мақсатты мәні.',
          },
        },
        {
          name: 'label',
          type: 'string',
          default: { en: "'Value'", ru: "'Значение' (для ru)", kk: "'Мән' (kk үшін)" },
          description: {
            en: 'Label of the single ring.',
            ru: 'Название одиночного кольца.',
            kk: 'Жалғыз сақинаның атауы.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1', kk: '1-қатардың түсі' },
          description: {
            en: 'Colour of the single ring.',
            ru: 'Цвет одиночного кольца.',
            kk: 'Жалғыз сақинаның түсі.',
          },
        },
        {
          name: 'data',
          type: 'readonly ProgressItem[]',
          description: {
            en: 'Several rings, outermost first: `{ label, value, max?, color? }`.',
            ru: 'Несколько колец, начиная с внешнего: `{ label, value, max?, color? }`.',
            kk: 'Бірнеше сақина, сыртқысынан бастап: `{ label, value, max?, color? }`.',
          },
        },
        {
          name: 'thickness',
          type: 'number',
          default: { en: 'auto', ru: 'авто', kk: 'авто' },
          description: {
            en: 'Ring thickness, px.',
            ru: 'Толщина кольца, px.',
            kk: 'Сақинаның қалыңдығы, px.',
          },
        },
        {
          name: 'gap',
          type: 'number',
          default: { en: '4 (several rings)', ru: '4 (несколько колец)', kk: '4 (бірнеше сақина)' },
          description: {
            en: 'Gap between rings, px.',
            ru: 'Зазор между кольцами, px.',
            kk: 'Сақиналар арасындағы аралық, px.',
          },
        },
        {
          name: 'variant',
          type: "'full' | 'arc'",
          default: "'full'",
          description: {
            en: 'Full circle or a 270° arc.',
            ru: 'Полное кольцо или дуга в 270°.',
            kk: 'Толық сақина немесе 270° доға.',
          },
        },
        {
          name: 'centerValue',
          type: 'ReactNode',
          default: { en: "first ring's %", ru: '% первого кольца', kk: 'бірінші сақинаның %-ы' },
          description: {
            en: 'Centre text. `null` hides it.',
            ru: 'Текст в центре. `null` скрывает его.',
            kk: 'Орталықтағы мәтін. `null` оны жасырады.',
          },
        },
        {
          name: 'centerLabel',
          type: 'ReactNode',
          description: {
            en: 'Caption under the centre value.',
            ru: 'Подпись под значением в центре.',
            kk: 'Орталықтағы мәннің астындағы жазу.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number, max: number) => string',
          default: { en: 'percent', ru: 'проценты', kk: 'пайыз' },
          description: {
            en: 'Formats the centre, legend and table values.',
            ru: 'Форматирует значения в центре, в легенде и в таблице данных.',
            kk: 'Орталықтағы, шартты белгілердегі және деректер кестесіндегі мәндерді пішімдейді.',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: { en: '2+ rings', ru: 'от 2 колец', kk: '2 сақинадан бастап' },
          description: {
            en: 'Tooltip per ring.',
            ru: 'Подсказка для каждого кольца.',
            kk: 'Әр сақинаға арналған қалқымалы кеңес.',
          },
        },
        {
          name: 'legend',
          type: 'boolean',
          default: { en: '2+ rings', ru: 'от 2 колец', kk: '2 сақинадан бастап' },
          description: {
            en: 'Non-interactive legend with values.',
            ru: 'Неинтерактивная легенда со значениями.',
            kk: 'Мәндері бар интерактивті емес шартты белгілер.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

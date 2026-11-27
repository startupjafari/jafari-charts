import { FunnelChart } from '@startupjafari/charts';
import { admissions } from '../../examples/data';
import { ITEM_KEYS } from '../keyboard';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const funnelChart: ChartDoc = {
  slug: 'funnel-chart',
  component: 'FunnelChart',
  title: { en: 'Funnel chart', ru: 'Воронка', kk: 'Воронка' },
  group: 'Advanced',
  summary: {
    en: 'Conversion through ordered stages, with percentages and drop-off.',
    ru: 'Конверсия по последовательным этапам — с процентами и потерями.',
    kk: 'Ретімен келетін кезеңдер бойынша конверсия — пайыздармен және шығынмен.',
  },
  description: {
    en: (
      <p>
        One row per stage, in funnel order. Each stage shows its value and its share of the first
        stage (or of the previous one with <code>percentBase="previous"</code>); the loss between
        stages is labelled where there is room. The default <code>bars</code> variant keeps values
        readable; <code>trapezoid</code> draws a continuous funnel. Default height grows with the
        number of stages (52 px each, 160–440 px).
      </p>
    ),
    ru: (
      <p>
        Одна строка данных на этап, в порядке воронки. Для каждого этапа показываются значение и
        доля от первого этапа (или от предыдущего при <code>percentBase="previous"</code>); потери
        между этапами подписываются, если хватает места. Вариант по умолчанию, <code>bars</code>,
        сохраняет значения читаемыми; <code>trapezoid</code> рисует сплошную воронку. Высота по
        умолчанию растёт с числом этапов (по 52 px на этап, в пределах 160–440 px).
      </p>
    ),
    kk: (
      <p>
        Әр кезеңге деректердің бір жолы, воронка ретімен. Әр кезеңде оның мәні және бірінші кезеңнен
        үлесі (немесе <code>percentBase="previous"</code> болса, алдыңғы кезеңнен үлесі)
        көрсетіледі; кезеңдер арасындағы шығын орын жеткілікті жерде жазылады. Әдепкі{' '}
        <code>bars</code> нұсқасы мәндерді оқуға ыңғайлы етеді; <code>trapezoid</code> тұтас воронка
        салады. Әдепкі биіктік кезең санына қарай өседі (әр кезеңге 52 px, 160–440 px шегінде).
      </p>
    ),
  },
  thumbnail: () => (
    <FunnelChart
      data={admissions}
      labelKey="stage"
      valueKey="count"
      height={120}
      labels={false}
      dropOff={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'funnel-chart/Basic',
        title: { en: 'Bars (default)', ru: 'Полосы (по умолчанию)', kk: 'Бағаналар (әдепкі)' },
      },
      { id: 'funnel-chart/Trapezoid', title: { en: 'Trapezoid', ru: 'Трапеция', kk: 'Трапеция' } },
      {
        id: 'funnel-chart/Horizontal',
        title: {
          en: 'Horizontal, step conversion',
          ru: 'Горизонтальная ориентация, конверсия от предыдущего этапа',
          kk: 'Көлденең орналасу, алдыңғы кезеңнен конверсия',
        },
      },
    ],
    styling: [
      {
        id: 'funnel-chart/Styling',
        title: {
          en: 'Colours by stage and formatting',
          ru: 'Цвета по этапам и форматирование',
          kk: 'Кезең бойынша түстер және пішімдеу',
        },
      },
    ],
    interaction: [
      {
        id: 'funnel-chart/Interaction',
        title: { en: 'Click a stage', ru: 'Нажатие на этап', kk: 'Кезеңді басу' },
      },
    ],
    responsive: [
      {
        id: 'funnel-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'funnel-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: ITEM_KEYS,
  props: [
    {
      title: { en: 'FunnelChart props', ru: 'Пропсы FunnelChart', kk: 'FunnelChart пропстары' },
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: {
            en: 'One row per stage, in funnel order.',
            ru: 'Одна строка на этап, в порядке воронки.',
            kk: 'Әр кезеңге бір жол, воронка ретімен.',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          required: true,
          description: {
            en: 'Field naming each stage.',
            ru: 'Поле с названием этапа.',
            kk: 'Кезең атауы бар өріс.',
          },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          required: true,
          description: {
            en: "Each stage's value.",
            ru: 'Поле со значением этапа.',
            kk: 'Кезең мәні бар өріс.',
          },
        },
        {
          name: 'variant',
          type: "'bars' | 'trapezoid'",
          default: "'bars'",
          description: {
            en: 'Centred bars with soft connectors, or a continuous funnel.',
            ru: 'Полосы по центру с мягкими соединителями или сплошная воронка.',
            kk: 'Ортаға тураланған, жұмсақ жалғағыштары бар бағаналар немесе тұтас воронка.',
          },
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: {
            en: 'Stages top → bottom or left → right.',
            ru: 'Этапы сверху вниз или слева направо.',
            kk: 'Кезеңдер жоғарыдан төменге немесе солдан оңға қарай.',
          },
        },
        {
          name: 'percentBase',
          type: "'first' | 'previous'",
          default: "'first'",
          description: {
            en: 'Percentages relative to the first or the previous stage.',
            ru: 'Проценты относительно первого или предыдущего этапа.',
            kk: 'Бірінші немесе алдыңғы кезеңге қатысты пайыздар.',
          },
        },
        {
          name: 'color',
          type: 'string',
          default: { en: 'series 1', ru: 'цвет ряда 1', kk: '1-қатардың түсі' },
          description: {
            en: 'Colour of every stage.',
            ru: 'Цвет всех этапов.',
            kk: 'Барлық кезеңнің түсі.',
          },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          description: {
            en: 'Colours by stage position (overrides `color`).',
            ru: 'Цвета по порядку этапов (заменяют `color`).',
            kk: 'Кезеңдер реті бойынша түстер (`color` орнына қолданылады).',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Stage names and values on the chart.',
            ru: 'Названия и значения этапов на диаграмме.',
            kk: 'Диаграммадағы кезең атаулары мен мәндері.',
          },
        },
        {
          name: 'dropOff',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Loss labels between stages when there is room.',
            ru: 'Подписи потерь между этапами, если хватает места.',
            kk: 'Орын жеткілікті болса, кезеңдер арасындағы шығын жазулары.',
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
          name: 'percentFormatter',
          type: '(ratio: number) => string',
          description: {
            en: 'Formats ratios (0.25 → "25%").',
            ru: 'Форматирует доли (0.25 → "25%").',
            kk: 'Үлестерді пішімдейді (0.25 → "25%").',
          },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Stage tooltip with conversion and drop-off.',
            ru: 'Подсказка этапа с конверсией и потерями.',
            kk: 'Конверсия мен шығын көрсетілетін кезеңнің қалқымалы кеңесі.',
          },
        },
        {
          name: 'texts',
          type: 'Partial<FunnelTexts>',
          description: {
            en: 'Overrides for `stage`, `ofFirst`, `ofPrevious`, `dropOff` (built in for en, ru, kk).',
            ru: 'Переопределения текстов `stage`, `ofFirst`, `ofPrevious`, `dropOff` (встроены для en, ru, kk).',
            kk: '`stage`, `ofFirst`, `ofPrevious`, `dropOff` мәтіндерін қайта анықтау (en, ru, kk үшін кірістірілген).',
          },
        },
        {
          name: 'activeIndex / onActiveIndexChange',
          type: 'number | null',
          description: {
            en: 'Controlled active stage.',
            ru: 'Контролируемый активный этап.',
            kk: 'Басқарылатын белсенді кезең.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: FunnelStageEvent<T>) => void',
          description: {
            en: 'Event with `value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate`.',
            ru: 'Событие с полями `value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate`.',
            kk: '`value`, `ofFirst`, `ofPrevious`, `dropOff`, `dropOffRate` өрістері бар оқиға.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

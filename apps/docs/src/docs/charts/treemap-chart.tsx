import { TreemapChart } from '@startupjafari/charts';
import { budgetTree } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const treemapChart: ChartDoc = {
  slug: 'treemap-chart',
  component: 'TreemapChart',
  title: { en: 'Treemap', ru: 'Древовидная карта (treemap)', kk: 'Ағаштық карта' },
  group: 'Advanced',
  summary: {
    en: 'Part-to-whole for hierarchies, as nested rectangles sized by value.',
    ru: 'Доли целого в иерархических данных: вложенные прямоугольники, площадь которых пропорциональна значению.',
    kk: 'Иерархиялық деректердегі тұтастың бөліктері: ауданы мәнге пропорционал кірістірілген тіктөртбұрыштар.',
  },
  description: {
    en: (
      <>
        <p>
          Pass a hierarchy (<code>{'{ name, value }'}</code> leaves,{' '}
          <code>{'{ name, children }'}</code> parents), or flat rows grouped with{' '}
          <code>groupKey</code>, an optional <code>subgroupKey</code> and <code>labelKey</code>.
          Tiles use the squarified layout, so they stay close to square and easy to compare.
        </p>
        <p>
          Top-level categories get the palette colours and a legend (for 2–12 categories) whose
          items hide branches. With <code>drilldown</code>, clicking a category zooms into it and a
          breadcrumb leads back.
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          Передайте иерархию (листья — <code>{'{ name, value }'}</code>, родители —{' '}
          <code>{'{ name, children }'}</code>) или плоские строки, сгруппированные по{' '}
          <code>groupKey</code>, необязательному <code>subgroupKey</code> и <code>labelKey</code>.
          Плитки раскладываются алгоритмом squarified, поэтому они остаются близкими к квадрату и их
          легко сравнивать.
        </p>
        <p>
          Категории верхнего уровня получают цвета палитры и легенду (при 2–12 категориях), элементы
          которой скрывают ветви. С <code>drilldown</code> нажатие на категорию приближает её, а
          «хлебные крошки» ведут обратно.
        </p>
      </>
    ),
    kk: (
      <>
        <p>
          Иерархияны (жапырақтар — <code>{'{ name, value }'}</code>, ата-ана түйіндер —{' '}
          <code>{'{ name, children }'}</code>) немесе <code>groupKey</code>, міндетті емес{' '}
          <code>subgroupKey</code> және <code>labelKey</code> бойынша топтастырылған бір деңгейлі
          жолдарды беріңіз. Тақталар squarified алгоритмімен орналастырылады, сондықтан шаршыға
          жақын болып, оңай салыстырылады.
        </p>
        <p>
          Жоғарғы деңгей санаттары палитра түстерін және шартты белгілерді алады (2–12 санат
          болғанда); шартты белгілердің элементтері тармақтарды жасырады. <code>drilldown</code>{' '}
          қосылса, санатты басқанда ол жақындатылады, ал навигация тізбегі арқылы кері қайтуға
          болады.
        </p>
      </>
    ),
  },
  thumbnail: () => (
    <TreemapChart
      data={budgetTree}
      height={120}
      labels={false}
      headers={false}
      legend={false}
      tooltip={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'treemap-chart/Basic',
        title: { en: 'Hierarchical data', ru: 'Иерархические данные', kk: 'Иерархиялық деректер' },
      },
      {
        id: 'treemap-chart/Rows',
        title: { en: 'Flat rows', ru: 'Плоские строки', kk: 'Бір деңгейлі жолдар' },
      },
    ],
    styling: [
      {
        id: 'treemap-chart/Styling',
        title: {
          en: 'Colours, depth shading, gaps and radius',
          ru: 'Цвета, оттенки по уровням, зазоры и скругление',
          kk: 'Түстер, деңгей бойынша реңктер, аралықтар және дөңгелектеу',
        },
      },
    ],
    interaction: [
      {
        id: 'treemap-chart/Drilldown',
        title: {
          en: 'Drill-down',
          ru: 'Детализация (drill-down)',
          kk: 'Тереңдеп қарау (drill-down)',
        },
      },
    ],
    responsive: [
      {
        id: 'treemap-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'treemap-chart/States',
        title: { en: 'Empty state', ru: 'Нет данных', kk: 'Деректер жоқ' },
      },
    ],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next tile (largest first, depth first)',
        ru: 'Предыдущая / следующая плитка (от крупных к мелким, обход в глубину)',
        kk: 'Алдыңғы / келесі тақта (үлкенінен кішісіне, тереңдікке қарай)',
      },
    ],
    [
      '↑ ↓',
      { en: 'Tile above / below', ru: 'Плитка выше / ниже', kk: 'Жоғарыдағы / төмендегі тақта' },
    ],
    [
      'Home End',
      { en: 'First / last tile', ru: 'Первая / последняя плитка', kk: 'Бірінші / соңғы тақта' },
    ],
    [
      'Enter',
      {
        en: 'Click; with drilldown, zoom into the category',
        ru: 'Нажатие; с drilldown — приблизить категорию',
        kk: 'Басу; drilldown болса — санатты жақындату',
      },
    ],
    [
      'Backspace',
      {
        en: 'Zoom out one level (drilldown)',
        ru: 'Подняться на уровень выше (drilldown)',
        kk: 'Бір деңгей жоғары көтерілу (drilldown)',
      },
    ],
    [
      'Esc',
      {
        en: 'Clear the active tile',
        ru: 'Сбросить активную плитку',
        kk: 'Белсенді тақтаны алып тастау',
      },
    ],
  ],
  props: [
    {
      title: { en: 'TreemapChart props', ru: 'Пропсы TreemapChart', kk: 'TreemapChart пропстары' },
      note: {
        en: 'Either hierarchical `data` or flat rows with `groupKey` and `valueKey`.',
        ru: 'Либо иерархические данные в `data`, либо плоские строки с `groupKey` и `valueKey`.',
        kk: '`data` ішіндегі иерархиялық деректер немесе `groupKey` пен `valueKey` бар бір деңгейлі жолдар.',
      },
      props: [
        {
          name: 'data',
          type: 'TreemapDatum | readonly TreemapDatum[] | readonly T[]',
          required: true,
          description: {
            en: 'A root node, a list of top-level nodes, or flat rows.',
            ru: 'Корневой узел, список узлов верхнего уровня или плоские строки.',
            kk: 'Түбір түйін, жоғарғы деңгей түйіндерінің тізімі немесе бір деңгейлі жолдар.',
          },
        },
        {
          name: 'groupKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: 'Flat rows: top-level category.',
            ru: 'Плоские строки: категория верхнего уровня.',
            kk: 'Бір деңгейлі жолдар: жоғарғы деңгей санаты.',
          },
        },
        {
          name: 'subgroupKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: 'Flat rows: optional second level.',
            ru: 'Плоские строки: необязательный второй уровень.',
            kk: 'Бір деңгейлі жолдар: міндетті емес екінші деңгей.',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: "Flat rows: tile name (without it a group's rows are summed into one tile).",
            ru: 'Плоские строки: название плитки (без него строки группы суммируются в одну плитку).',
            kk: 'Бір деңгейлі жолдар: тақта атауы (онсыз топ жолдары бір тақтаға қосылады).',
          },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          description: {
            en: 'Flat rows: value (required with `groupKey`).',
            ru: 'Плоские строки: значение (обязательно вместе с `groupKey`).',
            kk: 'Бір деңгейлі жолдар: мән (`groupKey` бар болса, міндетті).',
          },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          default: { en: 'theme palette', ru: 'палитра темы', kk: 'тақырып палитрасы' },
          description: {
            en: 'Colours of top-level categories by position.',
            ru: 'Цвета категорий верхнего уровня по порядку.',
            kk: 'Жоғарғы деңгей санаттарының реті бойынша түстер.',
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
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Tile tooltip with share of the parent.',
            ru: 'Подсказка плитки с долей от родителя.',
            kk: 'Ата-ана түйіндегі үлесі көрсетілетін тақтаның қалқымалы кеңесі.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: { en: '2–12 categories', ru: '2–12 категорий', kk: '2–12 санат' },
          description: {
            en: 'Top-level categories; clicking one hides its branch.',
            ru: 'Категории верхнего уровня; нажатие на категорию скрывает её ветвь.',
            kk: 'Жоғарғы деңгей санаттары; санатты басқанда оның тармағы жасырылады.',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Name and value on tiles that fit.',
            ru: 'Название и значение на плитках, где они помещаются.',
            kk: 'Сыятын тақталардағы атау мен мән.',
          },
        },
        {
          name: 'headers',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Header strips with the name on parent tiles.',
            ru: 'Полосы-заголовки с названием на родительских плитках.',
            kk: 'Ата-ана тақталардағы атауы бар тақырып жолақтары.',
          },
        },
        {
          name: 'gap',
          type: 'number',
          default: '2',
          description: {
            en: 'Gap between tiles, px.',
            ru: 'Зазор между плитками, px.',
            kk: 'Тақталар арасындағы аралық, px.',
          },
        },
        {
          name: 'cornerRadius',
          type: 'number',
          description: {
            en: 'Tile corner radius, px.',
            ru: 'Радиус скругления углов плиток, px.',
            kk: 'Тақта бұрыштарын дөңгелектеу радиусы, px.',
          },
        },
        {
          name: 'depthShading',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Slightly lighter tiles at deeper levels.',
            ru: 'Плитки на более глубоких уровнях немного светлее.',
            kk: 'Тереңірек деңгейлердегі тақталар сәл ашығырақ.',
          },
        },
        {
          name: 'drilldown',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Click a category to zoom in; Backspace or the breadcrumb zooms out.',
            ru: 'Нажатие на категорию приближает её; Backspace или «хлебные крошки» возвращают на уровень выше.',
            kk: 'Санатты басқанда ол жақындатылады; Backspace немесе навигация тізбегі бір деңгей жоғары қайтарады.',
          },
        },
        {
          name: 'texts',
          type: 'Partial<TreemapTexts>',
          description: {
            en: 'Overrides for `all`, `back`, `breadcrumb`, `share`, `ofParent` (built in for en, ru, kk).',
            ru: 'Переопределения текстов `all`, `back`, `breadcrumb`, `share`, `ofParent` (встроены для en, ru, kk).',
            kk: '`all`, `back`, `breadcrumb`, `share`, `ofParent` мәтіндерін қайта анықтау (en, ru, kk үшін кірістірілген).',
          },
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: {
            en: 'Hidden top-level categories.',
            ru: 'Скрытые категории верхнего уровня.',
            kk: 'Жасырылған жоғарғы деңгей санаттары.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: TreemapItemEvent) => void',
          description: {
            en: 'Event with `datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf`.',
            ru: 'Событие с полями `datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf`.',
            kk: '`datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf` өрістері бар оқиға.',
          },
        },
        {
          name: 'onDrilldown',
          type: '(path: string[]) => void',
          description: {
            en: 'Called with the zoomed path after drill-down navigation.',
            ru: 'Вызывается с путём к открытому уровню после перехода при детализации.',
            kk: 'Тереңдеп қарау кезінде деңгей ауысқанда ашылған деңгейдің жолымен шақырылады.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

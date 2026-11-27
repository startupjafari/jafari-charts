import { TreemapChart } from '@startupjafari/charts';
import { budgetTree } from '../../examples/data';
import { baseGroup } from '../props';
import type { ChartDoc } from '../types';

export const treemapChart: ChartDoc = {
  slug: 'treemap-chart',
  component: 'TreemapChart',
  title: { en: 'Treemap', ru: 'Древовидная карта (treemap)' },
  group: 'Advanced',
  summary: {
    en: 'Part-to-whole for hierarchies, as nested rectangles sized by value.',
    ru: 'Доли целого в иерархических данных: вложенные прямоугольники, площадь которых пропорциональна значению.',
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
        title: { en: 'Hierarchical data', ru: 'Иерархические данные' },
      },
      { id: 'treemap-chart/Rows', title: { en: 'Flat rows', ru: 'Плоские строки' } },
    ],
    styling: [
      {
        id: 'treemap-chart/Styling',
        title: {
          en: 'Colours, depth shading, gaps and radius',
          ru: 'Цвета, оттенки по уровням, зазоры и скругление',
        },
      },
    ],
    interaction: [
      {
        id: 'treemap-chart/Drilldown',
        title: { en: 'Drill-down', ru: 'Детализация (drill-down)' },
      },
    ],
    responsive: [
      {
        id: 'treemap-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер' },
        width: 320,
      },
    ],
    empty: [{ id: 'treemap-chart/States', title: { en: 'Empty state', ru: 'Нет данных' } }],
  },
  keyboard: [
    [
      '← →',
      {
        en: 'Previous / next tile (largest first, depth first)',
        ru: 'Предыдущая / следующая плитка (от крупных к мелким, обход в глубину)',
      },
    ],
    ['↑ ↓', { en: 'Tile above / below', ru: 'Плитка выше / ниже' }],
    ['Home End', { en: 'First / last tile', ru: 'Первая / последняя плитка' }],
    [
      'Enter',
      {
        en: 'Click; with drilldown, zoom into the category',
        ru: 'Нажатие; с drilldown — приблизить категорию',
      },
    ],
    [
      'Backspace',
      { en: 'Zoom out one level (drilldown)', ru: 'Подняться на уровень выше (drilldown)' },
    ],
    ['Esc', { en: 'Clear the active tile', ru: 'Сбросить активную плитку' }],
  ],
  props: [
    {
      title: { en: 'TreemapChart props', ru: 'Пропсы TreemapChart' },
      note: {
        en: 'Either hierarchical `data` or flat rows with `groupKey` and `valueKey`.',
        ru: 'Либо иерархические данные в `data`, либо плоские строки с `groupKey` и `valueKey`.',
      },
      props: [
        {
          name: 'data',
          type: 'TreemapDatum | readonly TreemapDatum[] | readonly T[]',
          required: true,
          description: {
            en: 'A root node, a list of top-level nodes, or flat rows.',
            ru: 'Корневой узел, список узлов верхнего уровня или плоские строки.',
          },
        },
        {
          name: 'groupKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: 'Flat rows: top-level category.',
            ru: 'Плоские строки: категория верхнего уровня.',
          },
        },
        {
          name: 'subgroupKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: 'Flat rows: optional second level.',
            ru: 'Плоские строки: необязательный второй уровень.',
          },
        },
        {
          name: 'labelKey',
          type: 'KeysMatching<T, string | number>',
          description: {
            en: "Flat rows: tile name (without it a group's rows are summed into one tile).",
            ru: 'Плоские строки: название плитки (без него строки группы суммируются в одну плитку).',
          },
        },
        {
          name: 'valueKey',
          type: 'NumericKey<T>',
          description: {
            en: 'Flat rows: value (required with `groupKey`).',
            ru: 'Плоские строки: значение (обязательно вместе с `groupKey`).',
          },
        },
        {
          name: 'colors',
          type: 'readonly string[]',
          default: { en: 'theme palette', ru: 'палитра темы' },
          description: {
            en: 'Colours of top-level categories by position.',
            ru: 'Цвета категорий верхнего уровня по порядку.',
          },
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: { en: 'Formats values.', ru: 'Форматирует значения.' },
        },
        {
          name: 'tooltip',
          type: 'boolean | TooltipOptions',
          default: 'true',
          description: {
            en: 'Tile tooltip with share of the parent.',
            ru: 'Подсказка плитки с долей от родителя.',
          },
        },
        {
          name: 'legend',
          type: 'boolean | LegendOptions',
          default: { en: '2–12 categories', ru: '2–12 категорий' },
          description: {
            en: 'Top-level categories; clicking one hides its branch.',
            ru: 'Категории верхнего уровня; нажатие на категорию скрывает её ветвь.',
          },
        },
        {
          name: 'labels',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Name and value on tiles that fit.',
            ru: 'Название и значение на плитках, где они помещаются.',
          },
        },
        {
          name: 'headers',
          type: 'boolean',
          default: 'true',
          description: {
            en: 'Header strips with the name on parent tiles.',
            ru: 'Полосы-заголовки с названием на родительских плитках.',
          },
        },
        {
          name: 'gap',
          type: 'number',
          default: '2',
          description: { en: 'Gap between tiles, px.', ru: 'Зазор между плитками, px.' },
        },
        {
          name: 'cornerRadius',
          type: 'number',
          description: {
            en: 'Tile corner radius, px.',
            ru: 'Радиус скругления углов плиток, px.',
          },
        },
        {
          name: 'depthShading',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Slightly lighter tiles at deeper levels.',
            ru: 'Плитки на более глубоких уровнях немного светлее.',
          },
        },
        {
          name: 'drilldown',
          type: 'boolean',
          default: 'false',
          description: {
            en: 'Click a category to zoom in; Backspace or the breadcrumb zooms out.',
            ru: 'Нажатие на категорию приближает её; Backspace или «хлебные крошки» возвращают на уровень выше.',
          },
        },
        {
          name: 'texts',
          type: 'Partial<TreemapTexts>',
          description: {
            en: 'Overrides for `all`, `back`, `breadcrumb`, `share`, `ofParent` (built in for en, ru, kk).',
            ru: 'Переопределения текстов `all`, `back`, `breadcrumb`, `share`, `ofParent` (встроены для en, ru, kk).',
          },
        },
        {
          name: 'hiddenSeries / defaultHiddenSeries / onHiddenSeriesChange',
          type: 'readonly string[] / (hidden: string[]) => void',
          description: {
            en: 'Hidden top-level categories.',
            ru: 'Скрытые категории верхнего уровня.',
          },
        },
        {
          name: 'onHover / onClick',
          type: '(event: TreemapItemEvent) => void',
          description: {
            en: 'Event with `datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf`.',
            ru: 'Событие с полями `datum`, `key`, `name`, `path`, `value`, `share`, `depth`, `leaf`.',
          },
        },
        {
          name: 'onDrilldown',
          type: '(path: string[]) => void',
          description: {
            en: 'Called with the zoomed path after drill-down navigation.',
            ru: 'Вызывается с путём к открытому уровню после перехода при детализации.',
          },
        },
      ],
    },
    baseGroup,
  ],
};

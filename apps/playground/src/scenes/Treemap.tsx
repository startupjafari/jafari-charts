import { TreemapChart, type TreemapDatum } from '@startupjafari/charts';
import { Keyboard, MousePointerClick } from '../ui/icons';
import type { ReactNode } from 'react';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';
import { Kbd } from '../ui/kbd';

const budget: TreemapDatum = {
  name: 'University budget',
  children: [
    {
      name: 'Academics',
      children: [
        {
          name: 'Engineering',
          children: [
            { name: 'Salaries', value: 4200 },
            { name: 'Labs', value: 1650 },
            { name: 'Equipment', value: 980 },
            { name: 'Travel', value: 240 },
          ],
        },
        {
          name: 'Sciences',
          children: [
            { name: 'Salaries', value: 3100 },
            { name: 'Research grants', value: 1400 },
            { name: 'Field work', value: 380 },
          ],
        },
        {
          name: 'Humanities',
          children: [
            { name: 'Salaries', value: 1900 },
            { name: 'Library', value: 620 },
          ],
        },
      ],
    },
    {
      name: 'Student services',
      children: [
        { name: 'Scholarships', value: 2600 },
        { name: 'Dormitories', value: 1850 },
        { name: 'Counselling', value: 420 },
        { name: 'Sports', value: 510 },
      ],
    },
    {
      name: 'Operations',
      children: [
        { name: 'Facilities', value: 2100 },
        { name: 'IT', value: 1300 },
        { name: 'Administration', value: 1150 },
        { name: 'Security', value: 300 },
      ],
    },
    {
      name: 'Marketing',
      children: [
        { name: 'Digital', value: 450 },
        { name: 'Events', value: 260 },
        { name: 'Print', value: 60 },
      ],
    },
    { name: 'Reserve', value: 900 },
  ],
};

const sales = [
  { region: 'North', city: 'Astana', product: 'Tea', amount: 420 },
  { region: 'North', city: 'Astana', product: 'Coffee', amount: 610 },
  { region: 'North', city: 'Astana', product: 'Juice', amount: 180 },
  { region: 'North', city: 'Kokshetau', product: 'Tea', amount: 250 },
  { region: 'North', city: 'Kokshetau', product: 'Coffee', amount: 140 },
  { region: 'South', city: 'Almaty', product: 'Tea', amount: 930 },
  { region: 'South', city: 'Almaty', product: 'Coffee', amount: 880 },
  { region: 'South', city: 'Almaty', product: 'Juice', amount: 310 },
  { region: 'South', city: 'Shymkent', product: 'Coffee', amount: 350 },
  { region: 'South', city: 'Shymkent', product: 'Tea', amount: 290 },
  { region: 'West', city: 'Aktobe', product: 'Tea', amount: 260 },
  { region: 'West', city: 'Atyrau', product: 'Coffee', amount: 330 },
  { region: 'West', city: 'Atyrau', product: 'Juice', amount: -40 },
  { region: 'East', city: 'Oskemen', product: 'Tea', amount: 190 },
];

const big: TreemapDatum[] = Array.from({ length: 8 }, (_, g) => ({
  name: `Faculty ${String.fromCharCode(65 + g)}`,
  children: Array.from({ length: 10 }, (_, s) => ({
    name: `Course ${g + 1}.${s + 1}`,
    children: Array.from({ length: 25 }, (_, l) => ({
      name: `Student ${l + 1}`,
      value: 1 + ((g * 31 + s * 7 + l * 13) % 97),
    })),
  })),
}));

let deep: TreemapDatum = { name: 'Level 8', value: 30 };
for (let d = 7; d >= 1; d--)
  deep = { name: `Level ${d}`, children: [deep, { name: `Side ${d}`, value: 40 + d * 15 }] };

const CARDS = defineCards({
  en: {
    budget: {
      title: 'Treemap (hierarchy, click to drill down)',
      description: 'A university budget, three levels deep, with drill-down.',
    },
    flat: {
      title: 'Treemap (flat rows: region › city › product)',
      description: 'Grouped from flat rows; the negative amount is skipped.',
    },
    summed: {
      title: 'Treemap (rows summed per region)',
      description: 'One tile per region, rows summed.',
    },
    big: {
      title: 'Treemap (2,000 leaves)',
      description: 'Stress test: 8 faculties × 10 courses × 25 students.',
    },
    deep: {
      title: 'Treemap (deep tree, depth shading)',
      description: 'Eight nested levels shaded by depth.',
    },
    single: { title: 'Treemap (single node)', description: 'One tile filling the plot.' },
    nonPositive: {
      title: 'Treemap (zero and negative only)',
      description: 'Nothing positive to draw, so the empty state shows.',
    },
  },
  ru: {
    budget: {
      title: 'Древовидная карта (иерархия, щелчок — детализация)',
      description: 'Бюджет университета на три уровня вглубь, с детализацией.',
    },
    flat: {
      title: 'Древовидная карта (плоские строки: регион › город › товар)',
      description: 'Группировка из плоских строк; отрицательная сумма пропускается.',
    },
    summed: {
      title: 'Древовидная карта (строки суммируются по регионам)',
      description: 'По одной плитке на регион, строки суммируются.',
    },
    big: {
      title: 'Древовидная карта (2 000 листьев)',
      description: 'Стресс-тест: 8 факультетов × 10 курсов × 25 студентов.',
    },
    deep: {
      title: 'Древовидная карта (глубокое дерево, оттенок по глубине)',
      description: 'Восемь вложенных уровней, оттенок зависит от глубины.',
    },
    single: {
      title: 'Древовидная карта (один узел)',
      description: 'Одна плитка на всю область построения.',
    },
    nonPositive: {
      title: 'Древовидная карта (только нули и отрицательные)',
      description: 'Положительных значений нет, поэтому показано пустое состояние.',
    },
  },
  kk: {
    budget: {
      title: 'Ағаштық карта (иерархия, басу — ішіне үңілу)',
      description: 'Үш деңгейлі университет бюджеті, ішіне үңілу мүмкіндігімен.',
    },
    flat: {
      title: 'Ағаштық карта (жазық жолдар: өңір › қала › өнім)',
      description: 'Жазық жолдардан топтастырылған; теріс сома ескерілмейді.',
    },
    summed: {
      title: 'Ағаштық карта (жолдар өңір бойынша қосылады)',
      description: 'Әр өңірге бір плитка, жолдар қосылады.',
    },
    big: {
      title: 'Ағаштық карта (2 000 жапырақ)',
      description: 'Стресс-тест: 8 факультет × 10 курс × 25 студент.',
    },
    deep: {
      title: 'Ағаштық карта (терең ағаш, тереңдік бойынша реңк)',
      description: 'Сегіз кірістірілген деңгей, реңкі тереңдікке байланысты.',
    },
    single: {
      title: 'Ағаштық карта (жалғыз түйін)',
      description: 'Сызу аймағын толтыратын бір плитка.',
    },
    nonPositive: {
      title: 'Ағаштық карта (тек нөл және теріс мәндер)',
      description: 'Оң мән жоқ, сондықтан бос күй көрсетіледі.',
    },
  },
});

interface TreemapText {
  drill: string;
  keyboard: (keys: { move: ReactNode; enter: ReactNode; back: ReactNode }) => ReactNode;
  showcase: string;
  edge: string;
}

const TEXT: L<TreemapText> = {
  en: {
    drill: 'Click a group to drill in; use the breadcrumb to go back',
    keyboard: ({ move, enter, back }) => (
      <>
        Focus, then {move} to move, {enter} to drill in, {back} to go back
      </>
    ),
    showcase: 'Nested trees and grouped flat rows, from a handful of tiles to two thousand.',
    edge: 'Degenerate trees: a single node and nothing positive to draw.',
  },
  ru: {
    drill: 'Щёлкните группу, чтобы перейти внутрь; назад — по цепочке навигации',
    keyboard: ({ move, enter, back }) => (
      <>
        В фокусе: {move} — перемещение, {enter} — внутрь, {back} — назад
      </>
    ),
    showcase:
      'Вложенные деревья и сгруппированные плоские строки — от нескольких плиток до двух тысяч.',
    edge: 'Вырожденные деревья: один узел и ни одного положительного значения.',
  },
  kk: {
    drill: 'Ішіне өту үшін топты басыңыз; кері оралу үшін навигация тізбегін пайдаланыңыз',
    keyboard: ({ move, enter, back }) => (
      <>
        Фокус қойылғанда: {move} — жылжу, {enter} — ішіне өту, {back} — артқа
      </>
    ),
    showcase:
      'Кірістірілген ағаштар мен топтастырылған жазық жолдар — бірнеше плиткадан екі мыңға дейін.',
    edge: 'Азғындалған ағаштар: жалғыз түйін және бірде-бір оң мән жоқ.',
  },
};

export function Treemap() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  const t = useT();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="treemap"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointerClick}>{text.drill}</Hint>
          <Hint icon={Keyboard}>
            {text.keyboard({
              move: (
                <>
                  <Kbd>←</Kbd>
                  <Kbd>→</Kbd>
                </>
              ),
              enter: <Kbd>Enter</Kbd>,
              back: <Kbd>⌫</Kbd>,
            })}
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection title={t.sections.showcase} count={5} description={text.showcase}>
          <Card {...card('budget')}>
            <TreemapChart
              data={budget}
              drilldown
              title="University budget"
              valueFormatter={(v) => `$${v.toLocaleString('en')}k`}
              animation={animation}
            />
          </Card>
          <Card {...card('flat')}>
            <TreemapChart
              data={sales}
              groupKey="region"
              subgroupKey="city"
              labelKey="product"
              valueKey="amount"
              animation={animation}
            />
          </Card>
          <Card {...card('summed')}>
            <TreemapChart
              data={sales}
              groupKey="region"
              valueKey="amount"
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('big')}>
            <TreemapChart data={big} height={420} animation={animation} />
          </Card>
          <Card {...card('deep')}>
            <TreemapChart data={deep} depthShading animation={animation} />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection title={t.sections.edgeCases} count={2} description={text.edge}>
          <Card {...card('single')}>
            <TreemapChart data={{ name: 'Tuition', value: 1 }} height={160} animation={animation} />
          </Card>
          <Card {...card('nonPositive')}>
            <TreemapChart
              data={[
                { name: 'Refunds', value: -20 },
                { name: 'Grants', value: 0 },
              ]}
              height={160}
            />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

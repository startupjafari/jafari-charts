import { TreemapChart, type TreemapDatum } from '@startupjafari/charts';
import { Keyboard, MousePointerClick } from '../ui/icons';
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

export function Treemap() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  return (
    <ScenePage
      scene="treemap"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointerClick}>
            Click a group to drill in; use the breadcrumb to go back
          </Hint>
          <Hint icon={Keyboard}>
            Focus, then <Kbd>←</Kbd>
            <Kbd>→</Kbd> to move, <Kbd>Enter</Kbd> to drill in, <Kbd>⌫</Kbd> to go back
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection
          title="Showcase"
          count={5}
          description="Nested trees and grouped flat rows, from a handful of tiles to two thousand."
        >
          <Card
            title="Treemap (hierarchy, click to drill down)"
            description="A university budget, three levels deep, with drill-down."
          >
            <TreemapChart
              data={budget}
              drilldown
              title="University budget"
              valueFormatter={(v) => `$${v.toLocaleString('en')}k`}
              animation={animation}
            />
          </Card>
          <Card
            title="Treemap (flat rows: region › city › product)"
            description="Grouped from flat rows; the negative amount is skipped."
          >
            <TreemapChart
              data={sales}
              groupKey="region"
              subgroupKey="city"
              labelKey="product"
              valueKey="amount"
              animation={animation}
            />
          </Card>
          <Card
            title="Treemap (rows summed per region)"
            description="One tile per region, rows summed."
          >
            <TreemapChart
              data={sales}
              groupKey="region"
              valueKey="amount"
              height={240}
              animation={animation}
            />
          </Card>
          <Card
            title="Treemap (2,000 leaves)"
            description="Stress test: 8 faculties × 10 courses × 25 students."
          >
            <TreemapChart data={big} height={420} animation={animation} />
          </Card>
          <Card
            title="Treemap (deep tree, depth shading)"
            description="Eight nested levels shaded by depth."
          >
            <TreemapChart data={deep} depthShading animation={animation} />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection
          title="Edge cases"
          count={2}
          description="Degenerate trees: a single node and nothing positive to draw."
        >
          <Card title="Treemap (single node)" description="One tile filling the plot.">
            <TreemapChart data={{ name: 'Tuition', value: 1 }} height={160} animation={animation} />
          </Card>
          <Card
            title="Treemap (zero and negative only)"
            description="Nothing positive to draw, so the empty state shows."
          >
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

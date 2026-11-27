import { RadarChart } from '@startupjafari/charts';
import { Keyboard, MousePointer2, MousePointerClick } from 'lucide-react';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';
import { Kbd } from '../ui/kbd';

const skills = [
  { skill: 'Mathematics', alice: 92, bob: 64, class: 71 },
  { skill: 'Physics', alice: 78, bob: 70, class: 66 },
  { skill: 'Literature', alice: 55, bob: 88, class: 69 },
  { skill: 'History', alice: 61, bob: 82, class: 72 },
  { skill: 'Languages', alice: 70, bob: 91, class: 74 },
  { skill: 'Computer science', alice: 95, bob: 58, class: 63 },
];

const teams = [
  { metric: 'Attendance', a: 8, b: 6, c: 9, d: 5, e: 7, f: 6 },
  { metric: 'Homework', a: 7, b: 9, c: 6, d: 8, e: 5, f: 7 },
  { metric: 'Projects', a: 6, b: 7, c: 8, d: 9, e: 6, f: 5 },
  { metric: 'Exams', a: 9, b: 6, c: 7, d: 6, e: 8, f: 9 },
  { metric: 'Participation', a: 5, b: 8, c: 6, d: 7, e: 9, f: 8 },
];

const deltas = [
  { area: 'Enrolment', y2024: 12, y2025: -8 },
  { area: 'Retention', y2024: 4, y2025: 9 },
  { area: 'Funding', y2024: -15, y2025: 6 },
  { area: 'Research', y2024: 18, y2025: null },
  { area: 'Satisfaction', y2024: 3, y2025: 14 },
];

const longLabels = [
  { m: 'Quality of teaching and learning materials', v: 72, w: 60 },
  { m: 'Student support services', v: 64, w: 80 },
  { m: 'Campus infrastructure and digital facilities', v: 81, w: 55 },
  { m: 'Graduate employment outcomes after one year', v: 58, w: 70 },
  { m: 'Research output', v: 77, w: 66 },
  { m: 'International partnerships and exchange programmes', v: 49, w: 74 },
  { m: 'Diversity', v: 66, w: 62 },
  { m: 'Alumni engagement', v: 53, w: 59 },
];

const three = [
  { k: 'Speed', v: 8, w: 5 },
  { k: 'Accuracy', v: 6, w: 9 },
  { k: 'Cost', v: 4, w: 7 },
];

export function Radar() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  return (
    <ScenePage
      scene="radar"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>Hover an axis for every series’ value</Hint>
          <Hint icon={MousePointerClick}>Click legend items to hide series</Hint>
          <Hint icon={Keyboard}>
            Focus, then <Kbd>←</Kbd>
            <Kbd>→</Kbd> between axes
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection
          title="Showcase"
          count={4}
          description="Profiles compared across several metrics."
        >
          <Card
            title="Radar chart"
            description="Two students and the class average on a 0–100 scale."
          >
            <RadarChart
              data={skills}
              labelKey="skill"
              series={[
                { key: 'alice', label: 'Alice' },
                { key: 'bob', label: 'Bob' },
                { key: 'class', label: 'Class average' },
              ]}
              max={100}
              animation={animation}
            />
          </Card>
          <Card
            title="Circle grid, 6 datasets, differentiate"
            description="A circular grid; marker shapes tell six teams apart."
          >
            <RadarChart
              data={teams}
              labelKey="metric"
              series={(['a', 'b', 'c', 'd', 'e', 'f'] as const).map((k) => ({
                key: k,
                label: `Team ${k.toUpperCase()}`,
              }))}
              shape="circle"
              max={10}
              levels={5}
              differentiate
              animation={animation}
            />
          </Card>
          <Card
            title="Negative values + missing value"
            description="Year-over-year change around zero; one value is missing."
          >
            <RadarChart
              data={deltas}
              labelKey="area"
              series={[
                { key: 'y2024', label: '2024' },
                { key: 'y2025', label: '2025' },
              ]}
              valueFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
              tickFormatter={(v) => `${v}%`}
              animation={animation}
            />
          </Card>
          <Card
            title="Long labels, 8 metrics"
            description="Eight long axis labels wrapped around the chart."
          >
            <RadarChart
              data={longLabels}
              labelKey="m"
              series={[
                { key: 'v', label: 'Our university' },
                { key: 'w', label: 'Peer median' },
              ]}
              animation={animation}
            />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection title="Edge cases" count={2} description="Few axes and narrow containers.">
          <Card
            title="Three metrics · two metrics · one dataset"
            description="The minimum: three axes, two axes, a single series."
          >
            <div className="grid grid-cols-2 gap-3">
              <RadarChart
                data={three}
                labelKey="k"
                series={[
                  { key: 'v', label: 'Model A' },
                  { key: 'w', label: 'Model B' },
                ]}
                height={220}
                animation={animation}
              />
              <RadarChart
                data={three.slice(0, 2)}
                labelKey="k"
                series={[{ key: 'v', label: 'Model A' }]}
                height={220}
                animation={animation}
              />
            </div>
          </Card>
          <Card title="Narrow (260px)" description="Still readable in a 260 px container.">
            <div className="w-[260px]">
              <RadarChart
                data={skills}
                labelKey="skill"
                series={[
                  { key: 'alice', label: 'Alice' },
                  { key: 'bob', label: 'Bob' },
                ]}
                height={240}
                animation={animation}
              />
            </div>
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

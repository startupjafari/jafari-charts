import { DonutChart, GaugeChart, PieChart, RadialProgressChart } from '@startupjafari/charts';
import { MousePointer2, MousePointerClick } from 'lucide-react';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';

const roles = [
  { role: 'Students', count: 18420 },
  { role: 'Teachers', count: 1260 },
  { role: 'Curators', count: 340 },
  { role: 'Admins', count: 58 },
];
const browsers = [
  { name: 'Chrome', share: 61 },
  { name: 'Safari', share: 19 },
  { name: 'Edge', share: 9 },
  { name: 'Firefox', share: 6 },
  { name: 'Other', share: 5 },
];

export function Polar() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  return (
    <ScenePage
      scene="polar"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>Hover a slice to highlight it</Hint>
          <Hint icon={MousePointerClick}>Click legend items to hide slices</Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection
          title="Showcase"
          count={5}
          description="Parts of a whole and progress towards a goal."
        >
          <Card title="Donut chart" description="User roles, with the total in the centre.">
            <DonutChart data={roles} labelKey="role" valueKey="count" animation={animation} />
          </Card>
          <Card title="Pie chart" description="Browser share with a legend.">
            <PieChart data={browsers} labelKey="name" valueKey="share" animation={animation} />
          </Card>
          <Card
            title="Pie chart (outside labels)"
            description="Labels with leader lines instead of a legend."
          >
            <PieChart
              data={browsers}
              labelKey="name"
              valueKey="share"
              labels="outside"
              legend={false}
              animation={animation}
            />
          </Card>
          <Card title="Radial progress" description="A single goal, and three concentric rings.">
            <div className="grid grid-cols-2 gap-4">
              <RadialProgressChart value={72} label="Plan completion" animation={animation} />
              <RadialProgressChart
                data={[
                  { label: 'Attendance', value: 86 },
                  { label: 'Assignments', value: 64 },
                  { label: 'Exams', value: 41 },
                ]}
                animation={animation}
              />
            </div>
          </Card>
          <Card title="Gauge chart" description="Coloured bands, and a needle on an arc.">
            <div className="grid grid-cols-2 gap-4">
              <GaugeChart
                value={68}
                label="Satisfaction"
                bands={[
                  { to: 40, color: 'var(--jc-negative)', label: 'Low' },
                  { to: 75, color: 'var(--jc-warning)', label: 'Medium' },
                  { to: 100, color: 'var(--jc-positive)', label: 'High' },
                ]}
                animation={animation}
              />
              <GaugeChart
                value={82}
                needle
                variant="arc"
                label="Server load"
                valueFormatter={(v) => `${v}%`}
                bands={[
                  { to: 60, color: 'var(--jc-positive)' },
                  { to: 85, color: 'var(--jc-warning)' },
                  { to: 100, color: 'var(--jc-negative)' },
                ]}
                animation={animation}
              />
            </div>
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection
          title="Edge cases"
          count={1}
          description="What a polar chart shows without data."
        >
          <Card title="Donut (empty)" description="No rows: the empty state replaces the ring.">
            <DonutChart data={[] as typeof roles} labelKey="role" valueKey="count" />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

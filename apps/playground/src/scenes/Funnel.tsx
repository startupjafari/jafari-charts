import { FunnelChart } from '@startupjafari/charts';
import { Keyboard, MousePointer2 } from 'lucide-react';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';
import { Kbd } from '../ui/kbd';

const admissions = [
  { stage: 'Visited landing page', count: 48200 },
  { stage: 'Started application', count: 21400 },
  { stage: 'Submitted documents', count: 12950 },
  { stage: 'Passed interview', count: 6120 },
  { stage: 'Enrolled', count: 4380 },
];
const checkout = [
  { step: 'Cart', sessions: 9400 },
  { step: 'Shipping', sessions: 6100 },
  { step: 'Payment', sessions: 4700 },
  { step: 'Confirmed', sessions: 4100 },
];
const referral = [
  { step: 'Trial started', users: 1200 },
  { step: 'Invited a colleague', users: 1450 },
  { step: 'Team plan', users: 610 },
  { step: 'Annual billing (only teams with more than fifty seats qualify)', users: null },
  { step: 'Renewed', users: 380 },
];
const longFunnel = Array.from({ length: 24 }, (_, i) => ({
  step: `Lesson ${i + 1}`,
  learners: Math.round(5000 * Math.pow(0.9, i)),
}));
const ru = [
  { этап: 'Просмотр курса', люди: 15800 },
  { этап: 'Регистрация', люди: 6400 },
  { этап: 'Первое занятие', люди: 3900 },
  { этап: 'Оплата', люди: 1250 },
];

export function Funnel() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  return (
    <ScenePage
      scene="funnel"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>Hover a stage for its count and conversion</Hint>
          <Hint icon={Keyboard}>
            Focus, then <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> between stages
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection
          title="Showcase"
          count={8}
          description="Shapes, orientations and percentage bases for conversion funnels."
        >
          <Card
            title="Funnel (bars, % of first stage)"
            description="University admissions; percentages of the first stage."
          >
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              title="Admissions funnel"
              animation={animation}
            />
          </Card>
          <Card title="Funnel (trapezoid)" description="The classic funnel shape.">
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              variant="trapezoid"
              animation={animation}
            />
          </Card>
          <Card
            title="Funnel (% of previous stage)"
            description="Step-to-step conversion of a checkout."
          >
            <FunnelChart
              data={checkout}
              labelKey="step"
              valueKey="sessions"
              percentBase="previous"
              animation={animation}
            />
          </Card>
          <Card title="Funnel (horizontal)" description="Stages from left to right.">
            <FunnelChart
              data={checkout}
              labelKey="step"
              valueKey="sessions"
              orientation="horizontal"
              animation={animation}
            />
          </Card>
          <Card title="Funnel (horizontal trapezoid)" description="Horizontal, with sloped sides.">
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              orientation="horizontal"
              variant="trapezoid"
              animation={animation}
            />
          </Card>
          <Card
            title="Funnel (growth, missing value, long names)"
            description="A stage larger than the one before, a gap and a long name."
          >
            <FunnelChart data={referral} labelKey="step" valueKey="users" animation={animation} />
          </Card>
          <Card
            title="Funnel (24 stages)"
            description="A dense funnel: learners dropping off over a course."
          >
            <FunnelChart
              data={longFunnel}
              labelKey="step"
              valueKey="learners"
              height={360}
              animation={animation}
            />
          </Card>
          <Card
            title="Funnel (custom colour, ru locale)"
            description="Russian labels and number formatting, custom colour."
          >
            <FunnelChart
              data={ru}
              labelKey="этап"
              valueKey="люди"
              color="var(--jc-series-3)"
              locale="ru"
              animation={animation}
            />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection
          title="Edge cases"
          count={3}
          description="Degenerate data: one stage, all zeros, no rows."
        >
          <Card title="Funnel (single stage)" description="One stage only.">
            <FunnelChart
              data={[{ step: 'Applied', users: 320 }]}
              labelKey="step"
              valueKey="users"
              animation={animation}
            />
          </Card>
          <Card title="Funnel (all zeros)" description="Every stage is zero.">
            <FunnelChart
              data={checkout.map((d) => ({ ...d, sessions: 0 }))}
              labelKey="step"
              valueKey="sessions"
              animation={animation}
            />
          </Card>
          <Card title="Funnel (empty)" description="No rows: the empty state.">
            <FunnelChart data={[] as typeof checkout} labelKey="step" valueKey="sessions" />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

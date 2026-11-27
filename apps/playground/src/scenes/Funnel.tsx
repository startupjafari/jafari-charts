import { FunnelChart } from '@startupjafari/charts';
import type { ReactNode } from 'react';

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

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card" data-testid={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Funnel() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  return (
    <div className="grid">
      <Card title="Funnel (bars, % of first stage)">
        <FunnelChart
          data={admissions}
          labelKey="stage"
          valueKey="count"
          title="Admissions funnel"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (trapezoid)">
        <FunnelChart
          data={admissions}
          labelKey="stage"
          valueKey="count"
          variant="trapezoid"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (% of previous stage)">
        <FunnelChart
          data={checkout}
          labelKey="step"
          valueKey="sessions"
          percentBase="previous"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (horizontal)">
        <FunnelChart
          data={checkout}
          labelKey="step"
          valueKey="sessions"
          orientation="horizontal"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (horizontal trapezoid)">
        <FunnelChart
          data={admissions}
          labelKey="stage"
          valueKey="count"
          orientation="horizontal"
          variant="trapezoid"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (growth, missing value, long names)">
        <FunnelChart data={referral} labelKey="step" valueKey="users" animation={animation} />
      </Card>
      <Card title="Funnel (24 stages)">
        <FunnelChart
          data={longFunnel}
          labelKey="step"
          valueKey="learners"
          height={360}
          animation={animation}
        />
      </Card>
      <Card title="Funnel (custom colour, ru locale)">
        <FunnelChart
          data={ru}
          labelKey="этап"
          valueKey="люди"
          color="var(--jc-series-3)"
          locale="ru"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (single stage)">
        <FunnelChart
          data={[{ step: 'Applied', users: 320 }]}
          labelKey="step"
          valueKey="users"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (all zeros)">
        <FunnelChart
          data={checkout.map((d) => ({ ...d, sessions: 0 }))}
          labelKey="step"
          valueKey="sessions"
          animation={animation}
        />
      </Card>
      <Card title="Funnel (empty)">
        <FunnelChart data={[] as typeof checkout} labelKey="step" valueKey="sessions" />
      </Card>
    </div>
  );
}

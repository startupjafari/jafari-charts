import { CalendarHeatmap, ChartProvider, DonutChart, LineChart } from '@startupjafari/charts';
import { useState } from 'react';
import { activity, dailyLogins } from '../data';

const TEXT = {
  ru: {
    title: 'Активность',
    students: 'Студенты',
    teachers: 'Преподаватели',
    roles: ['Студенты', 'Преподаватели', 'Кураторы', 'Администраторы'],
    logins: 'Входы',
  },
  kk: {
    title: 'Белсенділік',
    students: 'Студенттер',
    teachers: 'Оқытушылар',
    roles: ['Студенттер', 'Оқытушылар', 'Кураторлар', 'Әкімшілер'],
    logins: 'Кірулер',
  },
} as const;

const COUNTS = [18420, 1260, 340, 58];

/** Dates, numbers, week starts and built-in texts follow the locale. */
export default function Localized() {
  const [locale, setLocale] = useState<'ru' | 'kk'>('ru');
  const t = TEXT[locale];
  return (
    <ChartProvider locale={locale}>
      <div className="demo-controls" role="group" aria-label="Language">
        {(['ru', 'kk'] as const).map((l) => (
          <button
            key={l}
            type="button"
            className="btn btn-sm"
            aria-pressed={locale === l}
            onClick={() => setLocale(l)}
          >
            {l === 'ru' ? 'Русский' : 'Қазақша'}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 20 }}>
        <LineChart
          data={activity}
          xKey="date"
          series={[
            { key: 'students', label: t.students },
            { key: 'teachers', label: t.teachers },
          ]}
          title={t.title}
          height={220}
        />
        <div className="demo-grid">
          <DonutChart
            data={t.roles.map((role, i) => ({ role, count: COUNTS[i] ?? 0 }))}
            labelKey="role"
            valueKey="count"
            height={200}
          />
          <CalendarHeatmap
            data={dailyLogins.slice(-120)}
            dateKey="date"
            valueKey="logins"
            valueLabel={t.logins}
          />
        </div>
      </div>
    </ChartProvider>
  );
}

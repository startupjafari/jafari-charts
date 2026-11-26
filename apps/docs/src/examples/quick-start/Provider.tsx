import { BarChart, ChartProvider, DonutChart } from '@jafari/charts';

const months = [
  { month: 'Қаң', students: 1250 },
  { month: 'Ақп', students: 1480 },
  { month: 'Нау', students: 1720 },
  { month: 'Сәу', students: 1610 },
  { month: 'Мам', students: 1930 },
  { month: 'Мау', students: 2210 },
];

const roles = [
  { role: 'Студенттер', count: 18420 },
  { role: 'Оқытушылар', count: 1260 },
  { role: 'Кураторлар', count: 340 },
  { role: 'Әкімшілер', count: 58 },
];

/** Defaults for every chart below the provider (here: Kazakh formatting and texts). */
export default function Provider() {
  return (
    <ChartProvider locale="kk" animation={{ duration: 400 }}>
      <div className="demo-grid">
        <BarChart data={months} xKey="month" yKey="students" label="Студенттер" height={220} />
        <DonutChart data={roles} labelKey="role" valueKey="count" height={220} />
      </div>
    </ChartProvider>
  );
}

import { BarChart, HorizontalBarChart } from '@jafari/charts';
import type { ReactNode } from 'react';

// Long Russian/Kazakh university names: wrapped category labels, per-bar colours, integer
// counts and orientation-independent axis props (?scene=universities).
const universities = [
  {
    name: 'Казахская национальная академия искусств имени Т. Жургенова',
    users: 412,
    complaints: 2,
  },
  {
    name: 'Казахский национальный аграрный исследовательский университет',
    users: 655,
    complaints: 1,
  },
  { name: 'Казахский национальный университет имени аль-Фараби', users: 1840, complaints: 0 },
  {
    name: 'Евразийский национальный университет имени Л. Н. Гумилёва',
    users: 1312,
    complaints: 2,
  },
  { name: 'Казахстанско-Британский технический университет', users: 590, complaints: 1 },
  { name: 'Satbayev University', users: 970, complaints: 0 },
];
const OWN = 'Казахский национальный университет имени аль-Фараби';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card" data-testid={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Universities() {
  const animation = new URLSearchParams(location.search).get('animation') !== 'off';
  return (
    <div className="grid">
      <Card title="Users by university">
        <HorizontalBarChart
          data={universities}
          xKey="name"
          series={[
            {
              key: 'users',
              label: 'Пользователи',
              colorBy: (d) => (d.name === OWN ? 'var(--jc-series-2)' : undefined),
            },
          ]}
          locale="ru"
          animation={animation}
        />
      </Card>
      <Card title="Complaints (value axis hidden)">
        <HorizontalBarChart
          data={universities}
          xKey="name"
          yKey="complaints"
          label="Жалобы"
          yAxis={{ hidden: true }}
          locale="ru"
          animation={animation}
        />
      </Card>
      <Card title="Complaints (integer ticks)">
        <BarChart
          data={universities}
          xKey="name"
          yKey="complaints"
          label="Жалобы"
          yAxis={{ integer: true }}
          height={300}
          locale="ru"
          animation={animation}
        />
      </Card>
    </div>
  );
}

import { HorizontalBarChart } from '@jafari/charts';

const universities = [
  { id: 'kaznu', name: 'Казахский национальный университет имени аль-Фараби', users: 1840 },
  { id: 'enu', name: 'Евразийский национальный университет имени Л. Н. Гумилёва', users: 1312 },
  { id: 'satbayev', name: 'Satbayev University', users: 970 },
  {
    id: 'kazatu',
    name: 'Казахский национальный аграрный исследовательский университет',
    users: 655,
  },
  { id: 'kbtu', name: 'Казахстанско-Британский технический университет', users: 590 },
  { id: 'kaznai', name: 'Казахская национальная академия искусств имени Т. Жургенова', users: 412 },
];

const OWN = 'enu';

/**
 * Long names wrap at word boundaries onto two lines. `colorBy` highlights one bar;
 * `undefined` keeps the series colour for the rest.
 */
export default function LongNames() {
  return (
    <HorizontalBarChart
      data={universities}
      xKey="name"
      series={[
        {
          key: 'users',
          label: 'Users',
          colorBy: (d) => (d.id === OWN ? 'var(--jc-series-2)' : undefined),
        },
      ]}
      title="Active users by university"
    />
  );
}

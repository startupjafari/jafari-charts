import { BarChart, HorizontalBarChart } from '@startupjafari/charts';
import { MousePointer2, WrapText } from 'lucide-react';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { ChartCard as Card, CardGrid } from '../ui/card';

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

export function Universities() {
  const animation = useAnimation();
  return (
    <ScenePage
      scene="universities"
      hints={
        <>
          <Hint icon={WrapText}>Resize the window: labels wrap instead of being cut off</Hint>
          <Hint icon={MousePointer2}>Hover a bar for the full name</Hint>
        </>
      }
    >
      <CardGrid>
        <Card
          title="Users by university"
          description="Wrapped names; our university is highlighted with colorBy."
        >
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
        <Card
          title="Complaints (value axis hidden)"
          description="Bars only: the value axis is hidden."
        >
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
        <Card
          title="Complaints (integer ticks)"
          description="Vertical bars, wrapped labels and whole-number ticks."
        >
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
      </CardGrid>
    </ScenePage>
  );
}

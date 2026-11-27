import { BarChart, HorizontalBarChart } from '@startupjafari/charts';
import { MousePointer2, WrapText } from '../ui/icons';
import { defineCards, useCards, useText, type L } from '../i18n';
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

const CARDS = defineCards({
  en: {
    users: {
      title: 'Users by university',
      description: 'Wrapped names; our university is highlighted with colorBy.',
    },
    hiddenAxis: {
      title: 'Complaints (value axis hidden)',
      description: 'Bars only: the value axis is hidden.',
    },
    integer: {
      title: 'Complaints (integer ticks)',
      description: 'Vertical bars, wrapped labels and whole-number ticks.',
    },
  },
  ru: {
    users: {
      title: 'Пользователи по университетам',
      description: 'Названия переносятся; наш университет выделен через colorBy.',
    },
    hiddenAxis: {
      title: 'Жалобы (ось значений скрыта)',
      description: 'Только столбцы: ось значений скрыта.',
    },
    integer: {
      title: 'Жалобы (целочисленные деления)',
      description: 'Вертикальные столбцы, перенос подписей и только целые деления.',
    },
  },
  kk: {
    users: {
      title: 'Университеттер бойынша пайдаланушылар',
      description: 'Атаулар тасымалданады; біздің университет colorBy арқылы ерекшеленген.',
    },
    hiddenAxis: {
      title: 'Шағымдар (мән осі жасырылған)',
      description: 'Тек бағаналар: мән осі жасырылған.',
    },
    integer: {
      title: 'Шағымдар (бүтін сан белгілері)',
      description: 'Тік бағаналар, тасымалданатын жазулар және тек бүтін сан белгілері.',
    },
  },
});

const TEXT: L<{ resize: string; hover: string }> = {
  en: {
    resize: 'Resize the window: labels wrap instead of being cut off',
    hover: 'Hover a bar for the full name',
  },
  ru: {
    resize: 'Измените размер окна: подписи переносятся, а не обрезаются',
    hover: 'Наведите указатель на столбец, чтобы увидеть полное название',
  },
  kk: {
    resize: 'Терезе өлшемін өзгертіңіз: жазулар қиылмай, келесі жолға тасымалданады',
    hover: 'Толық атауын көру үшін меңзерді бағанаға апарыңыз',
  },
};

export function Universities() {
  const animation = useAnimation();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="universities"
      hints={
        <>
          <Hint icon={WrapText}>{text.resize}</Hint>
          <Hint icon={MousePointer2}>{text.hover}</Hint>
        </>
      }
    >
      <CardGrid>
        <Card {...card('users')}>
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
        <Card {...card('hiddenAxis')}>
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
        <Card {...card('integer')}>
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

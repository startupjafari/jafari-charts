import {
  AreaChart,
  BarChart,
  ChartProvider,
  ChartReferenceLine,
  ComboChart,
  GroupedBarChart,
  HorizontalBarChart,
  LineChart,
  Sparkline,
  StackedAreaChart,
  StackedBarChart,
  WaterfallChart,
  type Renderer,
} from '@startupjafari/charts';
import { Keyboard, MousePointer2, MousePointerClick } from '../ui/icons';
import { useState, type ReactNode } from 'react';
import { cashflow, complaints, profit, registrations, timeSeries, universities } from '../data';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage } from '../shell/scene-page';
import { ChartCard as Card, CardGrid } from '../ui/card';
import { Field } from '../ui/field';
import { Kbd } from '../ui/kbd';
import { Segmented } from '../ui/segmented';

const series90 = timeSeries(90);
const series30 = timeSeries(30, { keys: ['active'] as const });

const CARDS = defineCards({
  en: {
    area: {
      title: 'Area chart',
      description: '90 days of daily student activity with a soft fill.',
    },
    line: {
      title: 'Line chart',
      description: 'Two series against a dashed target reference line.',
    },
    bar: {
      title: 'Bar chart',
      description: 'Monthly registrations. Focus it and use the arrow keys.',
    },
    negative: {
      title: 'Bar chart (negative)',
      description: 'Quarterly profit around zero, with value labels.',
    },
    horizontal: {
      title: 'Horizontal bar chart',
      description: 'Long university names on the category axis.',
    },
    grouped: {
      title: 'Grouped bar chart',
      description: 'Complaints by category, three series side by side.',
    },
    stacked: {
      title: 'Stacked bar chart',
      description: 'Students, teachers and admins stacked per month.',
    },
    percent: {
      title: 'Stacked bar chart (percent)',
      description: 'Each category normalised to 100%.',
    },
    stackedArea: {
      title: 'Stacked area chart',
      description: 'Composition over 90 days, one layer per series.',
    },
    combo: { title: 'Combo chart', description: 'Bars and a line sharing one category axis.' },
    waterfall: {
      title: 'Waterfall chart',
      description: 'Running budget with an intermediate and a closing total.',
    },
    sparklines: {
      title: 'Sparklines',
      description: 'Compact line, area and bar trends for tables and tiles.',
    },
  },
  ru: {
    area: {
      title: 'Диаграмма с областями',
      description: 'Ежедневная активность студентов за 90 дней с мягкой заливкой.',
    },
    line: {
      title: 'Линейная диаграмма',
      description: 'Два ряда и пунктирная опорная линия цели.',
    },
    bar: {
      title: 'Столбчатая диаграмма',
      description: 'Регистрации по месяцам. Переведите на неё фокус и нажимайте стрелки.',
    },
    negative: {
      title: 'Столбчатая диаграмма (отрицательные значения)',
      description: 'Квартальная прибыль вокруг нуля, с подписями значений.',
    },
    horizontal: {
      title: 'Горизонтальная столбчатая диаграмма',
      description: 'Длинные названия университетов на оси категорий.',
    },
    grouped: {
      title: 'Сгруппированная столбчатая диаграмма',
      description: 'Жалобы по категориям: три ряда бок о бок.',
    },
    stacked: {
      title: 'Столбчатая диаграмма с накоплением',
      description: 'Студенты, преподаватели и администраторы по месяцам, одним столбцом.',
    },
    percent: {
      title: 'Нормированная столбчатая диаграмма',
      description: 'Каждая категория приведена к 100 %.',
    },
    stackedArea: {
      title: 'Диаграмма с областями и накоплением',
      description: 'Структура за 90 дней: по слою на каждый ряд.',
    },
    combo: {
      title: 'Комбинированная диаграмма',
      description: 'Столбцы и линия на общей оси категорий.',
    },
    waterfall: {
      title: 'Каскадная диаграмма',
      description: 'Бюджет нарастающим итогом с промежуточным и конечным итогом.',
    },
    sparklines: {
      title: 'Спарклайны',
      description: 'Компактные тренды для таблиц и плиток: линия, область и столбцы.',
    },
  },
  kk: {
    area: {
      title: 'Аймақтық диаграмма',
      description: 'Студенттердің 90 күндегі күнделікті белсенділігі, жұмсақ бояумен.',
    },
    line: {
      title: 'Сызықтық график',
      description: 'Екі қатар және мақсатты белгілейтін үзік тірек сызық.',
    },
    bar: {
      title: 'Бағаналы диаграмма',
      description: 'Ай сайынғы тіркелулер. Фокус қойып, көрсеткі пернелерін басыңыз.',
    },
    negative: {
      title: 'Бағаналы диаграмма (теріс мәндер)',
      description: 'Нөл маңындағы тоқсандық пайда, мән жазуларымен.',
    },
    horizontal: {
      title: 'Көлденең бағаналы диаграмма',
      description: 'Санат осінде университеттердің ұзын атаулары.',
    },
    grouped: {
      title: 'Топтастырылған бағаналы диаграмма',
      description: 'Санаттар бойынша шағымдар: үш қатар бір-бірінің жанында.',
    },
    stacked: {
      title: 'Жинақталған бағаналы диаграмма',
      description: 'Ай сайынғы студенттер, оқытушылар және әкімшілер бір бағанада.',
    },
    percent: {
      title: 'Пайыздық бағаналы диаграмма',
      description: 'Әр санат 100%-ға келтірілген.',
    },
    stackedArea: {
      title: 'Жинақталған аймақтық диаграмма',
      description: '90 күндегі құрам: әр қатарға бір қабат.',
    },
    combo: {
      title: 'Аралас диаграмма',
      description: 'Ортақ санат осіндегі бағаналар мен сызық.',
    },
    waterfall: {
      title: 'Сарқырама диаграммасы',
      description: 'Аралық және соңғы жиынтығы бар өспелі бюджет.',
    },
    sparklines: {
      title: 'Шағын графиктер',
      description: 'Кестелер мен плиткаларға арналған ықшам трендтер: сызық, аймақ және бағаналар.',
    },
  },
});

const HINTS: L<{ hover: string; keyboard: (keys: ReactNode) => ReactNode }> = {
  en: {
    hover: 'Hover for a tooltip and crosshair',
    keyboard: (keys) => <>Focus a chart, then {keys}</>,
  },
  ru: {
    hover: 'Наведите указатель — появятся подсказка и перекрестие',
    keyboard: (keys) => <>Переведите фокус на диаграмму, затем {keys}</>,
  },
  kk: {
    hover: 'Меңзерді апарсаңыз, қалқымалы кеңес пен айқас сызық шығады',
    keyboard: (keys) => <>Диаграммаға фокус қойып, {keys} басыңыз</>,
  },
};

const RENDERERS = [
  { value: 'svg', label: 'SVG' },
  { value: 'canvas', label: 'Canvas' },
] as const;

export function Gallery() {
  const animation = useAnimation();
  const [renderer, setRenderer] = useState<Extract<Renderer, 'svg' | 'canvas'>>('svg');
  const t = useT();
  const hints = useText(HINTS);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="gallery"
      actions={
        <Field label={t.controls.renderer} inline>
          {(id) => (
            <Segmented items={RENDERERS} value={renderer} onChange={setRenderer} labelledBy={id} />
          )}
        </Field>
      }
      hints={
        <>
          <Hint icon={MousePointer2}>{hints.hover}</Hint>
          <Hint icon={MousePointerClick}>{t.hints.legendSeries}</Hint>
          <Hint icon={Keyboard}>
            {hints.keyboard(
              <>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd> <Kbd>Home</Kbd> <Kbd>End</Kbd> <Kbd>Esc</Kbd>
              </>,
            )}
          </Hint>
        </>
      }
    >
      <ChartProvider renderer={renderer}>
        <CardGrid>
          <Card {...card('area')}>
            <AreaChart
              data={series90}
              xKey="date"
              yKey="students"
              label="Students"
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('line')}>
            <LineChart
              data={series90}
              xKey="date"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
              ]}
              height={240}
              animation={animation}
            >
              <ChartReferenceLine y={300} label="Target" />
            </LineChart>
          </Card>
          <Card {...card('bar')}>
            <BarChart
              data={registrations}
              xKey="month"
              yKey="students"
              label="Registrations"
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('negative')}>
            <BarChart
              data={profit}
              xKey="label"
              yKey="delta"
              label="Profit"
              height={240}
              labels
              animation={animation}
            />
          </Card>
          <Card {...card('horizontal')}>
            <HorizontalBarChart
              data={universities}
              xKey="name"
              yKey="score"
              label="Rating"
              animation={animation}
            />
          </Card>
          <Card {...card('grouped')}>
            <GroupedBarChart
              data={complaints}
              xKey="category"
              series={[
                { key: 'open', label: 'Open' },
                { key: 'resolved', label: 'Resolved' },
                { key: 'rejected', label: 'Rejected' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('stacked')}>
            <StackedBarChart
              data={registrations}
              xKey="month"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
                { key: 'admins', label: 'Admins' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('percent')}>
            <StackedBarChart
              mode="percent"
              data={complaints}
              xKey="category"
              series={[
                { key: 'open', label: 'Open' },
                { key: 'resolved', label: 'Resolved' },
                { key: 'rejected', label: 'Rejected' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('stackedArea')}>
            <StackedAreaChart
              data={series90}
              xKey="date"
              series={[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('combo')}>
            <ComboChart
              data={registrations}
              xKey="month"
              series={[
                { key: 'students', label: 'Students', type: 'bar' },
                { key: 'teachers', label: 'Teachers', type: 'line' },
              ]}
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('waterfall')}>
            <WaterfallChart
              data={cashflow}
              xKey="step"
              yKey="value"
              isTotal={(d) => Boolean(d.total)}
              height={260}
              animation={animation}
            />
          </Card>
          <Card {...card('sparklines')}>
            <div className="grid grid-cols-3 gap-4">
              <Sparkline data={series30} xKey="date" yKey="active" title="Active users" />
              <Sparkline
                data={series30}
                xKey="date"
                yKey="active"
                variant="area"
                color="var(--jc-series-2)"
                title="Sessions"
              />
              <Sparkline
                data={series30.slice(0, 14)}
                xKey="date"
                yKey="active"
                variant="bar"
                color="var(--jc-series-3)"
                title="Signups"
              />
            </div>
          </Card>
        </CardGrid>
      </ChartProvider>
    </ScenePage>
  );
}

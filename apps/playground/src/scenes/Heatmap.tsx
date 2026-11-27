import { CalendarHeatmap, HeatmapChart } from '@startupjafari/charts';
import { Keyboard, MousePointer2 } from '../ui/icons';
import type { ReactNode } from 'react';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';
import { Kbd } from '../ui/kbd';
import { rng } from '../data';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Logins by weekday × hour: busy weekday mornings and evenings, quiet nights. */
const logins = (() => {
  const r = rng(11);
  const rows: Array<{ day: string; hour: number; logins: number }> = [];
  weekdays.forEach((day, d) => {
    for (let hour = 0; hour < 24; hour++) {
      const weekend = d >= 5 ? 0.45 : 1;
      const wave = Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2)) + (hour >= 18 ? 0.4 : 0);
      rows.push({ day, hour, logins: Math.round((wave * 120 + r() * 25) * weekend) });
    }
  });
  return rows;
})();

const subjects = ['Math', 'Physics', 'History', 'Biology', 'Literature'];
const groups = ['10A', '10B', '11A', '11B', '11C', '12A'];
const grades = (() => {
  const r = rng(5);
  return subjects.flatMap((subject) =>
    groups.map((group) => ({ subject, group, score: Math.round(55 + r() * 45) })),
  );
})();

/** Year-over-year change per faculty and quarter (signed). */
const faculties = [
  'Engineering',
  'Medicine',
  'Economics and Business Administration',
  'Law',
  'Humanities',
  'Natural Sciences',
];
const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
const change = (() => {
  const r = rng(23);
  return faculties.flatMap((faculty, i) =>
    quarters.map((quarter, q) => ({
      faculty,
      quarter,
      delta: i === 3 && q === 2 ? null : Math.round((r() - 0.45 - (i === 2 ? 0.3 : 0)) * 40),
    })),
  );
})();

const big = (() => {
  const rows: Array<{ x: string; y: string; v: number }> = [];
  for (let y = 0; y < 50; y++)
    for (let x = 0; x < 50; x++)
      rows.push({
        x: `C${x + 1}`,
        y: `R${y + 1}`,
        v: Math.sin(x / 6) * Math.cos(y / 8) * 50 + (x + y) / 2,
      });
  return rows;
})();

/** Daily activity with weekly rhythm, a summer lull and some missing days. */
function activity(from: Date, days: number, seed = 3) {
  const r = rng(seed);
  const out: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const weekday = d.getDay();
    const summer = d.getMonth() >= 6 && d.getMonth() <= 7 ? 0.25 : 1;
    const base = weekday === 0 || weekday === 6 ? 0.3 : 1;
    const x = r();
    if (x < 0.18) continue; // no row at all
    const count = x < 0.3 ? 0 : Math.round(r() * 12 * base * summer);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ date: iso, count });
  }
  return out;
}

const lastYear = activity(new Date(2025, 10, 27), 365);
const twoYears = activity(new Date(2024, 0, 1), 731, 9);
// Duplicate rows per day are summed.
const commits = [
  ...activity(new Date(2026, 0, 1), 120, 4),
  { date: '2026-01-05', count: 20 },
  { date: '2026-01-05', count: 15 },
];

const CARDS = defineCards({
  en: {
    year: {
      title: 'Calendar heatmap (last 12 months)',
      description: 'Daily submissions over a year, GitHub-style.',
    },
    logins: {
      title: 'Logins by weekday and hour',
      description: 'A 7 × 24 matrix on a continuous scale.',
    },
    grades: {
      title: 'Average score by subject and group (labels)',
      description: 'Four colour buckets, values printed in the cells.',
    },
    change: {
      title: 'Enrolment change, % (diverging, missing cell, long labels)',
      description: 'Diverging scale around zero; one cell has no data.',
    },
    big: {
      title: '50 × 50 grid (custom colour ramp)',
      description: '2,500 cells with a custom orange ramp.',
    },
    ru: {
      title: 'Календарь активности (ru, month gaps)',
      description: 'Russian month and weekday names, gaps between months.',
    },
    twoYears: {
      title: 'Two years, stacked by year',
      description: 'Custom thresholds, one row of weeks per year.',
    },
    narrow: {
      title: 'Calendar (narrow, explicit range, duplicates summed)',
      description: 'A 320 px box, weeks from Monday, duplicate days summed.',
    },
    kk: {
      title: 'Calendar (kk, Q1, all weekday labels)',
      description: 'Kazakh locale, one quarter, every weekday labelled.',
    },
    emptyMatrix: {
      title: 'Empty heatmap',
      description: 'No rows: the matrix shows its empty state.',
    },
    emptyCalendar: {
      title: 'Empty calendar',
      description: 'No rows: the calendar shows its empty state.',
    },
  },
  ru: {
    year: {
      title: 'Календарная тепловая карта (последние 12 месяцев)',
      description: 'Ежедневные сдачи работ за год, в стиле GitHub.',
    },
    logins: {
      title: 'Входы по дням недели и часам',
      description: 'Матрица 7 × 24 на непрерывной шкале.',
    },
    grades: {
      title: 'Средний балл по предметам и группам (подписи)',
      description: 'Четыре цветовых интервала, значения выведены в ячейках.',
    },
    change: {
      title: 'Изменение набора, % (расходящаяся шкала, пропуск, длинные подписи)',
      description: 'Расходящаяся шкала вокруг нуля; в одной ячейке нет данных.',
    },
    big: {
      title: 'Сетка 50 × 50 (своя цветовая шкала)',
      description: '2 500 ячеек с собственной оранжевой шкалой.',
    },
    ru: {
      title: 'Календарь активности (ru, промежутки между месяцами)',
      description: 'Русские названия месяцев и дней недели, промежутки между месяцами.',
    },
    twoYears: {
      title: 'Два года, по году в строке',
      description: 'Свои пороги, по ряду недель на каждый год.',
    },
    narrow: {
      title: 'Календарь (узкий, явный диапазон, дубли суммируются)',
      description: 'Контейнер 320 px, недели с понедельника, повторяющиеся дни суммируются.',
    },
    kk: {
      title: 'Календарь (kk, I квартал, подписаны все дни недели)',
      description: 'Казахская локаль, один квартал, подписан каждый день недели.',
    },
    emptyMatrix: {
      title: 'Пустая тепловая карта',
      description: 'Нет строк: матрица показывает пустое состояние.',
    },
    emptyCalendar: {
      title: 'Пустой календарь',
      description: 'Нет строк: календарь показывает пустое состояние.',
    },
  },
  kk: {
    year: {
      title: 'Күнтізбелік жылу картасы (соңғы 12 ай)',
      description: 'Бір жылдағы күнделікті тапсырылған жұмыстар, GitHub стилінде.',
    },
    logins: {
      title: 'Апта күндері мен сағаттар бойынша кірулер',
      description: 'Үздіксіз шкаладағы 7 × 24 матрица.',
    },
    grades: {
      title: 'Пәндер мен топтар бойынша орташа балл (жазулар)',
      description: 'Төрт түс аралығы, мәндер ұяшықтарда жазылған.',
    },
    change: {
      title: 'Қабылдаудың өзгерісі, % (екіжақты шкала, бос ұяшық, ұзын жазулар)',
      description: 'Нөлге қатысты екіжақты шкала; бір ұяшықта дерек жоқ.',
    },
    big: {
      title: '50 × 50 тор (өз түс шкаласы)',
      description: 'Өз қызғылт сары шкаласы бар 2 500 ұяшық.',
    },
    ru: {
      title: 'Белсенділік күнтізбесі (ru, айлар арасында аралық)',
      description: 'Айлар мен апта күндерінің орысша атаулары, айлар арасында аралық бар.',
    },
    twoYears: {
      title: 'Екі жыл, әр жыл бөлек жолда',
      description: 'Өз шектері, әр жылға бір апталар қатары.',
    },
    narrow: {
      title: 'Күнтізбе (тар, нақты аралық, қайталанғандар қосылады)',
      description: '320 px контейнер, апта дүйсенбіден басталады, қайталанған күндер қосылады.',
    },
    kk: {
      title: 'Күнтізбе (kk, I тоқсан, апта күндерінің бәрі жазылған)',
      description: 'Қазақ локалі, бір тоқсан, апта күндерінің әрқайсысы жазылған.',
    },
    emptyMatrix: {
      title: 'Бос жылу картасы',
      description: 'Жолдар жоқ: матрица бос күйін көрсетеді.',
    },
    emptyCalendar: {
      title: 'Бос күнтізбе',
      description: 'Жолдар жоқ: күнтізбе бос күйін көрсетеді.',
    },
  },
});

interface HeatmapText {
  hover: string;
  keyboard: (keys: ReactNode) => ReactNode;
  showcase: string;
  edge: string;
}

const TEXT: L<HeatmapText> = {
  en: {
    hover: 'Hover a cell for its value',
    keyboard: (keys) => <>Focus a chart, then move between cells with {keys}</>,
    showcase: 'Value matrices and daily calendars with sequential, bucketed and diverging scales.',
    edge: 'Empty data sets.',
  },
  ru: {
    hover: 'Наведите указатель на ячейку, чтобы увидеть значение',
    keyboard: (keys) => <>Переведите фокус на диаграмму и перемещайтесь по ячейкам: {keys}</>,
    showcase:
      'Матрицы значений и календари по дням: последовательные, интервальные и расходящиеся шкалы.',
    edge: 'Пустые наборы данных.',
  },
  kk: {
    hover: 'Мәнін көру үшін меңзерді ұяшыққа апарыңыз',
    keyboard: (keys) => <>Диаграммаға фокус қойып, ұяшықтар арасында {keys} арқылы жылжыңыз</>,
    showcase:
      'Мәндер матрицалары мен күндік күнтізбелер: бірізді, аралықтық және екіжақты шкалалар.',
    edge: 'Бос деректер жиындары.',
  },
};

export function Heatmap() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  const t = useT();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="heatmap"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>{text.hover}</Hint>
          <Hint icon={Keyboard}>
            {text.keyboard(
              <>
                <Kbd>←</Kbd>
                <Kbd>↑</Kbd>
                <Kbd>→</Kbd>
                <Kbd>↓</Kbd>
              </>,
            )}
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection title={t.sections.showcase} count={9} description={text.showcase}>
          <Card {...card('year')} wide>
            <CalendarHeatmap
              data={lastYear}
              dateKey="date"
              valueKey="count"
              valueLabel="Submissions"
              animation={animation}
            />
          </Card>
          <Card {...card('logins')}>
            <HeatmapChart
              data={logins}
              xKey="hour"
              yKey="day"
              valueKey="logins"
              valueLabel="Logins"
              height={240}
              xFormatter={(h) => `${String(h).padStart(2, '0')}`}
              animation={animation}
            />
          </Card>
          <Card {...card('grades')}>
            <HeatmapChart
              data={grades}
              xKey="group"
              yKey="subject"
              valueKey="score"
              labels
              buckets={4}
              color="var(--jc-series-3)"
              height={240}
              animation={animation}
            />
          </Card>
          <Card {...card('change')}>
            <HeatmapChart
              data={change}
              xKey="quarter"
              yKey="faculty"
              valueKey="delta"
              colorScale="diverging"
              labels
              valueFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
              height={260}
              animation={animation}
            />
          </Card>
          <Card {...card('big')}>
            <HeatmapChart
              data={big}
              xKey="x"
              yKey="y"
              valueKey="v"
              colors={['#fff7ed', '#fb923c', '#7c2d12']}
              buckets={7}
              height={320}
              animation={animation}
            />
          </Card>
          <Card {...card('ru')} wide>
            <CalendarHeatmap
              data={lastYear}
              dateKey="date"
              valueKey="count"
              locale="ru"
              monthGap
              animation={animation}
            />
          </Card>
          <Card {...card('twoYears')} wide>
            <CalendarHeatmap
              data={twoYears}
              dateKey="date"
              valueKey="count"
              thresholds={[1, 4, 8, 12]}
              color="var(--jc-series-2)"
              animation={animation}
            />
          </Card>
          <Card {...card('narrow')}>
            <div style={{ maxWidth: 320 }}>
              <CalendarHeatmap
                data={commits}
                dateKey="date"
                valueKey="count"
                from="2026-01-01"
                to="2026-06-30"
                weekStartsOn={1}
                animation={animation}
              />
            </div>
          </Card>
          <Card {...card('kk')}>
            <CalendarHeatmap
              data={commits}
              dateKey="date"
              valueKey="count"
              from="2026-01-01"
              to="2026-03-31"
              locale="kk"
              weekdayLabels="all"
              animation={animation}
            />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection title={t.sections.edgeCases} count={2} description={text.edge}>
          <Card {...card('emptyMatrix')}>
            <HeatmapChart data={[] as typeof grades} xKey="group" yKey="subject" valueKey="score" />
          </Card>
          <Card {...card('emptyCalendar')}>
            <CalendarHeatmap data={[] as typeof lastYear} dateKey="date" valueKey="count" />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

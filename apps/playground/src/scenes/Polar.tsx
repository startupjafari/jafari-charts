import { DonutChart, GaugeChart, PieChart, RadialProgressChart } from '@startupjafari/charts';
import { MousePointer2, MousePointerClick } from '../ui/icons';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';

const roles = [
  { role: 'Students', count: 18420 },
  { role: 'Teachers', count: 1260 },
  { role: 'Curators', count: 340 },
  { role: 'Admins', count: 58 },
];
const browsers = [
  { name: 'Chrome', share: 61 },
  { name: 'Safari', share: 19 },
  { name: 'Edge', share: 9 },
  { name: 'Firefox', share: 6 },
  { name: 'Other', share: 5 },
];

const CARDS = defineCards({
  en: {
    donut: { title: 'Donut chart', description: 'User roles, with the total in the centre.' },
    pie: { title: 'Pie chart', description: 'Browser share with a legend.' },
    outside: {
      title: 'Pie chart (outside labels)',
      description: 'Labels with leader lines instead of a legend.',
    },
    radial: { title: 'Radial progress', description: 'A single goal, and three concentric rings.' },
    gauge: { title: 'Gauge chart', description: 'Coloured bands, and a needle on an arc.' },
    empty: { title: 'Donut (empty)', description: 'No rows: the empty state replaces the ring.' },
  },
  ru: {
    donut: { title: 'Кольцевая диаграмма', description: 'Роли пользователей и итог в центре.' },
    pie: { title: 'Круговая диаграмма', description: 'Доли браузеров с легендой.' },
    outside: {
      title: 'Круговая диаграмма (внешние подписи)',
      description: 'Подписи с выносными линиями вместо легенды.',
    },
    radial: {
      title: 'Радиальный прогресс',
      description: 'Одна цель и три концентрических кольца.',
    },
    gauge: { title: 'Шкала-индикатор', description: 'Цветные диапазоны и стрелка на дуге.' },
    empty: {
      title: 'Кольцевая диаграмма (пустая)',
      description: 'Нет строк: вместо кольца — пустое состояние.',
    },
  },
  kk: {
    donut: {
      title: 'Сақиналы диаграмма',
      description: 'Пайдаланушы рөлдері, ортасында жалпы саны.',
    },
    pie: { title: 'Дөңгелек диаграмма', description: 'Браузерлердің үлесі, шартты белгілерімен.' },
    outside: {
      title: 'Дөңгелек диаграмма (сыртқы жазулар)',
      description: 'Шартты белгілердің орнына сілтеме сызықтары бар жазулар.',
    },
    radial: { title: 'Радиалды прогресс', description: 'Бір мақсат және үш концентрлі сақина.' },
    gauge: { title: 'Шкала көрсеткіші', description: 'Түрлі түсті аралықтар және доғадағы тілше.' },
    empty: {
      title: 'Сақиналы диаграмма (бос)',
      description: 'Жолдар жоқ: сақинаның орнында бос күй көрсетіледі.',
    },
  },
});

const TEXT: L<{ hover: string; legend: string; showcase: string; edge: string }> = {
  en: {
    hover: 'Hover a slice to highlight it',
    legend: 'Click legend items to hide slices',
    showcase: 'Parts of a whole and progress towards a goal.',
    edge: 'What a polar chart shows without data.',
  },
  ru: {
    hover: 'Наведите указатель на сектор, чтобы выделить его',
    legend: 'Щелчок по легенде скрывает сектор',
    showcase: 'Доли целого и прогресс на пути к цели.',
    edge: 'Что показывает полярная диаграмма без данных.',
  },
  kk: {
    hover: 'Секторды ерекшелеу үшін меңзерді үстіне апарыңыз',
    legend: 'Секторды жасыру үшін шартты белгіні басыңыз',
    showcase: 'Тұтастың бөліктері және мақсатқа жету барысы.',
    edge: 'Деректер болмағанда полярлық диаграмма не көрсетеді.',
  },
};

export function Polar() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  const t = useT();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="polar"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>{text.hover}</Hint>
          <Hint icon={MousePointerClick}>{text.legend}</Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection title={t.sections.showcase} count={5} description={text.showcase}>
          <Card {...card('donut')}>
            <DonutChart data={roles} labelKey="role" valueKey="count" animation={animation} />
          </Card>
          <Card {...card('pie')}>
            <PieChart data={browsers} labelKey="name" valueKey="share" animation={animation} />
          </Card>
          <Card {...card('outside')}>
            <PieChart
              data={browsers}
              labelKey="name"
              valueKey="share"
              labels="outside"
              legend={false}
              animation={animation}
            />
          </Card>
          <Card {...card('radial')}>
            <div className="grid grid-cols-2 gap-4">
              <RadialProgressChart value={72} label="Plan completion" animation={animation} />
              <RadialProgressChart
                data={[
                  { label: 'Attendance', value: 86 },
                  { label: 'Assignments', value: 64 },
                  { label: 'Exams', value: 41 },
                ]}
                animation={animation}
              />
            </div>
          </Card>
          <Card {...card('gauge')}>
            <div className="grid grid-cols-2 gap-4">
              <GaugeChart
                value={68}
                label="Satisfaction"
                bands={[
                  { to: 40, color: 'var(--jc-negative)', label: 'Low' },
                  { to: 75, color: 'var(--jc-warning)', label: 'Medium' },
                  { to: 100, color: 'var(--jc-positive)', label: 'High' },
                ]}
                animation={animation}
              />
              <GaugeChart
                value={82}
                needle
                variant="arc"
                label="Server load"
                valueFormatter={(v) => `${v}%`}
                bands={[
                  { to: 60, color: 'var(--jc-positive)' },
                  { to: 85, color: 'var(--jc-warning)' },
                  { to: 100, color: 'var(--jc-negative)' },
                ]}
                animation={animation}
              />
            </div>
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection title={t.sections.edgeCases} count={1} description={text.edge}>
          <Card {...card('empty')}>
            <DonutChart data={[] as typeof roles} labelKey="role" valueKey="count" />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

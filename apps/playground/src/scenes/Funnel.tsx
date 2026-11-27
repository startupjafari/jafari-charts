import { FunnelChart } from '@startupjafari/charts';
import { Keyboard, MousePointer2 } from '../ui/icons';
import type { ReactNode } from 'react';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { useAnimation } from '../shell/playground';
import { Hint, ScenePage, SceneSection, useCaseFilter } from '../shell/scene-page';
import { ChartCard as Card } from '../ui/card';
import { Kbd } from '../ui/kbd';

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

const CARDS = defineCards({
  en: {
    bars: {
      title: 'Funnel (bars, % of first stage)',
      description: 'University admissions; percentages of the first stage.',
    },
    trapezoid: { title: 'Funnel (trapezoid)', description: 'The classic funnel shape.' },
    previous: {
      title: 'Funnel (% of previous stage)',
      description: 'Step-to-step conversion of a checkout.',
    },
    horizontal: { title: 'Funnel (horizontal)', description: 'Stages from left to right.' },
    horizontalTrapezoid: {
      title: 'Funnel (horizontal trapezoid)',
      description: 'Horizontal, with sloped sides.',
    },
    growth: {
      title: 'Funnel (growth, missing value, long names)',
      description: 'A stage larger than the one before, a gap and a long name.',
    },
    long: {
      title: 'Funnel (24 stages)',
      description: 'A dense funnel: learners dropping off over a course.',
    },
    ru: {
      title: 'Funnel (custom colour, ru locale)',
      description: 'Russian labels and number formatting, custom colour.',
    },
    single: { title: 'Funnel (single stage)', description: 'One stage only.' },
    zeros: { title: 'Funnel (all zeros)', description: 'Every stage is zero.' },
    empty: { title: 'Funnel (empty)', description: 'No rows: the empty state.' },
  },
  ru: {
    bars: {
      title: 'Воронка (столбцы, % от первого этапа)',
      description: 'Поступление в университет; проценты от первого этапа.',
    },
    trapezoid: { title: 'Воронка (трапеция)', description: 'Классическая форма воронки.' },
    previous: {
      title: 'Воронка (% от предыдущего этапа)',
      description: 'Пошаговая конверсия оформления заказа.',
    },
    horizontal: { title: 'Воронка (горизонтальная)', description: 'Этапы слева направо.' },
    horizontalTrapezoid: {
      title: 'Воронка (горизонтальная трапеция)',
      description: 'Горизонтальная, со скошенными сторонами.',
    },
    growth: {
      title: 'Воронка (рост, пропуск, длинные названия)',
      description: 'Этап больше предыдущего, пропуск и длинное название.',
    },
    long: {
      title: 'Воронка (24 этапа)',
      description: 'Плотная воронка: отток учащихся по ходу курса.',
    },
    ru: {
      title: 'Воронка (свой цвет, локаль ru)',
      description: 'Русские подписи и формат чисел, свой цвет.',
    },
    single: { title: 'Воронка (один этап)', description: 'Только один этап.' },
    zeros: { title: 'Воронка (все нули)', description: 'Все этапы равны нулю.' },
    empty: { title: 'Воронка (пустая)', description: 'Нет строк: пустое состояние.' },
  },
  kk: {
    bars: {
      title: 'Шұңғыма (бағаналар, бірінші кезеңнен %)',
      description: 'Университетке қабылдау; пайыздар бірінші кезеңнен есептеледі.',
    },
    trapezoid: { title: 'Шұңғыма (трапеция)', description: 'Шұңғыманың классикалық пішіні.' },
    previous: {
      title: 'Шұңғыма (алдыңғы кезеңнен %)',
      description: 'Тапсырысты рәсімдеудің қадамнан қадамға конверсиясы.',
    },
    horizontal: { title: 'Шұңғыма (көлденең)', description: 'Кезеңдер солдан оңға қарай.' },
    horizontalTrapezoid: {
      title: 'Шұңғыма (көлденең трапеция)',
      description: 'Көлденең, қырлары көлбеу.',
    },
    growth: {
      title: 'Шұңғыма (өсу, бос мән, ұзын атаулар)',
      description: 'Алдыңғысынан үлкен кезең, бос мән және ұзын атау.',
    },
    long: {
      title: 'Шұңғыма (24 кезең)',
      description: 'Тығыз шұңғыма: курс барысында тыңдаушылардың азаюы.',
    },
    ru: {
      title: 'Шұңғыма (өз түсі, ru локалі)',
      description: 'Орысша жазулар мен сан пішімі, өз түсі.',
    },
    single: { title: 'Шұңғыма (бір кезең)', description: 'Тек бір кезең.' },
    zeros: { title: 'Шұңғыма (бәрі нөл)', description: 'Барлық кезең нөлге тең.' },
    empty: { title: 'Шұңғыма (бос)', description: 'Жолдар жоқ: бос күй.' },
  },
});

interface FunnelText {
  hover: string;
  keyboard: (keys: ReactNode) => ReactNode;
  showcase: string;
  edge: string;
}

const TEXT: L<FunnelText> = {
  en: {
    hover: 'Hover a stage for its count and conversion',
    keyboard: (keys) => <>Focus, then {keys} between stages</>,
    showcase: 'Shapes, orientations and percentage bases for conversion funnels.',
    edge: 'Degenerate data: one stage, all zeros, no rows.',
  },
  ru: {
    hover: 'Наведите указатель на этап — появятся количество и конверсия',
    keyboard: (keys) => <>В фокусе: {keys} — переход между этапами</>,
    showcase: 'Формы, ориентация и база процентов для воронок конверсии.',
    edge: 'Вырожденные данные: один этап, все нули, нет строк.',
  },
  kk: {
    hover: 'Саны мен конверсиясын көру үшін меңзерді кезеңге апарыңыз',
    keyboard: (keys) => <>Фокус қойылғанда: {keys} — кезеңдер арасында жылжу</>,
    showcase: 'Конверсия шұңғымаларының пішіндері, бағыттары және пайыз негіздері.',
    edge: 'Азғындалған деректер: бір кезең, бәрі нөл, жолдар жоқ.',
  },
};

export function Funnel() {
  const animation = useAnimation();
  const [show, filter] = useCaseFilter();
  const t = useT();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  return (
    <ScenePage
      scene="funnel"
      actions={filter}
      hints={
        <>
          <Hint icon={MousePointer2}>{text.hover}</Hint>
          <Hint icon={Keyboard}>
            {text.keyboard(
              <>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </>,
            )}
          </Hint>
        </>
      }
    >
      {show !== 'edge' && (
        <SceneSection title={t.sections.showcase} count={8} description={text.showcase}>
          <Card {...card('bars')}>
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              title="Admissions funnel"
              animation={animation}
            />
          </Card>
          <Card {...card('trapezoid')}>
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              variant="trapezoid"
              animation={animation}
            />
          </Card>
          <Card {...card('previous')}>
            <FunnelChart
              data={checkout}
              labelKey="step"
              valueKey="sessions"
              percentBase="previous"
              animation={animation}
            />
          </Card>
          <Card {...card('horizontal')}>
            <FunnelChart
              data={checkout}
              labelKey="step"
              valueKey="sessions"
              orientation="horizontal"
              animation={animation}
            />
          </Card>
          <Card {...card('horizontalTrapezoid')}>
            <FunnelChart
              data={admissions}
              labelKey="stage"
              valueKey="count"
              orientation="horizontal"
              variant="trapezoid"
              animation={animation}
            />
          </Card>
          <Card {...card('growth')}>
            <FunnelChart data={referral} labelKey="step" valueKey="users" animation={animation} />
          </Card>
          <Card {...card('long')}>
            <FunnelChart
              data={longFunnel}
              labelKey="step"
              valueKey="learners"
              height={360}
              animation={animation}
            />
          </Card>
          <Card {...card('ru')}>
            <FunnelChart
              data={ru}
              labelKey="этап"
              valueKey="люди"
              color="var(--jc-series-3)"
              locale="ru"
              animation={animation}
            />
          </Card>
        </SceneSection>
      )}
      {show !== 'showcase' && (
        <SceneSection title={t.sections.edgeCases} count={3} description={text.edge}>
          <Card {...card('single')}>
            <FunnelChart
              data={[{ step: 'Applied', users: 320 }]}
              labelKey="step"
              valueKey="users"
              animation={animation}
            />
          </Card>
          <Card {...card('zeros')}>
            <FunnelChart
              data={checkout.map((d) => ({ ...d, sessions: 0 }))}
              labelKey="step"
              valueKey="sessions"
              animation={animation}
            />
          </Card>
          <Card {...card('empty')}>
            <FunnelChart data={[] as typeof checkout} labelKey="step" valueKey="sessions" />
          </Card>
        </SceneSection>
      )}
    </ScenePage>
  );
}

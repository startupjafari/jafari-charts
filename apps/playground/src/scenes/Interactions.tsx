import { AreaChart, BarChart, LineChart } from '@startupjafari/charts';
import {
  Hand,
  MousePointer2,
  MousePointerClick,
  SquareDashedMousePointer,
  ZoomIn,
} from '../ui/icons';
import { useState, type ReactNode } from 'react';
import { registrations, timeSeries } from '../data';
import { defineCards, useCards, useT, useText, type L } from '../i18n';
import { Hint, ScenePage } from '../shell/scene-page';
import { ChartCard, CardGrid, Readout } from '../ui/card';
import { Kbd } from '../ui/kbd';

const big = timeSeries(2000, { keys: ['value'] as const, step: 36e5 });
const series = timeSeries(60);

const placeholder = "empty:before:text-muted-foreground empty:before:content-['—']";

const CARDS = defineCards({
  en: {
    zoom: {
      title: 'Zoom & pan',
      description: '2,000 hourly points. A plain wheel still scrolls the page.',
    },
    brush: { title: 'Brush', description: 'Drag across the chart to select a range of days.' },
    controlled: {
      title: 'Controlled legend + active index',
      description: 'Hidden series, the active bar and clicks live in React state.',
    },
  },
  ru: {
    zoom: {
      title: 'Масштаб и панорамирование',
      description: '2 000 почасовых точек. Обычное колесо мыши по-прежнему прокручивает страницу.',
    },
    brush: {
      title: 'Выделение диапазона',
      description: 'Протяните указатель по диаграмме, чтобы выделить диапазон дней.',
    },
    controlled: {
      title: 'Контролируемая легенда и активный индекс',
      description: 'Скрытые ряды, активный столбец и щелчки хранятся в состоянии React.',
    },
  },
  kk: {
    zoom: {
      title: 'Масштаб және жылжыту',
      description: '2 000 сағаттық нүкте. Жай дөңгелек бұрынғыдай бетті айналдырады.',
    },
    brush: {
      title: 'Аралықты таңдау',
      description: 'Күндер аралығын таңдау үшін диаграмма бойымен сүйреңіз.',
    },
    controlled: {
      title: 'Басқарылатын шартты белгілер және белсенді индекс',
      description: 'Жасырылған қатарлар, белсенді бағана және басулар React күйінде сақталады.',
    },
  },
});

interface InteractionsText {
  wheel: (mod: ReactNode) => ReactNode;
  drag: string;
  brush: string;
  zoomFooter: (mod: ReactNode) => ReactNode;
  selected: string;
  controlledFooter: string;
  state: string;
}

const TEXT: L<InteractionsText> = {
  en: {
    wheel: (mod) => <>{mod} + wheel zooms</>,
    drag: 'Drag pans a zoomed chart',
    brush: 'Drag across a brush chart to select',
    zoomFooter: (mod) => <>{mod} + wheel to zoom · drag to pan · double-click to reset</>,
    selected: 'Selected indices',
    controlledFooter: 'Toggle the legend, hover or click a bar',
    state: 'State',
  },
  ru: {
    wheel: (mod) => <>{mod} + колесо — масштаб</>,
    drag: 'Перетаскивание сдвигает увеличенную диаграмму',
    brush: 'Протяните указатель по диаграмме с brush, чтобы выделить диапазон',
    zoomFooter: (mod) => (
      <>{mod} + колесо — масштаб · перетаскивание — панорамирование · двойной щелчок — сброс</>
    ),
    selected: 'Выбранные индексы',
    controlledFooter: 'Переключайте легенду, наводите указатель или щёлкайте по столбцу',
    state: 'Состояние',
  },
  kk: {
    wheel: (mod) => <>{mod} + дөңгелек — масштаб</>,
    drag: 'Сүйреу үлкейтілген диаграмманы жылжытады',
    brush: 'Аралықты таңдау үшін brush диаграммасы бойымен сүйреңіз',
    zoomFooter: (mod) => (
      <>{mod} + дөңгелек — масштаб · сүйреу — жылжыту · екі рет басу — қалпына келтіру</>
    ),
    selected: 'Таңдалған индекстер',
    controlledFooter: 'Шартты белгілерді ауыстырыңыз, меңзерді апарыңыз немесе бағананы басыңыз',
    state: 'Күй',
  },
};

const MOD = (
  <>
    <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd>
  </>
);

/** Deterministic fixture for e2e interaction tests (zoom, brush, controlled state, touch). */
export function Interactions() {
  const t = useT();
  const text = useText(TEXT);
  const card = useCards(CARDS);
  const [brush, setBrush] = useState('');
  const [clicked, setClicked] = useState('');
  const [hidden, setHidden] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  return (
    <ScenePage
      scene="interactions"
      hints={
        <>
          <Hint icon={ZoomIn}>{text.wheel(MOD)}</Hint>
          <Hint icon={Hand}>{text.drag}</Hint>
          <Hint icon={MousePointerClick}>{t.hints.doubleClickResets}</Hint>
          <Hint icon={SquareDashedMousePointer}>{text.brush}</Hint>
        </>
      }
    >
      <CardGrid>
        <ChartCard
          {...card('zoom')}
          id="zoom"
          footer={
            <span className="flex flex-wrap items-center gap-1 text-muted-foreground">
              {text.zoomFooter(MOD)}
            </span>
          }
        >
          <LineChart data={big} xKey="date" yKey="value" zoom animation={false} height={240} />
        </ChartCard>
        <ChartCard
          {...card('brush')}
          id="brush"
          footer={
            <Readout label={text.selected}>
              <output data-testid="brush-result" className={placeholder}>
                {brush}
              </output>
            </Readout>
          }
        >
          <AreaChart
            data={series}
            xKey="date"
            yKey="students"
            brush
            animation={false}
            height={220}
            onBrush={(r) => setBrush(`${r.startIndex}-${r.endIndex}`)}
          />
        </ChartCard>
        <ChartCard
          {...card('controlled')}
          id="controlled"
          footer={
            <>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MousePointer2 className="size-3.5" aria-hidden />
                {text.controlledFooter}
              </span>
              <Readout label={text.state}>
                <output data-testid="state">{`hidden=${hidden.join(',')};active=${active ?? ''};clicked=${clicked}`}</output>
              </Readout>
            </>
          }
        >
          <BarChart
            data={registrations}
            xKey="month"
            series={[
              { key: 'students', label: 'Students' },
              { key: 'teachers', label: 'Teachers' },
            ]}
            hiddenSeries={hidden}
            onHiddenSeriesChange={setHidden}
            activeIndex={active}
            onActiveIndexChange={setActive}
            onClick={(e) => setClicked(`${e.index}:${String(e.datum.month)}`)}
            animation={false}
            height={220}
          />
        </ChartCard>
      </CardGrid>
    </ScenePage>
  );
}

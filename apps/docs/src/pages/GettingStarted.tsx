import type { ReactNode } from 'react';
import { CHARTS } from '../docs/charts';
import { kkPlural, ruPlural, useT, useText, type L } from '../i18n';
import { Link } from '../lib/router';
import { Callout, PageHeader, Section } from '../ui/Callout';

const PACKAGE_NAMES = [
  '@startupjafari/charts',
  '@startupjafari/charts-core',
  '@startupjafari/charts-react',
  '@startupjafari/charts-canvas',
  '@startupjafari/charts-themes',
  '@startupjafari/charts-export',
] as const;

type PackageName = (typeof PACKAGE_NAMES)[number];

interface GettingStartedText {
  lead: string;
  statusTitle: string;
  status: string;
  principles: string;
  principleItems: readonly ReactNode[];
  defaults: string;
  defaultItems: readonly string[];
  packages: string;
  packageCol: string;
  purposeCol: string;
  packagePurpose: Record<PackageName, string>;
  next: string;
  installation: string;
  quickStart: string;
  charts: (count: number) => string;
  playground: string;
}

const TEXT: L<GettingStartedText> = {
  en: {
    lead: 'Jafari Charts is a data visualisation library for React, built from scratch: its own scales, tick algorithms, curves, layouts, interactions, SVG and Canvas renderers.',
    statusTitle: 'Status: 0.1.0 (development)',
    status:
      'The library is not published to npm yet and the API may still change before 1.0. This site documents the current source in the repository.',
    principles: 'Principles',
    principleItems: [
      <>
        <strong>Performance first.</strong> Layouts are pure and memoised; each chart has one
        pointer handler throttled to the frame rate; hover state lives in an external store so only
        the tooltip and crosshair re-render; marks are batched into a few SVG paths; large inputs
        are downsampled.
      </>,
      <>
        <strong>Beautiful by default.</strong> The defaults are the design: a palette validated for
        colour-vision deficiency, 2 px lines, rounded data ends, recessive hairline grids and
        value-first tooltips.
      </>,
      <>
        <strong>Lightweight.</strong> ESM with one module per source file and{' '}
        <code>sideEffects: false</code>, so you ship only what you import. Canvas and export code
        are separate, lazily loaded chunks.
      </>,
      <>
        <strong>Accessible.</strong> Every chart has a role, name and description, a keyboard model,
        a live region and a hidden data table.
      </>,
      <>
        <strong>Zero chart dependencies.</strong> Nothing is wrapped — not d3, not another chart
        library.
      </>,
    ],
    defaults: 'What every chart does without configuration',
    defaultItems: [
      'Fills the container width and follows resizes (one shared ResizeObserver).',
      'Picks tick values that never overlap, and formats numbers and dates with Intl.',
      'Shows a crosshair and a shared tooltip; a legend for two or more series.',
      'Supports touch (the tooltip stays after lifting the finger) and keyboard.',
      'Renders on the server at a fixed width and hydrates without mismatches.',
      'Follows your app’s light/dark mode.',
      'Respects reduced motion and forced-colours modes.',
    ],
    packages: 'Packages',
    packageCol: 'Package',
    purposeCol: 'Purpose',
    packagePurpose: {
      '@startupjafari/charts':
        'Main package: React components and selected utilities. Most apps need only this.',
      '@startupjafari/charts-core':
        'Framework-independent math core (scales, ticks, curves, layouts, formatting). Zero dependencies, no React or DOM imports.',
      '@startupjafari/charts-react':
        'React adapter: the ChartView shell, primitives and chart components.',
      '@startupjafari/charts-canvas':
        'Canvas 2D renderer, loaded lazily when a chart uses renderer="canvas".',
      '@startupjafari/charts-themes':
        'Design tokens, light/dark themes, the CSS-variables stylesheet and createTheme.',
      '@startupjafari/charts-export':
        'SVG, PNG, WebP and CSV export (entry @startupjafari/charts/export).',
    },
    next: 'Next steps',
    installation: 'Peer dependencies, entry points, CSP and server rendering.',
    quickStart: 'Your first chart, several series, locale, theme and interactions.',
    charts: (n) => `${n} chart types with live examples and props tables.`,
    playground: 'Configure a chart, see the code, and measure it in your browser.',
  },
  ru: {
    lead: 'Jafari Charts — библиотека визуализации данных для React, написанная с нуля: собственные шкалы, алгоритмы делений, кривые, раскладки, взаимодействия, SVG- и Canvas-рендереры.',
    statusTitle: 'Статус: 0.1.0 (в разработке)',
    status:
      'Библиотека ещё не опубликована в npm, и до версии 1.0 API может меняться. Этот сайт описывает текущие исходники в репозитории.',
    principles: 'Принципы',
    principleItems: [
      <>
        <strong>Производительность прежде всего.</strong> Раскладки — чистые функции с мемоизацией;
        у каждой диаграммы один обработчик указателя с троттлингом до частоты кадров; состояние
        наведения живёт во внешнем сторе, поэтому перерисовываются только подсказка и перекрестие;
        метки объединяются в несколько SVG-путей; большие наборы данных прореживаются.
      </>,
      <>
        <strong>Красиво по умолчанию.</strong> Значения по умолчанию — это и есть дизайн: палитра,
        проверенная на различимость при нарушениях цветовосприятия, линии толщиной 2 px, скругления
        на концах столбцов, ненавязчивая тонкая сетка и подсказки, где на первом месте значение.
      </>,
      <>
        <strong>Лёгкость.</strong> ESM, по модулю на каждый исходный файл и{' '}
        <code>sideEffects: false</code> — в бандл попадает только то, что вы импортируете. Код
        Canvas и экспорта вынесен в отдельные чанки, которые загружаются лениво.
      </>,
      <>
        <strong>Доступность.</strong> У каждой диаграммы есть роль, имя и описание, модель
        управления с клавиатуры, live-регион и скрытая таблица данных.
      </>,
      <>
        <strong>Никаких сторонних библиотек диаграмм.</strong> Ничего не взято в обёртку — ни d3, ни
        другая библиотека диаграмм.
      </>,
    ],
    defaults: 'Что каждая диаграмма умеет без настройки',
    defaultItems: [
      'Заполняет ширину контейнера и следит за изменением его размеров (через один общий ResizeObserver).',
      'Подбирает деления так, чтобы подписи не перекрывались, и форматирует числа и даты через Intl.',
      'Показывает перекрестие и общую подсказку, а для двух и более рядов — легенду.',
      'Поддерживает касания (подсказка остаётся на экране, когда палец убран) и клавиатуру.',
      'Рендерится на сервере с фиксированной шириной и гидратируется без расхождений.',
      'Следует светлому или тёмному режиму вашего приложения.',
      'Учитывает режимы «уменьшение движения» и принудительных цветов.',
    ],
    packages: 'Пакеты',
    packageCol: 'Пакет',
    purposeCol: 'Назначение',
    packagePurpose: {
      '@startupjafari/charts':
        'Основной пакет: React-компоненты и избранные утилиты. Большинству приложений нужен только он.',
      '@startupjafari/charts-core':
        'Математическое ядро, не зависящее от фреймворка (шкалы, деления, кривые, раскладки, форматирование). Без зависимостей, без импортов React и DOM.',
      '@startupjafari/charts-react':
        'React-адаптер: оболочка ChartView, примитивы и компоненты диаграмм.',
      '@startupjafari/charts-canvas':
        'Рендерер Canvas 2D; загружается лениво, когда диаграмма использует renderer="canvas".',
      '@startupjafari/charts-themes':
        'Дизайн-токены, светлая и тёмная темы, таблица стилей с CSS-переменными и createTheme.',
      '@startupjafari/charts-export':
        'Экспорт в SVG, PNG, WebP и CSV (точка входа @startupjafari/charts/export).',
    },
    next: 'Что дальше',
    installation: 'Peer-зависимости, точки входа, CSP и серверный рендеринг.',
    quickStart: 'Первая диаграмма, несколько рядов, локаль, тема и взаимодействие.',
    charts: (n) =>
      `${n} ${ruPlural(n, ['тип', 'типа', 'типов'])} диаграмм с живыми примерами и таблицами пропсов.`,
    playground: 'Настройте диаграмму, посмотрите код и измерьте её скорость в своём браузере.',
  },
  kk: {
    lead: 'Jafari Charts — React үшін нөлден жазылған деректерді визуализациялау кітапханасы: өз шкалалары, бөліктерді таңдау алгоритмдері, қисықтары, орналасулары, өзара әрекеттесулері, SVG және Canvas рендерерлері бар.',
    statusTitle: 'Күйі: 0.1.0 (әзірленуде)',
    status:
      'Кітапхана npm-де әлі жарияланған жоқ, 1.0 нұсқасына дейін API өзгеруі мүмкін. Бұл сайт репозиторийдегі ағымдағы бастапқы кодты сипаттайды.',
    principles: 'Қағидаттар',
    principleItems: [
      <>
        <strong>Ең алдымен — өнімділік.</strong> Орналасулар мемоизацияланған таза функциялар; әр
        диаграммада кадр жиілігімен шектелген бір ғана меңзер өңдеушісі бар; меңзерді апару күйі
        сыртқы store-да сақталады, сондықтан тек қалқымалы кеңес пен айқас сызық қайта рендерленеді;
        белгілер бірнеше SVG path элементіне біріктіріледі; үлкен деректер сиретіледі.
      </>,
      <>
        <strong>Әдепкі бойынша әдемі.</strong> Әдепкі мәндердің өзі — дизайн: түс ажырату
        бұзылыстарына тексерілген палитра, 2 px сызықтар, дөңгеленген деректер ұштары, көзге
        ұрмайтын жіңішке тор және мәнді алдыңғы орынға қоятын қалқымалы кеңестер.
      </>,
      <>
        <strong>Жеңіл.</strong> ESM, әр бастапқы файлға бір модуль және{' '}
        <code>sideEffects: false</code> — бандлға тек импорттағаныңыз ғана түседі. Canvas және
        экспорт коды бөлек, кешіктіріліп жүктелетін чанктарда.
      </>,
      <>
        <strong>Қолжетімді.</strong> Әр диаграммада рөл, атау және сипаттама, пернетақтамен басқару
        моделі, live-аймақ және жасырын деректер кестесі бар.
      </>,
      <>
        <strong>Бөгде диаграмма кітапханалары жоқ.</strong> Кітапхана ешнәрсенің үстіне құрылмаған —
        d3-тің де, басқа диаграмма кітапханасының да.
      </>,
    ],
    defaults: 'Әр диаграмма баптаусыз не істейді',
    defaultItems: [
      'Контейнердің енін толтырады және оның өлшемі өзгергенін бақылайды (бір ортақ ResizeObserver арқылы).',
      'Жазулар бір-біріне қабаттаспайтындай бөліктерді таңдайды, сандар мен күндерді Intl арқылы пішімдейді.',
      'Айқас сызық пен ортақ қалқымалы кеңесті, ал екі не одан көп қатар үшін шартты белгілерді көрсетеді.',
      'Сенсорлық басқаруды (саусақты алғанда қалқымалы кеңес экранда қалады) және пернетақтаны қолдайды.',
      'Серверде тұрақты енмен рендерленеді және сәйкессіздіксіз гидратацияланады.',
      'Қолданбаңыздың ашық немесе күңгірт режиміне ілеседі.',
      'Қозғалысты азайту және мәжбүрлі түстер режимдерін ескереді.',
    ],
    packages: 'Пакеттер',
    packageCol: 'Пакет',
    purposeCol: 'Мақсаты',
    packagePurpose: {
      '@startupjafari/charts':
        'Негізгі пакет: React компоненттері және таңдаулы утилиталар. Қолданбалардың көбіне осы жеткілікті.',
      '@startupjafari/charts-core':
        'Фреймворкке тәуелсіз математикалық ядро (шкалалар, бөліктер, қисықтар, орналасулар, пішімдеу). Тәуелділіктері жоқ, React пен DOM импорттамайды.',
      '@startupjafari/charts-react':
        'React адаптері: ChartView қабығы, примитивтер және диаграмма компоненттері.',
      '@startupjafari/charts-canvas':
        'Canvas 2D рендерері; диаграмма renderer="canvas" пайдаланғанда кешіктіріліп жүктеледі.',
      '@startupjafari/charts-themes':
        'Дизайн токендері, ашық және күңгірт тақырыптар, CSS айнымалылары бар стильдер кестесі және createTheme.',
      '@startupjafari/charts-export':
        'SVG, PNG, WebP және CSV форматтарына экспорт (кіру нүктесі @startupjafari/charts/export).',
    },
    next: 'Әрі қарай',
    installation: 'Peer тәуелділіктер, кіру нүктелері, CSP және серверлік рендеринг.',
    quickStart: 'Алғашқы диаграмма, бірнеше қатар, локаль, тақырып және өзара әрекеттесу.',
    charts: (n) =>
      `Интерактивті мысалдары мен пропстар кестелері бар ${n} ${kkPlural(n, 'диаграмма түрі')}.`,
    playground:
      'Диаграмманы баптаңыз, кодын көріңіз және оның жылдамдығын өз браузеріңізде өлшеңіз.',
  },
};

export function GettingStarted() {
  const ui = useT();
  const t = useText(TEXT);
  return (
    <article>
      <PageHeader eyebrow={ui.nav.gettingStarted} title={ui.pages.introduction} lead={t.lead} />
      <Callout tone="warning" title={t.statusTitle}>
        {t.status}
      </Callout>

      <Section id="principles" title={t.principles}>
        <ul>
          {t.principleItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="what-you-get" title={t.defaults}>
        <ul>
          {t.defaultItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section id="packages" title={t.packages}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.packageCol}</th>
                <th scope="col">{t.purposeCol}</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGE_NAMES.map((name) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>{t.packagePurpose[name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="next" title={t.next}>
        <div className="card-grid">
          <div className="card">
            <h3>
              <Link to="/installation" className="card-link">
                {ui.pages.installation}
              </Link>
            </h3>
            <p>{t.installation}</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/quick-start" className="card-link">
                {ui.pages.quickStart}
              </Link>
            </h3>
            <p>{t.quickStart}</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/charts" className="card-link">
                {ui.pages.charts}
              </Link>
            </h3>
            <p>{t.charts(CHARTS.length)}</p>
          </div>
          <div className="card">
            <h3>
              <Link to="/playground" className="card-link">
                {ui.pages.playground}
              </Link>
            </h3>
            <p>{t.playground}</p>
          </div>
        </div>
      </Section>
    </article>
  );
}

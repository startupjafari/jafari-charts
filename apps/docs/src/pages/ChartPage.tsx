import { ArrowRightLeft, Check, ChevronRight, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ChartDoc, ChartSectionId, PropGroup } from '../docs/types';
import { useLang, useT, useText, type L } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { Callout, Kbd, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';
import { inlineCode, PropsTable, richText } from '../ui/PropsTable';
import { Badge } from '../ui/badge';
import { WHEN_TO_USE } from '../docs/when-to-use';

const INSTALL = 'pnpm add @startupjafari/charts';

interface SectionText {
  id: ChartSectionId;
  title: string;
  short: string;
  lead: string;
}

interface ChartPageText {
  /** The standard sections, in page order. */
  sections: readonly SectionText[];
  importTitle: string;
  props: string;
  keyboardCaption: string;
  keys: string;
  action: string;
  typesCallout: ReactNode;
  seeApi: ReactNode;
}

const TEXT: L<ChartPageText> = {
  en: {
    sections: [
      { id: 'usage', title: 'Usage', short: 'Usage', lead: '' },
      {
        id: 'styling',
        title: 'Styling variants',
        short: 'Styling',
        lead: 'Every visual parameter has a sensible default; these examples show the props that change them. Use the Light/Dark switch above each preview to check both themes.',
      },
      {
        id: 'interaction',
        title: 'Interaction',
        short: 'Interaction',
        lead: 'Tooltips, legend toggling and keyboard navigation work without configuration. Controlled props let your app read and drive the state.',
      },
      {
        id: 'responsive',
        title: 'Responsive',
        short: 'Responsive',
        lead: 'Charts fill their container and follow resizes through one shared ResizeObserver. Tick labels are thinned so they never overlap. Try the 480 and 320 width switches on any example.',
      },
      {
        id: 'empty',
        title: 'Empty, loading and error states',
        short: 'States',
        lead: 'States keep the chart’s footprint, so the layout never jumps while data loads.',
      },
    ],
    importTitle: 'Import',
    props: 'Props',
    keyboardCaption: 'Keyboard (focus the chart with Tab first)',
    keys: 'Keys',
    action: 'Action',
    typesCallout: (
      <>
        Types are exact: keys such as <code>xKey</code> and series keys are checked against your
        data type, so a typo or a non-numeric field is a compile error.
      </>
    ),
    seeApi: (
      <>
        See the <Link to="/api">API reference</Link> for exported types.
      </>
    ),
  },
  ru: {
    sections: [
      { id: 'usage', title: 'Использование', short: 'Использование', lead: '' },
      {
        id: 'styling',
        title: 'Варианты оформления',
        short: 'Оформление',
        lead: 'У каждого визуального параметра есть продуманное значение по умолчанию; эти примеры показывают пропсы, которые его меняют. Переключатель «Светлая / Тёмная» над каждым превью позволяет проверить обе темы.',
      },
      {
        id: 'interaction',
        title: 'Взаимодействие',
        short: 'Взаимодействие',
        lead: 'Подсказки, переключение рядов в легенде и навигация с клавиатуры работают без настройки. Контролируемые пропсы позволяют приложению читать это состояние и управлять им.',
      },
      {
        id: 'responsive',
        title: 'Адаптивность',
        short: 'Адаптивность',
        lead: 'Диаграммы заполняют контейнер и следят за изменением его размеров через один общий ResizeObserver. Подписи делений прореживаются, чтобы никогда не перекрываться. Попробуйте переключатели ширины 480 и 320 в любом примере.',
      },
      {
        id: 'empty',
        title: 'Состояния: нет данных, загрузка, ошибка',
        short: 'Состояния',
        lead: 'В любом состоянии диаграмма сохраняет свои размеры, поэтому макет не прыгает, пока загружаются данные.',
      },
    ],
    importTitle: 'Импорт',
    props: 'Пропсы',
    keyboardCaption: 'Клавиатура (сначала переведите фокус на диаграмму клавишей Tab)',
    keys: 'Клавиши',
    action: 'Действие',
    typesCallout: (
      <>
        Типы точные: ключи вроде <code>xKey</code> и ключи рядов проверяются по типу ваших данных,
        поэтому опечатка или нечисловое поле — это ошибка компиляции.
      </>
    ),
    seeApi: (
      <>
        Экспортируемые типы описаны в <Link to="/api">справочнике API</Link>.
      </>
    ),
  },
  kk: {
    sections: [
      { id: 'usage', title: 'Қолдану', short: 'Қолдану', lead: '' },
      {
        id: 'styling',
        title: 'Безендіру нұсқалары',
        short: 'Безендіру',
        lead: 'Әр визуалды параметрдің ойластырылған әдепкі мәні бар; бұл мысалдар оны өзгертетін пропстарды көрсетеді. Екі тақырыпты тексеру үшін әр алдын ала көру аймағының үстіндегі «Ашық / Күңгірт» ауыстырғышын пайдаланыңыз.',
      },
      {
        id: 'interaction',
        title: 'Өзара әрекеттесу',
        short: 'Өзара әрекеттесу',
        lead: 'Қалқымалы кеңестер, шартты белгілерде қатарларды жасыру мен көрсету және пернетақтамен навигация баптаусыз жұмыс істейді. Басқарылатын пропстар арқылы қолданба бұл күйді оқып, оны басқара алады.',
      },
      {
        id: 'responsive',
        title: 'Бейімделгіштік',
        short: 'Бейімделгіштік',
        lead: 'Диаграммалар контейнерді толтырады және оның өлшемінің өзгеруін бір ортақ ResizeObserver арқылы бақылайды. Бөлік жазулары бір-бірін ешқашан жаппауы үшін сиретіледі. Кез келген мысалда 480 және 320 ен ауыстырғыштарын қолданып көріңіз.',
      },
      {
        id: 'empty',
        title: 'Күйлер: деректер жоқ, жүктелу, қате',
        short: 'Күйлер',
        lead: 'Кез келген күйде диаграмма өз өлшемін сақтайды, сондықтан деректер жүктеліп жатқанда бет орналасуы ығыспайды.',
      },
    ],
    importTitle: 'Импорт',
    props: 'Пропстар',
    keyboardCaption: 'Пернетақта (алдымен Tab пернесімен диаграммаға фокус қойыңыз)',
    keys: 'Пернелер',
    action: 'Әрекет',
    typesCallout: (
      <>
        Типтер дәл: <code>xKey</code> сияқты кілттер мен қатар кілттері деректеріңіздің типі бойынша
        тексеріледі, сондықтан қате терілген кілт немесе сандық емес өріс компиляция қатесін береді.
      </>
    ),
    seeApi: (
      <>
        Экспортталатын типтер <Link to="/api">API анықтамалығында</Link> сипатталған.
      </>
    ),
  },
};

function PropGroupView({ group, open }: { group: PropGroup; open: boolean }) {
  const lang = useLang();
  return (
    <details
      className="group/pg my-4 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
      open={open}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold outline-none select-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset group-open/pg:border-b group-open/pg:border-border [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open/pg:rotate-90"
          aria-hidden
        />
        <span className="min-w-0 flex-1">{group.title[lang]}</span>
        <Badge variant="secondary" className="tabular-nums">
          {group.props.length}
        </Badge>
      </summary>
      {group.note ? (
        <p className="m-0 border-b border-border bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground">
          {richText(group.note[lang])}
        </p>
      ) : null}
      <PropsTable props={group.props} bare />
    </details>
  );
}

/** “When to use it” card: what the chart answers well, and what to pick instead. */
function WhenToUse({ slug }: { slug: string }) {
  const lang = useLang();
  const ui = useT();
  const guide = WHEN_TO_USE[slug]?.[lang];
  if (!guide) return null;
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <p className="m-0 flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
          <Lightbulb className="size-4" aria-hidden />
        </span>
        {ui.chartPage.whenToUse}
      </p>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
        {guide.good.map((g) => (
          <li key={g} className="m-0 flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <span>{g}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 flex gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
        <ArrowRightLeft className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{inlineCode(guide.instead)}</span>
      </p>
    </div>
  );
}

function KeyboardTable({ keys }: { keys: ChartDoc['keyboard'] }) {
  const lang = useLang();
  const t = useText(TEXT);
  return (
    <div className="table-wrap">
      <table>
        <caption>{t.keyboardCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.keys}</th>
            <th scope="col">{t.action}</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(([k, action]) => (
            <tr key={k}>
              <th scope="row">
                <span className="kbd-list">
                  {k.split(' ').map((part) => (
                    <Kbd key={part}>{part}</Kbd>
                  ))}
                </span>
              </th>
              <td>{action[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartPage({ doc }: { doc: ChartDoc }) {
  const { path } = useLocation();
  const lang = useLang();
  const ui = useT();
  const t = useText(TEXT);
  const importLine = `import { ${doc.component} } from '@startupjafari/charts';`;
  const toc = [
    ...t.sections
      .filter((s) => doc.sections[s.id].length > 0)
      .map((s) => ({ id: s.id, title: s.short })),
    { id: 'props', title: t.props },
  ];
  return (
    <article>
      <PageHeader
        eyebrow={ui.chartEyebrow(doc.group, doc.title[lang])}
        title={doc.component}
        lead={doc.summary[lang]}
      >
        <nav aria-label={ui.a11y.onThisPage}>
          <ul className="page-toc">
            {toc.map((s) => (
              <li key={s.id}>
                <Link to={path} section={s.id}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <div className="prose">{doc.description[lang]}</div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <WhenToUse slug={doc.slug} />
        <div className="flex min-w-0 flex-col gap-3">
          <CodeBlock code={INSTALL} language="bash" title={ui.chartPage.install} className="my-0" />
          <CodeBlock code={importLine} language="tsx" title={t.importTitle} className="my-0" wrap />
        </div>
      </div>
      {t.sections.map((s) => {
        const examples = doc.sections[s.id];
        if (!examples.length) return null;
        const note = doc.sectionNotes?.[s.id];
        return (
          <Section key={s.id} id={s.id} title={s.title} lead={s.lead || undefined}>
            {note ? <div className="prose">{note[lang]}</div> : null}
            {s.id === 'interaction' ? <KeyboardTable keys={doc.keyboard} /> : null}
            {examples.map((e, i) => (
              <Example
                key={e.id}
                id={e.id}
                anchor={`${s.id}-${e.id.split('/').pop()?.toLowerCase() ?? i}`}
                title={e.title[lang]}
                description={e.description?.[lang]}
                {...(e.width !== undefined ? { width: e.width } : {})}
              />
            ))}
          </Section>
        );
      })}
      <Section id="props" title={t.props}>
        <Callout>{t.typesCallout}</Callout>
        {doc.props.map((g, i) => (
          <PropGroupView key={g.title.en} group={g} open={!g.collapsed || i === 0} />
        ))}
        <p className="muted mt-4">{t.seeApi}</p>
      </Section>
    </article>
  );
}

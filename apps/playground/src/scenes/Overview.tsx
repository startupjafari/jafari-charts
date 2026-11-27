import {
  ArrowRight,
  FlaskConical,
  Keyboard,
  Link2,
  MousePointer2,
  PanelTop,
  SlidersHorizontal,
  type LucideIcon,
} from '../ui/icons';
import type { MouseEvent, ReactNode } from 'react';
import { GROUPS, SCENES, type SceneInfo } from '../catalog';
import { useT, useText, type L } from '../i18n';
import { sceneHref, usePlayground } from '../shell/playground';
import { Hint, Hints, ScenePage } from '../shell/scene-page';
import { cn } from '../lib/utils';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface OverviewText {
  heading: string;
  intro: string;
  steps: Record<'header' | 'hints' | 'cards' | 'settings', { title: string; text: string }>;
  hover: string;
  keyboard: string;
  urlParameters: string;
  params: Record<'scene' | 'lang' | 'theme' | 'locale' | 'animation' | 'bench', string>;
}

const TEXT: L<OverviewText> = {
  en: {
    heading: 'A workbench for Jafari Charts',
    intro:
      'Each scene puts one part of the library on a page with realistic data. The same pages are the fixtures of the automated suites: end-to-end and visual regression tests, accessibility checks and benchmarks open them by URL, so what you see here is exactly what is tested.',
    steps: {
      header: {
        title: 'Header',
        text: 'The scene title, one line on its purpose and the scene’s own controls.',
      },
      hints: {
        title: 'Hints',
        text: 'How to interact: hover, drag, wheel and keyboard shortcuts.',
      },
      cards: {
        title: 'Cards',
        text: 'One example per card. Showcase first, edge cases and stress tests after.',
      },
      settings: {
        title: 'Preview settings',
        text: 'Language, theme, locale and animations in the sidebar apply to every scene.',
      },
    },
    hover: 'Hover any chart for exact values',
    keyboard: 'Tab to a chart, then use the arrow keys',
    urlParameters: 'URL parameters',
    params: {
      scene: 'Which scene to open, e.g. gallery or zoom.',
      lang: 'en, ru or kk; the interface language for this visit, over the saved choice.',
      theme: 'light or dark; overrides the saved theme for this visit.',
      locale:
        'en, ru or kk; number and date formatting of every chart (by default the interface language).',
      animation: 'off disables entry animations (the test suites use it).',
      bench: 'Benchmark set-up, e.g. chart=line&points=10000.',
    },
  },
  ru: {
    heading: 'Рабочий стенд Jafari Charts',
    intro:
      'Каждая сцена показывает одну часть библиотеки на отдельной странице с реалистичными данными. Эти же страницы служат фикстурами автоматических наборов: сквозные и визуальные регрессионные тесты, проверки доступности и бенчмарки открывают их по URL, поэтому здесь вы видите ровно то, что тестируется.',
    steps: {
      header: {
        title: 'Заголовок',
        text: 'Название сцены, одна строка о её назначении и собственные элементы управления.',
      },
      hints: {
        title: 'Подсказки',
        text: 'Как управлять: наведение, перетаскивание, колесо мыши и сочетания клавиш.',
      },
      cards: {
        title: 'Карточки',
        text: 'По одному примеру на карточку. Сначала основные примеры, затем пограничные случаи и стресс-тесты.',
      },
      settings: {
        title: 'Настройки превью',
        text: 'Язык, тема, локаль и анимация в боковой панели действуют на все сцены.',
      },
    },
    hover: 'Наведите указатель на диаграмму, чтобы увидеть точные значения',
    keyboard: 'Перейдите к диаграмме клавишей Tab и нажимайте стрелки',
    urlParameters: 'Параметры URL',
    params: {
      scene: 'Какую сцену открыть, например gallery или zoom.',
      lang: 'en, ru или kk; язык интерфейса на этот визит, важнее сохранённого выбора.',
      theme: 'light или dark; заменяет сохранённую тему на этот визит.',
      locale:
        'en, ru или kk; формат чисел и дат во всех диаграммах (по умолчанию — язык интерфейса).',
      animation: 'off отключает анимацию появления (так делают тестовые наборы).',
      bench: 'Настройка бенчмарка, например chart=line&points=10000.',
    },
  },
  kk: {
    heading: 'Jafari Charts сынақ стенді',
    intro:
      'Әр көрініс кітапхананың бір бөлігін нақтыға жақын деректермен жеке бетте көрсетеді. Дәл осы беттер автоматты тест жиындарының фикстуралары: E2E және визуалды регрессия тесттері, қолжетімділік тексерулері мен бенчмарктар оларды URL арқылы ашады. Сондықтан мұнда көргеніңіз — дәл тексерілетін нәрсе.',
    steps: {
      header: {
        title: 'Жоғарғы жолақ',
        text: 'Көрініс атауы, оның мақсаты туралы бір жол және көріністің өз басқару элементтері.',
      },
      hints: {
        title: 'Кеңестер',
        text: 'Қалай басқару керек: меңзерді апару, сүйреу, тышқан дөңгелегі және пернелер тіркесімдері.',
      },
      cards: {
        title: 'Карточкалар',
        text: 'Әр карточкада бір мысал. Алдымен негізгі мысалдар, содан кейін шеткі жағдайлар мен стресс-тесттер.',
      },
      settings: {
        title: 'Алдын ала қарау баптаулары',
        text: 'Бүйірлік панельдегі тіл, тақырып, локаль және анимация барлық көрініске қолданылады.',
      },
    },
    hover: 'Нақты мәндерді көру үшін меңзерді диаграммаға апарыңыз',
    keyboard: 'Tab пернесімен диаграммаға өтіп, көрсеткі пернелерін басыңыз',
    urlParameters: 'URL параметрлері',
    params: {
      scene: 'Қай көріністі ашу керек, мысалы gallery немесе zoom.',
      lang: 'en, ru немесе kk; осы кіруге арналған интерфейс тілі, сақталған таңдаудан басым.',
      theme: 'light немесе dark; осы кіруде сақталған тақырыпты алмастырады.',
      locale:
        'en, ru немесе kk; барлық диаграммадағы сандар мен күндер пішімі (әдепкі бойынша — интерфейс тілі).',
      animation: 'off пайда болу анимациясын өшіреді (тест жиындары осылай істейді).',
      bench: 'Бенчмарк баптауы, мысалы chart=line&points=10000.',
    },
  },
};

function SceneLink({ scene }: { scene: SceneInfo }) {
  const { navigate } = usePlayground();
  const t = useT();
  const Icon = scene.icon;
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(scene.id);
  };
  return (
    <a
      href={sceneHref(scene.id)}
      onClick={onClick}
      className="group flex min-w-0 flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground ring-1 ring-foreground/10 outline-none hover:bg-muted/40 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-ink">
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {t.scenes[scene.id].title}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-control) group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">
        {t.scenes[scene.id].summary}
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-1">
        <code className="mr-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground">
          ?scene={scene.id}
        </code>
        {scene.usedBy.map((suite) => (
          <Badge key={suite} variant="secondary">
            {t.suites[suite]}
          </Badge>
        ))}
      </span>
    </a>
  );
}

function Step({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">{children}</span>
      </span>
    </li>
  );
}

const STEPS: ReadonlyArray<[keyof OverviewText['steps'], LucideIcon]> = [
  ['header', PanelTop],
  ['hints', MousePointer2],
  ['cards', FlaskConical],
  ['settings', SlidersHorizontal],
];

const PARAMS: ReadonlyArray<[string, keyof OverviewText['params']]> = [
  ['scene', 'scene'],
  ['lang', 'lang'],
  ['theme', 'theme'],
  ['locale', 'locale'],
  ['animation', 'animation'],
  ['chart · points · charts · renderer', 'bench'],
];

/** On wide screens beside the introduction, on narrow ones after the scene list. */
function UrlParameters({ className }: { className?: string }) {
  const text = useText(TEXT);
  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-primary" aria-hidden />
        <h2 className="text-base font-semibold">{text.urlParameters}</h2>
      </div>
      <dl className="flex flex-col divide-y divide-border">
        {PARAMS.map(([name, key]) => (
          <div key={name} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
            <dt>
              <code className="font-mono text-xs font-medium text-foreground">{name}</code>
            </dt>
            <dd className="text-xs text-muted-foreground">{text.params[key]}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** Landing page: what the playground is and what every scene demonstrates. */
export function Overview() {
  const t = useT();
  const text = useText(TEXT);
  return (
    <ScenePage scene="overview">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-semibold">{text.heading}</h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {text.intro}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {STEPS.map(([key, icon]) => (
              <Step key={key} icon={icon} title={text.steps[key].title}>
                {text.steps[key].text}
              </Step>
            ))}
          </ul>
        </Card>
        <UrlParameters className="hidden xl:flex" />
      </div>

      <Hints>
        <Hint icon={MousePointer2}>{text.hover}</Hint>
        <Hint icon={MousePointer2}>{t.hints.legendSeries}</Hint>
        <Hint icon={Keyboard}>{text.keyboard}</Hint>
      </Hints>

      {GROUPS.filter((g) => g !== 'start').map((group) => {
        const scenes = SCENES.filter((s) => s.group === group);
        return (
          <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-3">
            <div className="px-0.5">
              <h2 id={`group-${group}`} className="text-sm font-semibold">
                {t.groups[group].label}
              </h2>
              <p className="text-xs text-muted-foreground">{t.groups[group].description}</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3">
              {scenes.map((s) => (
                <SceneLink key={s.id} scene={s} />
              ))}
            </div>
          </section>
        );
      })}
      <UrlParameters className="xl:hidden" />
    </ScenePage>
  );
}

import {
  ArrowRight,
  FlaskConical,
  Keyboard,
  Link2,
  MousePointer2,
  PanelTop,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { GROUPS, SCENES, type SceneInfo } from '../catalog';
import { sceneHref, usePlayground } from '../shell/playground';
import { Hint, Hints, ScenePage } from '../shell/scene-page';
import { cn } from '../lib/utils';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

function SceneLink({ scene }: { scene: SceneInfo }) {
  const { navigate } = usePlayground();
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
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{scene.title}</span>
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-control) group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">{scene.summary}</span>
      <span className="mt-auto flex flex-wrap items-center gap-1">
        <code className="mr-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground">
          ?scene={scene.id}
        </code>
        {scene.usedBy.map((suite) => (
          <Badge key={suite} variant="secondary">
            {suite}
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

const PARAMS: ReadonlyArray<[string, string]> = [
  ['scene', 'Which scene to open, e.g. gallery or zoom.'],
  ['theme', 'light or dark; overrides the saved theme for this visit.'],
  ['locale', 'en, ru or kk; number and date formatting of every chart.'],
  ['animation', 'off disables entry animations (the test suites use it).'],
  ['chart · points · charts · renderer', 'Benchmark set-up, e.g. chart=line&points=10000.'],
];

/** On wide screens beside the introduction, on narrow ones after the scene list. */
function UrlParameters({ className }: { className?: string }) {
  return (
    <Card className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center gap-2">
        <Link2 className="size-4 text-primary" aria-hidden />
        <h2 className="text-base font-semibold">URL parameters</h2>
      </div>
      <dl className="flex flex-col divide-y divide-border">
        {PARAMS.map(([name, text]) => (
          <div key={name} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
            <dt>
              <code className="font-mono text-xs font-medium text-foreground">{name}</code>
            </dt>
            <dd className="text-xs text-muted-foreground">{text}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** Landing page: what the playground is and what every scene demonstrates. */
export function Overview() {
  return (
    <ScenePage scene="overview">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-semibold">A workbench for Jafari Charts</h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Each scene puts one part of the library on a page with realistic data. The same pages
              are the fixtures of the automated suites: end-to-end and visual regression tests,
              accessibility checks and benchmarks open them by URL, so what you see here is exactly
              what is tested.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            <Step icon={PanelTop} title="Header">
              The scene title, one line on its purpose and the scene’s own controls.
            </Step>
            <Step icon={MousePointer2} title="Hints">
              How to interact: hover, drag, wheel and keyboard shortcuts.
            </Step>
            <Step icon={FlaskConical} title="Cards">
              One example per card. Showcase first, edge cases and stress tests after.
            </Step>
            <Step icon={SlidersHorizontal} title="Preview settings">
              Theme, locale and animations in the sidebar apply to every scene.
            </Step>
          </ul>
        </Card>
        <UrlParameters className="hidden xl:flex" />
      </div>

      <Hints>
        <Hint icon={MousePointer2}>Hover any chart for exact values</Hint>
        <Hint icon={MousePointer2}>Click legend items to hide a series</Hint>
        <Hint icon={Keyboard}>Tab to a chart, then use the arrow keys</Hint>
      </Hints>

      {GROUPS.filter((g) => g.id !== 'start').map((group) => {
        const scenes = SCENES.filter((s) => s.group === group.id);
        return (
          <section
            key={group.id}
            aria-labelledby={`group-${group.id}`}
            className="flex flex-col gap-3"
          >
            <div className="px-0.5">
              <h2 id={`group-${group.id}`} className="text-sm font-semibold">
                {group.label}
              </h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
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

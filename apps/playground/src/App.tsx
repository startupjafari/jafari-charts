import { ChartProvider } from '@startupjafari/charts';
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import { DEFAULT_SCENE, SCENES } from './catalog';
import { useTheme } from './lib/theme';
import { AppShell } from './shell/app-shell';
import {
  PlaygroundContext,
  currentSceneId,
  replaceParams,
  sceneHref,
  type PlaygroundState,
} from './shell/playground';
import { PageHeader } from './shell/scene-page';
import { EmptyState } from './ui/empty-state';

// Every file in ./scenes registers itself: ?scene=<FileName> (case-insensitive).
const modules = import.meta.glob<Record<string, ComponentType>>('./scenes/*.tsx', { eager: true });
const scenes = new Map<string, ComponentType>();
for (const [path, mod] of Object.entries(modules)) {
  const name = path.replace(/^.*\/(.*)\.tsx$/, '$1');
  const component = mod[name] ?? Object.values(mod).find((v) => typeof v === 'function');
  if (component) scenes.set(name.toLowerCase(), component);
}

const readParam = (name: string) => new URLSearchParams(location.search).get(name);

export function App() {
  const [scene, setScene] = useState(() => currentSceneId(DEFAULT_SCENE));
  const [locale, setLocaleState] = useState(() => readParam('locale') ?? 'en');
  const [animation, setAnimationState] = useState(() => readParam('animation') !== 'off');
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    const onPop = () => setScene(currentSceneId(DEFAULT_SCENE));
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((id: string) => {
    history.pushState(null, '', sceneHref(id));
    setScene(id);
    scrollTo({ top: 0 });
    // Move focus to the new page title so screen readers announce the scene.
    requestAnimationFrame(() =>
      document.getElementById('scene-title')?.focus({ preventScroll: true }),
    );
  }, []);

  const setLocale = useCallback((next: string) => {
    replaceParams({ locale: next === 'en' ? null : next });
    setLocaleState(next);
  }, []);

  const setAnimation = useCallback((on: boolean) => {
    replaceParams({ animation: on ? null : 'off' });
    setAnimationState(on);
  }, []);

  useEffect(() => {
    const title = SCENES.find((s) => s.id === scene)?.title;
    document.title = title ? `${title} · Jafari Charts Playground` : 'Jafari Charts Playground';
  }, [scene]);

  const state = useMemo<PlaygroundState>(
    () => ({ scene, navigate, locale, setLocale, animation, setAnimation, theme, setTheme }),
    [scene, navigate, locale, setLocale, animation, setAnimation, theme, setTheme],
  );

  const Scene = scenes.get(scene);
  return (
    <PlaygroundContext.Provider value={state}>
      <ChartProvider locale={locale}>
        <AppShell>
          {Scene ? (
            // Remount on the animation switch so entry animations replay (or stop).
            createElement(Scene, { key: `${scene}:${animation}` })
          ) : (
            <>
              <PageHeader
                title="Scene not found"
                subtitle={`There is no scene called “${scene}”.`}
              />
              <EmptyState
                title="Nothing to show here"
                description="Pick a scene in the navigation, or open ?scene=overview."
              />
            </>
          )}
        </AppShell>
      </ChartProvider>
    </PlaygroundContext.Provider>
  );
}

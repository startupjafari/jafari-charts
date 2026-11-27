import { ChartProvider } from '@startupjafari/charts';
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import { DEFAULT_SCENE, isSceneId } from './catalog';
import { LangProvider, messagesFor, useLangState } from './i18n';
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

const readParam = (name: string) => new URLSearchParams(location.search).get(name) || null;

export function App() {
  const langState = useLangState();
  const { lang } = langState;
  const [scene, setScene] = useState(() => currentSceneId(DEFAULT_SCENE));
  const [localeOverride, setLocaleOverrideState] = useState(() => readParam('locale'));
  const [animation, setAnimationState] = useState(() => readParam('animation') !== 'off');
  const [theme, setTheme] = useTheme();
  // Charts format numbers and dates in the interface language unless a locale was picked.
  const locale = localeOverride ?? lang;

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

  const setLocaleOverride = useCallback((next: string | null) => {
    replaceParams({ locale: next });
    setLocaleOverrideState(next);
  }, []);

  const setAnimation = useCallback((on: boolean) => {
    replaceParams({ animation: on ? null : 'off' });
    setAnimationState(on);
  }, []);

  // <html lang>, the tab title and the meta description follow the interface language.
  useEffect(() => {
    const t = messagesFor(lang);
    document.documentElement.lang = lang;
    document.title = isSceneId(scene) ? t.app.documentTitle(t.scenes[scene].title) : t.app.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.app.description);
  }, [scene, lang]);

  const state = useMemo<PlaygroundState>(
    () => ({
      scene,
      navigate,
      locale,
      localeOverride,
      setLocaleOverride,
      animation,
      setAnimation,
      theme,
      setTheme,
    }),
    [
      scene,
      navigate,
      locale,
      localeOverride,
      setLocaleOverride,
      animation,
      setAnimation,
      theme,
      setTheme,
    ],
  );

  const Scene = scenes.get(scene);
  const t = messagesFor(lang);
  return (
    <LangProvider value={langState}>
      <PlaygroundContext.Provider value={state}>
        <ChartProvider locale={locale}>
          <AppShell>
            {Scene ? (
              // Remount on the animation switch so entry animations replay (or stop).
              createElement(Scene, { key: `${scene}:${animation}` })
            ) : (
              <>
                <PageHeader title={t.notFound.title} subtitle={t.notFound.subtitle(scene)} />
                <EmptyState
                  title={t.notFound.emptyTitle}
                  description={t.notFound.emptyDescription}
                />
              </>
            )}
          </AppShell>
        </ChartProvider>
      </PlaygroundContext.Provider>
    </LangProvider>
  );
}

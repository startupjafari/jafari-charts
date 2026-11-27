import { createContext, useContext } from 'react';
import type { ThemePreference } from '../lib/theme';

export type Locale = 'en' | 'ru' | 'kk';

export const LOCALES: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'kk', label: 'Қазақша' },
];

/** Query parameters that survive navigation between scenes. */
const PRESERVED = ['locale', 'animation', 'theme'] as const;

export function currentSceneId(fallback: string): string {
  return (new URLSearchParams(location.search).get('scene') ?? fallback).toLowerCase();
}

export function sceneHref(id: string): string {
  const current = new URLSearchParams(location.search);
  const next = new URLSearchParams({ scene: id });
  for (const key of PRESERVED) {
    const value = current.get(key);
    if (value !== null) next.set(key, value);
  }
  return `?${next.toString()}`;
}

/** Sets (or, with `null`, removes) query parameters without adding a history entry. */
export function replaceParams(updates: Record<string, string | null>) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  history.replaceState(history.state, '', url);
}

export interface PlaygroundState {
  scene: string;
  navigate: (scene: string) => void;
  locale: string;
  setLocale: (locale: string) => void;
  /** Entry animations; `?animation=off` turns them off (the e2e suites do). */
  animation: boolean;
  setAnimation: (on: boolean) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const PlaygroundContext = createContext<PlaygroundState | null>(null);

export function usePlayground(): PlaygroundState {
  const value = useContext(PlaygroundContext);
  if (!value) throw new Error('usePlayground() outside <App>');
  return value;
}

/** Whether scenes should animate charts in. */
export function useAnimation(): boolean {
  return usePlayground().animation;
}

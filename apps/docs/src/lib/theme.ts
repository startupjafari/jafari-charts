import { useEffect, useSyncExternalStore } from 'react';

/**
 * Global colour scheme of the docs site. A `dark` class on `<html>` drives both the
 * site styles and every chart rendered with `theme="auto"`.
 *
 * The visitor picks `light`, `dark` or `system`; `system` (the default) follows the
 * OS and keeps following it while the page is open. Only an explicit light/dark
 * choice is stored.
 */
export type SiteTheme = 'light' | 'dark';
export type ThemePreference = SiteTheme | 'system';

const STORAGE_KEY = 'jc-docs-theme';
const listeners = new Set<() => void>();

function readStored(): SiteTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function writeStored(value: SiteTheme | null): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the choice then lasts for the session.
  }
}

function osPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/** In-memory preference, so the choice works even when storage is blocked. */
let preference: ThemePreference =
  typeof window === 'undefined' ? 'system' : (readStored() ?? 'system');

function current(): SiteTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function apply(theme: SiteTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  listeners.forEach((l) => l());
}

/** Applies and remembers the visitor's choice (`system` forgets the stored one). */
export function setThemePreference(next: ThemePreference): void {
  preference = next;
  writeStored(next === 'system' ? null : next);
  apply(next === 'system' ? (osPrefersDark() ? 'dark' : 'light') : next);
}

/** Explicit light/dark switch (kept for callers that only toggle). */
export function setSiteTheme(theme: SiteTheme): void {
  setThemePreference(theme);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current resolved site theme; re-renders on change. */
export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, current, () => 'light');
}

/** The visitor's choice: light, dark or system. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(
    subscribe,
    () => preference,
    () => 'system',
  );
}

/** Follows OS changes for visitors who never picked a theme explicitly. */
export function useFollowOsTheme(): void {
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (preference === 'system') apply(osPrefersDark() ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
}

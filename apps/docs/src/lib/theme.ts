import { useEffect, useSyncExternalStore } from 'react';

/**
 * Global colour scheme of the docs site. A `dark` class on `<html>` drives both the
 * site styles and every chart rendered with `theme="auto"`.
 */
export type SiteTheme = 'light' | 'dark';

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

function current(): SiteTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function apply(theme: SiteTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  listeners.forEach((l) => l());
}

export function setSiteTheme(theme: SiteTheme): void {
  writeStored(theme);
  apply(theme);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current site theme; re-renders on change. */
export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, current, () => 'light');
}

/** Follows OS changes for visitors who never picked a theme explicitly. */
export function useFollowOsTheme(): void {
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readStored() === null) apply(osPrefersDark() ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
}

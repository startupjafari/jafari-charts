import { useCallback, useEffect, useState } from 'react';

/** Light, dark or follow the operating system. */
export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'jc-playground-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function stored(): ThemePreference | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

/** `?theme=light|dark` (used by the e2e suites) wins over the saved preference. */
export function initialThemePreference(): ThemePreference {
  const param = new URLSearchParams(location.search).get('theme');
  if (param === 'light' || param === 'dark') return param;
  return stored() ?? 'system';
}

function systemIsDark() {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches;
}

/** Puts `.dark` on <html>: the chrome tokens and the charts' `auto` theme both follow it. */
export function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && systemIsDark());
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(initialThemePreference);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system' || typeof matchMedia !== 'function') return;
    const mql = matchMedia(DARK_QUERY);
    const onChange = () => applyTheme('system');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [preference]);

  const change = useCallback((next: ThemePreference) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
    // An explicit choice replaces the `?theme=` override in the address.
    const url = new URL(location.href);
    if (url.searchParams.has('theme')) {
      url.searchParams.delete('theme');
      history.replaceState(history.state, '', url);
    }
  }, []);

  return [preference, change] as const;
}

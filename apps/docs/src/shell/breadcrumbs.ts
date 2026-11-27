import { useT } from '../i18n';
import { useLocation } from '../lib/router';
import { navigation } from '../nav';

export interface Crumb {
  /** Sidebar group the page belongs to (e.g. “Getting started”). */
  group: string | null;
  /** The page's own sidebar label. */
  page: string | null;
}

/** Where the current page sits in the sidebar: its group and label. */
export function useBreadcrumb(): Crumb {
  const t = useT();
  const { path } = useLocation();
  for (const g of navigation(t)) {
    const item = g.items.find((i) => i.to === path);
    if (item) return { group: g.title, page: item.label };
  }
  return { group: null, page: null };
}

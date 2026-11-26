import { CHARTS } from './docs/charts';
import type { ChartGroup } from './docs/types';
import type { Messages } from './i18n';

export interface NavItem {
  /** Language-neutral path. */
  to: string;
  label: string;
  /** Small badge (e.g. chart group). */
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Chart entries keep the component name in every language (it is what you import). */
const chartGroup = (group: ChartGroup): NavItem[] =>
  CHARTS.filter((c) => c.group === group).map((c) => ({
    to: `/charts/${c.slug}`,
    label: c.component,
  }));

/** Sidebar navigation in a language. Chart entries come from the chart registry. */
export function navigation(t: Messages): NavGroup[] {
  return [
    {
      title: t.nav.gettingStarted,
      items: [
        { to: '/', label: t.pages.home },
        { to: '/getting-started', label: t.pages.introduction },
        { to: '/installation', label: t.pages.installation },
        { to: '/quick-start', label: t.pages.quickStart },
      ],
    },
    {
      title: t.nav.charts,
      items: [{ to: '/charts', label: t.pages.allCharts }, ...chartGroup('Core')],
    },
    { title: t.nav.advancedCharts, items: chartGroup('Advanced') },
    { title: t.nav.professionalCharts, items: chartGroup('Professional') },
    {
      title: t.nav.guides,
      items: [
        { to: '/components', label: t.pages.components },
        { to: '/themes', label: t.pages.themes },
        { to: '/performance', label: t.pages.performance },
      ],
    },
    {
      title: t.nav.tools,
      items: [
        { to: '/playground', label: t.pages.playground },
        { to: '/examples', label: t.pages.examples },
      ],
    },
    {
      title: t.nav.reference,
      items: [
        { to: '/api', label: t.pages.api },
        { to: '/changelog', label: t.pages.changelog },
        { to: '/github', label: t.pages.github },
      ],
    },
  ].filter((g) => g.items.length > 0);
}

/** Flat, ordered list of pages (for previous/next links). */
export function pageOrder(t: Messages): NavItem[] {
  return navigation(t).flatMap((g) => g.items);
}

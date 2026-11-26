import { CHARTS } from './docs/charts';

export interface NavItem {
  to: string;
  label: string;
  /** Small badge (e.g. chart group). */
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const chartGroup = (group: 'Core' | 'Advanced' | 'Professional'): NavItem[] =>
  CHARTS.filter((c) => c.group === group).map((c) => ({
    to: `/charts/${c.slug}`,
    label: c.component,
  }));

/** Sidebar navigation. Chart entries come from the chart registry. */
export function navigation(): NavGroup[] {
  return [
    {
      title: 'Getting started',
      items: [
        { to: '/', label: 'Home' },
        { to: '/getting-started', label: 'Introduction' },
        { to: '/installation', label: 'Installation' },
        { to: '/quick-start', label: 'Quick start' },
      ],
    },
    {
      title: 'Charts',
      items: [{ to: '/charts', label: 'All charts' }, ...chartGroup('Core')],
    },
    { title: 'Advanced charts', items: chartGroup('Advanced') },
    { title: 'Professional charts', items: chartGroup('Professional') },
    {
      title: 'Guides',
      items: [
        { to: '/components', label: 'Components' },
        { to: '/themes', label: 'Themes' },
        { to: '/performance', label: 'Performance' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { to: '/playground', label: 'Playground' },
        { to: '/examples', label: 'Examples' },
      ],
    },
    {
      title: 'Reference',
      items: [
        { to: '/api', label: 'API reference' },
        { to: '/changelog', label: 'Changelog' },
        { to: '/github', label: 'GitHub' },
      ],
    },
  ].filter((g) => g.items.length > 0);
}

/** Flat, ordered list of pages (for previous/next links). */
export function pageOrder(): NavItem[] {
  return navigation().flatMap((g) => g.items);
}

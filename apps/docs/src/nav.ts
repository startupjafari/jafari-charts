import {
  Activity,
  BookOpen,
  Braces,
  CalendarDays,
  ChartArea,
  ChartBar,
  ChartColumn,
  ChartColumnBig,
  ChartColumnIncreasing,
  ChartColumnStacked,
  ChartLine,
  ChartNoAxesCombined,
  ChartPie,
  ChartRadar,
  ChartScatter,
  CircleDashed,
  Component,
  Donut,
  FlaskConical,
  Funnel,
  Gauge,
  GitBranch,
  Grid3x3,
  History,
  House,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Palette,
  Rocket,
  SquareSplitHorizontal,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { createElement, type ReactElement } from 'react';
import { CHARTS } from './docs/charts';
import type { ChartGroup } from './docs/types';
import type { Messages } from './i18n';

export interface NavItem {
  /** Language-neutral path. */
  to: string;
  label: string;
  icon: LucideIcon;
  /** Extra words the sidebar filter matches (chart titles in every language). */
  keywords?: string;
  /** Small badge (e.g. chart group). */
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** One icon per chart page: the sidebar reads as a catalogue, not a wall of names. */
const CHART_ICONS: Record<string, LucideIcon> = {
  'line-chart': ChartLine,
  'area-chart': ChartArea,
  'bar-chart': ChartColumn,
  'horizontal-bar-chart': ChartBar,
  'grouped-bar-chart': ChartColumnBig,
  'stacked-bar-chart': ChartColumnStacked,
  'donut-chart': Donut,
  'pie-chart': ChartPie,
  sparkline: Activity,
  'radial-progress-chart': CircleDashed,
  'heatmap-chart': Grid3x3,
  'radar-chart': ChartRadar,
  'scatter-chart': ChartScatter,
  'funnel-chart': Funnel,
  'treemap-chart': SquareSplitHorizontal,
  'gauge-chart': Gauge,
  'waterfall-chart': ChartColumnIncreasing,
  'combo-chart': ChartNoAxesCombined,
  'calendar-heatmap': CalendarDays,
  'stacked-area-chart': Layers,
};

export function chartIcon(slug: string): LucideIcon {
  return CHART_ICONS[slug] ?? ChartLine;
}

/** The chart's icon as an element (`<ChartIcon slug="line-chart" className="size-4" />`). */
export function ChartIcon({ slug, className }: { slug: string; className?: string }): ReactElement {
  return createElement(chartIcon(slug), { className, 'aria-hidden': true });
}

/** Chart entries keep the component name in every language (it is what you import). */
const chartGroup = (group: ChartGroup): NavItem[] =>
  CHARTS.filter((c) => c.group === group).map((c) => ({
    to: `/charts/${c.slug}`,
    label: c.component,
    icon: chartIcon(c.slug),
    keywords: `${c.title.en} ${c.title.ru} ${c.slug}`,
  }));

/** Sidebar navigation in a language. Chart entries come from the chart registry. */
export function navigation(t: Messages): NavGroup[] {
  return [
    {
      title: t.nav.gettingStarted,
      items: [
        { to: '/', label: t.pages.home, icon: House },
        { to: '/getting-started', label: t.pages.introduction, icon: BookOpen },
        { to: '/installation', label: t.pages.installation, icon: Package },
        { to: '/quick-start', label: t.pages.quickStart, icon: Rocket },
      ],
    },
    {
      title: t.nav.charts,
      items: [{ to: '/charts', label: t.pages.allCharts, icon: LayoutGrid }, ...chartGroup('Core')],
    },
    { title: t.nav.advancedCharts, items: chartGroup('Advanced') },
    { title: t.nav.professionalCharts, items: chartGroup('Professional') },
    {
      title: t.nav.guides,
      items: [
        { to: '/components', label: t.pages.components, icon: Component },
        { to: '/themes', label: t.pages.themes, icon: Palette },
        { to: '/performance', label: t.pages.performance, icon: Zap },
      ],
    },
    {
      title: t.nav.tools,
      items: [
        { to: '/playground', label: t.pages.playground, icon: FlaskConical },
        { to: '/examples', label: t.pages.examples, icon: LayoutDashboard },
      ],
    },
    {
      title: t.nav.reference,
      items: [
        { to: '/api', label: t.pages.api, icon: Braces },
        { to: '/changelog', label: t.pages.changelog, icon: History },
        { to: '/github', label: t.pages.github, icon: GitBranch },
      ],
    },
  ].filter((g) => g.items.length > 0);
}

/** Flat, ordered list of pages (for previous/next links). */
export function pageOrder(t: Messages): NavItem[] {
  return navigation(t).flatMap((g) => g.items);
}

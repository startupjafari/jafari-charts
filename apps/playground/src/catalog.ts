import {
  ChartArea,
  ChartPie,
  ChartScatter,
  Download,
  Funnel,
  Gauge,
  GraduationCap,
  Grid3x3,
  LayoutDashboard,
  LayoutGrid,
  MousePointerClick,
  Radar,
  ZoomIn,
  type LucideIcon,
} from 'lucide-react';

export type SceneGroup = 'start' | 'charts' | 'behaviour' | 'performance';

export interface SceneInfo {
  /** `?scene=<id>`; matches the file name in ./scenes (case-insensitive). */
  id: string;
  title: string;
  /** One line: what the scene demonstrates. */
  summary: string;
  icon: LucideIcon;
  group: SceneGroup;
  /** Automated suites that open this scene (tests/e2e, benchmarks). */
  usedBy: readonly string[];
}

export const GROUPS: ReadonlyArray<{ id: SceneGroup; label: string; description: string }> = [
  { id: 'start', label: 'Start', description: '' },
  {
    id: 'charts',
    label: 'Chart types',
    description: 'Every chart family with realistic data, locales and edge cases.',
  },
  {
    id: 'behaviour',
    label: 'Behaviour',
    description: 'Pointer, keyboard and controlled state; exporting what is on screen.',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Timing harness used by the benchmark scripts.',
  },
];

export const SCENES: readonly SceneInfo[] = [
  {
    id: 'overview',
    title: 'Overview',
    summary: 'What this playground is, how to read it and where each scene leads.',
    icon: LayoutDashboard,
    group: 'start',
    usedBy: [],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    summary: 'Every cartesian chart: lines, areas, bars, stacks, combos, waterfalls, sparklines.',
    icon: ChartArea,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Interactions', 'Locale', 'Responsive', 'Touch'],
  },
  {
    id: 'polar',
    title: 'Polar',
    summary: 'Parts of a whole and progress: donut, pie, radial progress and gauges.',
    icon: ChartPie,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Locale', 'Responsive'],
  },
  {
    id: 'heatmap',
    title: 'Heatmap',
    summary: 'Matrix heatmaps and calendar heatmaps across scales, locales and sizes.',
    icon: Grid3x3,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Responsive'],
  },
  {
    id: 'treemap',
    title: 'Treemap',
    summary: 'Hierarchies as nested rectangles, from nested trees or flat rows, with drill-down.',
    icon: LayoutGrid,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Responsive'],
  },
  {
    id: 'scatter',
    title: 'Scatter',
    summary: 'Correlation between two measures: groups, bubbles, log scales and 10,000 points.',
    icon: ChartScatter,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Responsive'],
  },
  {
    id: 'radar',
    title: 'Radar',
    summary: 'Profiles across several metrics: polygon and circle grids, negatives, long labels.',
    icon: Radar,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Responsive'],
  },
  {
    id: 'funnel',
    title: 'Funnel',
    summary: 'Conversion between stages: bars, trapezoids, horizontal layouts and edge cases.',
    icon: Funnel,
    group: 'charts',
    usedBy: ['Visual', 'Accessibility', 'Responsive'],
  },
  {
    id: 'universities',
    title: 'Long labels',
    summary: 'Long Russian university names: wrapped labels, a highlighted bar, integer ticks.',
    icon: GraduationCap,
    group: 'charts',
    usedBy: [],
  },
  {
    id: 'interactions',
    title: 'Interactions',
    summary: 'Tooltip, zoom, brush and controlled state reported back through callbacks.',
    icon: MousePointerClick,
    group: 'behaviour',
    usedBy: ['Interactions', 'Accessibility'],
  },
  {
    id: 'zoom',
    title: 'Zoom & brush',
    summary: 'Zoom, pan and selection on every chart type, from the pointer, keyboard or props.',
    icon: ZoomIn,
    group: 'behaviour',
    usedBy: ['Zoom', 'Accessibility'],
  },
  {
    id: 'export',
    title: 'Export',
    summary: 'Save a rendered chart as SVG, PNG or WebP, or its data as CSV.',
    icon: Download,
    group: 'behaviour',
    usedBy: ['Export'],
  },
  {
    id: 'bench',
    title: 'Benchmark',
    summary: 'Time mount, update, streaming and hover on large datasets in this browser.',
    icon: Gauge,
    group: 'performance',
    usedBy: ['Benchmarks'],
  },
];

export const DEFAULT_SCENE = 'overview';

export function sceneInfo(id: string): SceneInfo {
  return SCENES.find((s) => s.id === id) ?? (SCENES[0] as SceneInfo);
}

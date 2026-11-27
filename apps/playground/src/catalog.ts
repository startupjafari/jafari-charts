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
} from './ui/icons';

export type SceneGroup = 'start' | 'charts' | 'behaviour' | 'performance';

/** Automated suites (badge names are in `messages.suites`). */
export type Suite =
  | 'visual'
  | 'a11y'
  | 'interactions'
  | 'locale'
  | 'responsive'
  | 'touch'
  | 'zoom'
  | 'export'
  | 'benchmarks';

export type SceneId =
  | 'overview'
  | 'gallery'
  | 'polar'
  | 'heatmap'
  | 'treemap'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'universities'
  | 'interactions'
  | 'zoom'
  | 'export'
  | 'bench';

/**
 * A scene of the playground. Its title and one-line summary are interface texts:
 * `messages.scenes[id]` in `src/i18n` (every language).
 */
export interface SceneInfo {
  /** `?scene=<id>`; matches the file name in ./scenes (case-insensitive). */
  id: SceneId;
  icon: LucideIcon;
  group: SceneGroup;
  /** Automated suites that open this scene (tests/e2e, benchmarks). */
  usedBy: readonly Suite[];
}

/** Navigation groups in order; labels and descriptions are in `messages.groups`. */
export const GROUPS: readonly SceneGroup[] = ['start', 'charts', 'behaviour', 'performance'];

export const SCENES: readonly SceneInfo[] = [
  {
    id: 'overview',
    icon: LayoutDashboard,
    group: 'start',
    usedBy: [],
  },
  {
    id: 'gallery',
    icon: ChartArea,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'interactions', 'locale', 'responsive', 'touch'],
  },
  {
    id: 'polar',
    icon: ChartPie,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'locale', 'responsive'],
  },
  {
    id: 'heatmap',
    icon: Grid3x3,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'responsive'],
  },
  {
    id: 'treemap',
    icon: LayoutGrid,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'responsive'],
  },
  {
    id: 'scatter',
    icon: ChartScatter,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'responsive'],
  },
  {
    id: 'radar',
    icon: Radar,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'responsive'],
  },
  {
    id: 'funnel',
    icon: Funnel,
    group: 'charts',
    usedBy: ['visual', 'a11y', 'responsive'],
  },
  {
    id: 'universities',
    icon: GraduationCap,
    group: 'charts',
    usedBy: [],
  },
  {
    id: 'interactions',
    icon: MousePointerClick,
    group: 'behaviour',
    usedBy: ['interactions', 'a11y'],
  },
  {
    id: 'zoom',
    icon: ZoomIn,
    group: 'behaviour',
    usedBy: ['zoom', 'a11y'],
  },
  {
    id: 'export',
    icon: Download,
    group: 'behaviour',
    usedBy: ['export'],
  },
  {
    id: 'bench',
    icon: Gauge,
    group: 'performance',
    usedBy: ['benchmarks'],
  },
];

export const DEFAULT_SCENE: SceneId = 'overview';

export function isSceneId(id: string): id is SceneId {
  return SCENES.some((s) => s.id === id);
}

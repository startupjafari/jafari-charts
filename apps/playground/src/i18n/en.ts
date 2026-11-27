import type { SceneGroup, SceneId, Suite } from '../catalog';
import { enPlural } from './plural';

/**
 * English interface strings shared by the shell and several scenes. Its shape is the
 * `Messages` type: `ru.ts` and `kk.ts` must provide every key, or the build fails.
 *
 * Card titles, descriptions and hints that only one scene uses live next to that scene
 * (`defineCards({ en, ru, kk })` and an `L<…>` object), see `./index.tsx`.
 */
export const en = {
  app: {
    name: 'Jafari Charts',
    /** Caption under the logo. */
    product: 'Playground',
    /** `document.title` without a scene. */
    title: 'Jafari Charts Playground',
    documentTitle: (scene: string) => `${scene} · Jafari Charts Playground`,
    description: 'Jafari Charts playground: every chart type, interaction and export in one place.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    navigation: 'Navigation',
    navigationDescription: 'Choose a scene and adjust the preview settings.',
    scenes: 'Scenes',
    hints: 'How to interact',
  },
  preview: {
    heading: 'Preview',
    language: 'Interface language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    locale: 'Number & date locale',
    /** Chart locale option that follows the interface language. */
    localeAuto: 'Same as interface',
    animation: 'Entry animations',
  },
  groups: {
    start: { label: 'Start', description: '' },
    charts: {
      label: 'Chart types',
      description: 'Every chart family with realistic data, locales and edge cases.',
    },
    behaviour: {
      label: 'Behaviour',
      description: 'Pointer, keyboard and controlled state; exporting what is on screen.',
    },
    performance: {
      label: 'Performance',
      description: 'Timing harness used by the benchmark scripts.',
    },
  } satisfies Record<SceneGroup, { label: string; description: string }>,
  scenes: {
    overview: {
      title: 'Overview',
      summary: 'What this playground is, how to read it and where each scene leads.',
    },
    gallery: {
      title: 'Gallery',
      summary: 'Every cartesian chart: lines, areas, bars, stacks, combos, waterfalls, sparklines.',
    },
    polar: {
      title: 'Polar',
      summary: 'Parts of a whole and progress: donut, pie, radial progress and gauges.',
    },
    heatmap: {
      title: 'Heatmap',
      summary: 'Matrix heatmaps and calendar heatmaps across scales, locales and sizes.',
    },
    treemap: {
      title: 'Treemap',
      summary: 'Hierarchies as nested rectangles, from nested trees or flat rows, with drill-down.',
    },
    scatter: {
      title: 'Scatter',
      summary: 'Correlation between two measures: groups, bubbles, log scales and 10,000 points.',
    },
    radar: {
      title: 'Radar',
      summary: 'Profiles across several metrics: polygon and circle grids, negatives, long labels.',
    },
    funnel: {
      title: 'Funnel',
      summary: 'Conversion between stages: bars, trapezoids, horizontal layouts and edge cases.',
    },
    universities: {
      title: 'Long labels',
      summary: 'Long Russian university names: wrapped labels, a highlighted bar, integer ticks.',
    },
    interactions: {
      title: 'Interactions',
      summary: 'Tooltip, zoom, brush and controlled state reported back through callbacks.',
    },
    zoom: {
      title: 'Zoom & brush',
      summary: 'Zoom, pan and selection on every chart type, from the pointer, keyboard or props.',
    },
    export: {
      title: 'Export',
      summary: 'Save a rendered chart as SVG, PNG or WebP, or its data as CSV.',
    },
    bench: {
      title: 'Benchmark',
      summary: 'Time mount, update, streaming and hover on large datasets in this browser.',
    },
  } satisfies Record<SceneId, { title: string; summary: string }>,
  /** Badges on the overview: which automated suites open a scene. */
  suites: {
    visual: 'Visual',
    a11y: 'Accessibility',
    interactions: 'Interactions',
    locale: 'Locale',
    responsive: 'Responsive',
    touch: 'Touch',
    zoom: 'Zoom',
    export: 'Export',
    benchmarks: 'Benchmarks',
  } satisfies Record<Suite, string>,
  notFound: {
    title: 'Scene not found',
    subtitle: (scene: string) => `There is no scene called “${scene}”.`,
    emptyTitle: 'Nothing to show here',
    emptyDescription: 'Pick a scene in the navigation, or open ?scene=overview.',
  },
  sections: {
    showcase: 'Showcase',
    edgeCases: 'Edge cases',
    chartCount: (n: number) => `${n} ${enPlural(n, ['chart', 'charts'])}`,
  },
  filter: {
    label: 'Show',
    all: 'All',
    showcase: 'Showcase',
    edge: 'Edge cases',
  },
  /** Interaction hints shared by several scenes. */
  hints: {
    legendSeries: 'Click legend items to hide series',
    doubleClickResets: 'Double-click resets',
  },
  controls: {
    renderer: 'Renderer',
    presets: 'Presets',
  },
  /** Shared control texts (StudentHub `Common`). */
  common: {
    /** An open select with no options. */
    empty: 'Empty',
  },
  /** Live read-outs in card footers (the English values are what the e2e suites expect). */
  readout: {
    full: 'full',
    all: 'all',
    root: 'root',
    none: 'none',
  },
};

export type Messages = typeof en;

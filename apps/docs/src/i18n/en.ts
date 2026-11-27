import type { ChartGroup } from '../docs/types';

/**
 * English UI strings shared across the site (header, navigation, page titles,
 * example and code panels, tables, accessibility labels). Its shape is the
 * `Messages` type every other language must implement in full.
 *
 * Long page bodies are not here: each page keeps its prose next to its markup
 * as an `L<…>` object (see I18N.md).
 */
export const en = {
  langName: 'English',
  meta: {
    description:
      'Jafari Charts — engineered for performance. Beautiful charts. Zero compromise. A from-scratch React charting library.',
    tagline: 'Engineered for performance. Beautiful charts. Zero compromise.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    home: 'Jafari Charts home',
    primaryNav: 'Primary',
    docsNav: 'Documentation',
    sidebar: 'Sidebar',
    prevNext: 'Previous and next page',
    onThisPage: 'On this page',
    language: 'Language',
    breadcrumb: 'Breadcrumb',
    backToTop: 'Back to top',
    sectionLink: (title: string) => `Link to “${title}”`,
  },
  /** Colour theme switch in the top bar. */
  theme: {
    label: 'Colour theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  /** Select lists (shown when a list has no options). */
  select: {
    empty: 'Empty',
  },
  /** Sidebar filter. */
  search: {
    label: 'Filter pages',
    placeholder: 'Filter pages…',
    clear: 'Clear filter',
    empty: (query: string) => `No pages match “${query}”.`,
    results: (count: number) => (count === 1 ? '1 page' : `${count} pages`),
  },
  top: {
    docs: 'Docs',
    charts: 'Charts',
    playground: 'Playground',
    examples: 'Examples',
    performance: 'Performance',
  },
  nav: {
    gettingStarted: 'Getting started',
    charts: 'Charts',
    advancedCharts: 'Advanced charts',
    professionalCharts: 'Professional charts',
    guides: 'Guides',
    tools: 'Tools',
    reference: 'Reference',
  },
  /** Page names: sidebar entries, document titles, previous/next links. */
  pages: {
    home: 'Home',
    introduction: 'Introduction',
    installation: 'Installation',
    quickStart: 'Quick start',
    charts: 'Charts',
    allCharts: 'All charts',
    components: 'Components',
    themes: 'Themes',
    performance: 'Performance',
    playground: 'Playground',
    examples: 'Examples',
    api: 'API reference',
    changelog: 'Changelog',
    github: 'GitHub',
    notFound: 'Page not found',
  },
  pager: { previous: 'Previous', next: 'Next' },
  chartPage: {
    whenToUse: 'When to use it',
    import: 'Import',
    install: 'Install',
  },
  footer: {
    rendered:
      'Every chart on this site is rendered with Jafari Charts. © Mehman Jafari · MIT (proposed).',
  },
  chartGroups: {
    Core: 'Core',
    Advanced: 'Advanced',
    Professional: 'Professional',
  } satisfies Record<ChartGroup, string>,
  /** Eyebrow above a chart page title. */
  chartEyebrow: (group: ChartGroup, _title: string) => `${group} chart`,
  example: {
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    widthFill: 'Fill',
    previewTheme: (title: string) => `Preview theme for ${title}`,
    previewWidth: (title: string) => `Preview width for ${title}`,
    preview: 'Preview',
    code: 'Code',
    views: (title: string) => `${title}: preview or code`,
    showCode: 'Show code',
    hideCode: 'Hide code',
    loadingCode: 'Loading code…',
  },
  code: {
    files: 'Files',
    code: 'Code',
    codeOf: (name: string) => `Code: ${name}`,
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
  },
  propsTable: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    required: 'required',
    requiredTitle: 'Required',
    none: 'none',
  },
  /** Error boundary texts. Subjects are passed to `failed` as they read in the sentence. */
  errors: {
    failed: (subject: string) => `${subject} could not be rendered.`,
    page: 'This page',
    thisExample: 'This example',
    example: (title: string) => title,
    chart: 'The chart',
    code: 'The source code',
  },
};

export type Messages = typeof en;

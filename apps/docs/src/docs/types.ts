import type { ComponentType, ReactNode } from 'react';
import type { L } from '../i18n/lang';
import type { PropDef } from '../ui/PropsTable';
import type { PreviewWidth } from '../ui/Example';

/**
 * Chart pages are data. Everything a reader sees is an `L<…>` value with a
 * version per site language; identifiers (slug, component, example ids, keys,
 * prop names and types) are language-neutral.
 */

export type ChartGroup = 'Core' | 'Advanced' | 'Professional';

export interface ExampleRef {
  /** `<group>/<FileName>` under `src/examples/`. */
  id: string;
  title: L<string>;
  description?: L<ReactNode>;
  width?: PreviewWidth;
}

/** Standard sections every chart page has, in this order. */
export type ChartSectionId = 'usage' | 'styling' | 'interaction' | 'responsive' | 'empty';

export interface PropGroup {
  title: L<string>;
  /** Short note shown above the table (backticks become inline code). */
  note?: L<ReactNode>;
  props: readonly PropDef[];
  /** Collapsed by default (shared props repeated on many pages). */
  collapsed?: boolean;
}

/** A keyboard shortcut: `[keys, action]`, keys separated by spaces. */
export type KeyBinding = readonly [string, L<string>];

export interface ChartDoc {
  /** URL segment: `#/charts/<slug>`. */
  slug: string;
  /** Exported component name, e.g. `LineChart`. */
  component: string;
  /** Human title, e.g. `Line chart`. */
  title: L<string>;
  group: ChartGroup;
  /** One sentence for cards and the page lead. */
  summary: L<string>;
  /** Longer introduction (when to use it, how it behaves by default). */
  description: L<ReactNode>;
  /** Small non-interactive preview for the charts index. */
  thumbnail: ComponentType;
  sections: Record<ChartSectionId, readonly ExampleRef[]>;
  /** Extra text per section (shown under the section heading). */
  sectionNotes?: Partial<Record<ChartSectionId, L<ReactNode>>>;
  /** Keyboard model. */
  keyboard: readonly KeyBinding[];
  props: readonly PropGroup[];
}

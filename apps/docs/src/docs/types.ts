import type { ComponentType, ReactNode } from 'react';
import type { PropDef } from '../ui/PropsTable';
import type { PreviewWidth } from '../ui/Example';

export interface ExampleRef {
  /** `<group>/<FileName>` under `src/examples/`. */
  id: string;
  title: string;
  description?: ReactNode;
  width?: PreviewWidth;
}

/** Standard sections every chart page has, in this order. */
export type ChartSectionId = 'usage' | 'styling' | 'interaction' | 'responsive' | 'empty';

export interface PropGroup {
  title: string;
  /** Short note shown above the table. */
  note?: ReactNode;
  props: readonly PropDef[];
  /** Collapsed by default (shared props repeated on many pages). */
  collapsed?: boolean;
}

export interface ChartDoc {
  /** URL segment: `#/charts/<slug>`. */
  slug: string;
  /** Exported component name, e.g. `LineChart`. */
  component: string;
  /** Human title, e.g. `Line chart`. */
  title: string;
  group: 'Core' | 'Advanced' | 'Professional';
  /** One sentence for cards and the page lead. */
  summary: string;
  /** Longer introduction (when to use it, how it behaves by default). */
  description: ReactNode;
  /** Small non-interactive preview for the charts index. */
  thumbnail: ComponentType;
  sections: Record<ChartSectionId, readonly ExampleRef[]>;
  /** Extra text per section (shown under the section heading). */
  sectionNotes?: Partial<Record<ChartSectionId, ReactNode>>;
  /** Keyboard model: [keys, action]. */
  keyboard: readonly (readonly [string, string])[];
  props: readonly PropGroup[];
}

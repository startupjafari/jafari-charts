/** Keyboard models shown on chart pages, as `[keys, action]` (keys separated by spaces). */
export const CARTESIAN_KEYS = [
  ['← →', 'Previous / next data point (values are announced)'],
  ['↑ ↓', 'Previous / next series at the same point'],
  ['Home End', 'First / last point'],
  ['Enter', 'Click the active point (onClick)'],
  ['Esc', 'Clear the active point'],
] as const;

export const ZOOM_KEYS = [
  ['+ −', 'Zoom in / out (with zoom enabled)'],
  ['0', 'Reset zoom'],
] as const;

export const ITEM_KEYS = [
  ['← → ↑ ↓', 'Previous / next item'],
  ['Home End', 'First / last item'],
  ['Enter', 'Click the active item (onClick)'],
  ['Esc', 'Clear the active item'],
] as const;

import type { KeyBinding } from './types';

/** Keyboard models shown on chart pages, as `[keys, action]` (keys separated by spaces). */
export const CARTESIAN_KEYS: readonly KeyBinding[] = [
  [
    '← →',
    {
      en: 'Previous / next data point (values are announced)',
      ru: 'Предыдущая / следующая точка данных (значения озвучиваются)',
    },
  ],
  [
    '↑ ↓',
    {
      en: 'Previous / next series at the same point',
      ru: 'Предыдущий / следующий ряд в той же точке',
    },
  ],
  ['Home End', { en: 'First / last point', ru: 'Первая / последняя точка' }],
  ['Enter', { en: 'Click the active point (onClick)', ru: 'Нажатие на активную точку (onClick)' }],
  ['Esc', { en: 'Clear the active point', ru: 'Сбросить активную точку' }],
];

export const ZOOM_KEYS: readonly KeyBinding[] = [
  [
    '+ −',
    {
      en: 'Zoom in / out (with zoom enabled)',
      ru: 'Увеличить / уменьшить масштаб (при включённом zoom)',
    },
  ],
  ['0', { en: 'Reset zoom', ru: 'Сбросить масштаб' }],
];

export const ITEM_KEYS: readonly KeyBinding[] = [
  ['← → ↑ ↓', { en: 'Previous / next item', ru: 'Предыдущий / следующий элемент' }],
  ['Home End', { en: 'First / last item', ru: 'Первый / последний элемент' }],
  ['Enter', { en: 'Click the active item (onClick)', ru: 'Нажатие на активный элемент (onClick)' }],
  ['Esc', { en: 'Clear the active item', ru: 'Сбросить активный элемент' }],
];

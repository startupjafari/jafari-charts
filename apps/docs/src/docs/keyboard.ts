import type { KeyBinding } from './types';

/** Keyboard models shown on chart pages, as `[keys, action]` (keys separated by spaces). */
export const CARTESIAN_KEYS: readonly KeyBinding[] = [
  [
    '← →',
    {
      en: 'Previous / next data point (values are announced)',
      ru: 'Предыдущая / следующая точка данных (значения озвучиваются)',
      kk: 'Алдыңғы / келесі деректер нүктесі (мәндер дауыстап оқылады)',
    },
  ],
  [
    '↑ ↓',
    {
      en: 'Previous / next series at the same point',
      ru: 'Предыдущий / следующий ряд в той же точке',
      kk: 'Сол нүктедегі алдыңғы / келесі қатар',
    },
  ],
  [
    'Home End',
    { en: 'First / last point', ru: 'Первая / последняя точка', kk: 'Бірінші / соңғы нүкте' },
  ],
  [
    'Enter',
    {
      en: 'Click the active point (onClick)',
      ru: 'Нажатие на активную точку (onClick)',
      kk: 'Белсенді нүктені басу (onClick)',
    },
  ],
  [
    'Esc',
    {
      en: 'Clear the active point',
      ru: 'Сбросить активную точку',
      kk: 'Белсенді нүктені алып тастау',
    },
  ],
];

export const ZOOM_KEYS: readonly KeyBinding[] = [
  [
    '+ −',
    {
      en: 'Zoom in / out (with zoom enabled)',
      ru: 'Увеличить / уменьшить масштаб (при включённом zoom)',
      kk: 'Масштабты үлкейту / кішірейту (zoom қосулы болса)',
    },
  ],
  ['0', { en: 'Reset zoom', ru: 'Сбросить масштаб', kk: 'Масштабты қалпына келтіру' }],
];

export const ITEM_KEYS: readonly KeyBinding[] = [
  [
    '← → ↑ ↓',
    {
      en: 'Previous / next item',
      ru: 'Предыдущий / следующий элемент',
      kk: 'Алдыңғы / келесі элемент',
    },
  ],
  [
    'Home End',
    { en: 'First / last item', ru: 'Первый / последний элемент', kk: 'Бірінші / соңғы элемент' },
  ],
  [
    'Enter',
    {
      en: 'Click the active item (onClick)',
      ru: 'Нажатие на активный элемент (onClick)',
      kk: 'Белсенді элементті басу (onClick)',
    },
  ],
  [
    'Esc',
    {
      en: 'Clear the active item',
      ru: 'Сбросить активный элемент',
      kk: 'Белсенді элементті алып тастау',
    },
  ],
];

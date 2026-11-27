// One size scale for interactive controls, ported from StudentHub (`shared/ui/control-size.ts`).
//
// Exactly four sizes per component — sm/md/lg/xl — and the same height for every control of
// a size: a button, a field and a select in one row line up without extra classes. Width
// comes from the content; controls only set height and padding.
//
// Heights: sm 2rem · md 2.25rem · lg 2.5rem · xl 2.75rem.
// `lg` is the default; `md` for dense rows (headers, toolbars), `sm` for table rows and
// chips, `xl` for large forms and primary buttons on empty screens.
export type ControlSize = 'sm' | 'md' | 'lg' | 'xl';

export const CONTROL_SIZES: ControlSize[] = ['sm', 'md', 'lg', 'xl'];

// Inline-content controls (button, menu trigger): height + padding + icon size.
export const CONTROL_SIZE: Record<ControlSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
  md: "h-9 gap-2 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
  lg: "h-10 gap-2 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
  xl: "h-11 gap-2 px-5 text-base [&_svg:not([class*='size-'])]:size-4",
};

// Icon controls: a square of the scale's height, no horizontal padding.
export const CONTROL_SQUARE: Record<ControlSize, string> = {
  sm: "size-8 gap-0 px-0 [&_svg:not([class*='size-'])]:size-4",
  md: "size-9 gap-0 px-0 [&_svg:not([class*='size-'])]:size-4",
  lg: "size-10 gap-0 px-0 [&_svg:not([class*='size-'])]:size-4",
  xl: "size-11 gap-0 px-0 [&_svg:not([class*='size-'])]:size-5",
};

// Fields and selects: the same heights, their own padding and `text-base` on phones
// (otherwise iOS zooms the page on focus), shrinking to `text-sm` from md.
export const FIELD_SIZE: Record<ControlSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-3.5 text-base md:text-sm',
  xl: 'h-11 px-3.5 text-base md:text-sm',
};

// Multi-line field: the content sets the height, the scale sets the minimum.
export const AREA_SIZE: Record<ControlSize, string> = {
  sm: 'min-h-16 px-3 py-2 text-sm',
  md: 'min-h-20 px-3 py-2 text-sm',
  lg: 'min-h-24 px-3.5 py-2.5 text-base md:text-sm',
  xl: 'min-h-32 px-3.5 py-3 text-base md:text-sm',
};

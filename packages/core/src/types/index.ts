/** A pair of numbers `[min, max]` (or `[start, end]` for ranges). */
export type Extent = readonly [number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Any value that can appear on a continuous or categorical axis. */
export type AxisValue = number | string | Date;

/** Raw values the data layer accepts for numeric fields. Invalid ones become gaps. */
export type RawNumeric = number | string | bigint | Date | null | undefined;

/** Keys of `T` whose values are assignable to `V` (ignoring null/undefined). */
export type KeysMatching<T, V> = {
  [K in keyof T]-?: NonNullable<T[K]> extends V ? K : never;
}[keyof T] &
  string;

/** Keys of `T` that hold numbers (optionally nullable). */
export type NumericKey<T> = KeysMatching<T, number>;

/** Keys of `T` usable as the x / category dimension. */
export type DimensionKey<T> = KeysMatching<T, AxisValue>;

export type Orientation = 'vertical' | 'horizontal';

export type Locale = 'en' | 'ru' | 'kk' | (string & {});
